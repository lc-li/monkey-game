import GameData, { MONEY_GET_CHANNEL } from "../tool/GameData";
import GameGlobal from "../tool/GameGlobal";
import GameHttp from "../tool/GameHttp";
import GameUI from "../tool/GameUI";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import GameWeb from "../tool/GameWeb";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskBasicItem extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null;//任务名称

    @property(cc.Sprite)
    taskIcon: cc.Sprite = null;//任务icon

    @property(cc.Sprite)
    rewardIcon: cc.Sprite = null;//奖励icon

    @property(cc.SpriteFrame)
    rewardIconArr: cc.SpriteFrame[] = [];//奖励icon数组

    @property(cc.Label)
    num: cc.Label = null;//奖励数量

    @property(cc.Node)
    btn_go: cc.Node = null;//前往按钮

    @property(cc.Node)
    finishIcon: cc.Node = null;//完成icon

    /** 当前item的任务数据*/
    taskData: any = null;

    init(base: any, data: any) {
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, data);
        this.taskData = data;
        if (!this.taskData) return;
        this.initUI();
    }

    onLoad() {
    }

    /**
     * 初始化ui
     */
    initUI() {
        //设置完成标志
        let isFinish = this.taskData.state == 1;
        //标题
        this.title.string = this.taskData.name;
        //icon
        this.loadTaskSpriteFrame(this.taskIcon, this.taskData.taskIcon);

        //奖励icon (1:猴币 2:券 3:皮肤)
        this.rewardIcon.spriteFrame = this.rewardIconArr[this.taskData.rewardType - 1];
        //数量
        this.num.string = GameUtils.instance.getShowDiamond(this.taskData.score);
        //是否完成
        this.btn_go.active = !isFinish;
        this.finishIcon.active = isFinish;
    }

    /**
     * 前往
     */
    onBtnGo() {
        if (!this.taskData) return;
        //判断是否已完成
        if (this.taskData.state == 1) return;

        let canvas = cc.director.getScene().getChildByName('Canvas');
        let mainTS = canvas.getComponent('Main');

        //得到跳转链接
        let url = this.taskData.url;
        switch (this.taskData.id) {
            case 'task01'://邀请好友
                // const _url = `https://t.me/${GameWeb.instance.nn.bot}/${GameWeb.instance.nn.webapp}?startapp=${GameData.instance.myInviteCode}`;
                // const _text = GameWeb.instance.shareTxtConfig.text1;
                // url = `https://t.me/share/url?url=${_url}&text=${encodeURIComponent(_text)}`;
                //直接跳转到邀请界面

                mainTS.onToggleEvent({ 'node': { 'name': 'toggle4' } }, false);
                cc.find('toggle4', mainTS.bottomToggle).getComponent(cc.Toggle).isChecked = true;
                return;
            case 'task02'://Trade on GMGN
                break;
            case 'task03'://Trade on RushMeme
                break;
            case 'task04'://Earn in Upton Bank
                //跳转
                mainTS.onToggleEvent({ 'node': { 'name': 'toggle2' } }, false);
                cc.find('toggle2', mainTS.bottomToggle).getComponent(cc.Toggle).isChecked = true;
                //完成任务
                this.requestTaskComplete();
                return;
            case 'task1'://签到
                this.goToSignInTask();
                // GameUI.instance.showTiShi('tishi/label2');
                return;

            case 'task3'://关注推特
                break;
            case 'task4'://加入社区
                break;
            case 'task5'://狐狸钱包
                GameUI.instance.showTiShi('tishi/label2');
                return;
            default:
                break;
        }
        GameWeb.instance.openLink(url);
        if ('task01' == this.taskData.id) return;
        let completeType = this.taskData.completeType;
        switch (completeType) {
            case 1://默认完成
                //请求任务完成
                this.requestTaskComplete();
                break;
            default:
                break;
        }
    }

    /**
     * 前往签到任务
     */
    async goToSignInTask() {
        if (!GameWeb.instance.checkConnected()) {
            GameUI.instance.showDialog('ui/wallet/BindWallet', 'BindWallet', this);
            return;
        } else {
            if (!GameWeb.instance.nn.access_token_N) {//请求登录
                await GameWeb.instance.requestLoginN(async () => {
                    //请求签到
                    await this.requestChechIn();
                });
            } else {
                //请求签到
                await this.requestChechIn();
            }
        }
    }

    /**
     * 请求完成任务
     */
    requestTaskComplete() {
        const url = GameGlobal.httpPort.obtainTask;
        let sendData = {
            taskId: this.taskData.id,
            isRefresh: this.taskData.isRefresh,
        };
        GameHttp.instance.post(url, sendData,
            (res: any) => {
                res = JSON.parse(res);
                if (!res || 200 !== res.ret_code) return;

                let completeTask = res.data.completeTask;
                this.taskData.state = completeTask.state;

                //请求奖励
                if (1 == this.taskData.rewardType) {
                    //请求金币服务端数据
                    GameUI.instance.addFlyEffectEx(this.node, 1, 5);
                    GameData.instance.requestMoneyData(MONEY_GET_CHANNEL.CLICK_ONLINE);
                }

                let randomTime = GameUtils.instance.getRndInteger(1, 3);
                if ('task1' == this.taskData.id || 'task2' == this.taskData.id) randomTime = 0;
                this.scheduleOnce(() => {
                    //更新ui
                    this.initUI();

                }, randomTime);
            },
            (err: any) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
            }
        );
    }

    /**
     * 请求签到
     */
    async requestChechIn() {
        let res = await GameWeb.instance.checkIn();
        if (res) {
            // 签到成功
            //请求任务完成
            this.requestTaskComplete();
        } else {
            // 签到失败
        }
    }

    /**
     * 加载任务icon
     * @param {cc.Sprite} iconSprite icon 
     * @param {string} name 名称 
     */
    loadTaskSpriteFrame(iconSprite: cc.Sprite, name: string) {
        // iconSprite.spriteFrame = null;
        // GameUI.instance.loadSpriteFrame(iconSprite, `ui/task/${name}`, this.name);
        //加载远程资源服务器的icon
        let url = GameGlobal.DEBUG ? 'https://test.memepet.io' : 'https://www.uptongame.xyz';
        let taskUrl = `${url}/h5/monkey/images/resources/task/${name}.png`;
        cc.loader.load({ url: taskUrl, type: 'png' }, (err: any, texture: string | cc.Texture2D) => {
            if (!iconSprite || !cc.isValid(iconSprite.node) || err) return;
            iconSprite.spriteFrame = new cc.SpriteFrame(texture);
        });
    }
}
