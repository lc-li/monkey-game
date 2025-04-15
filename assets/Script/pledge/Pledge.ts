import BaseDialog from "../tool/BaseDialog";
import GameData from "../tool/GameData";
import GameEvent from "../tool/GameEvent";
import GameGlobal from "../tool/GameGlobal";
import GameHttp from "../tool/GameHttp";
import GameUI from "../tool/GameUI";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import GameWeb from "../tool/GameWeb";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Pledge extends BaseDialog {

    @property(cc.Label)
    allNum: cc.Label = null;

    @property(cc.Label)
    pledgeNum: cc.Label = null;

    @property(cc.Label)
    goldTime: cc.Label = null;

    @property(cc.Label)
    goldNum: cc.Label = null;

    @property(cc.Label)
    baycNum: cc.Label = null;

    @property(cc.Label)
    walletCode: cc.Label = null;

    init(base: any, data: any) {
        super.init(base, data);
        //请求数据
        this.requestGoldData();
    }

    onLoad() {
        super.onLoad();
        this.initUI();
    }

    onDestroy() {
        super.onDestroy();
    }

    /**
     * 请求数据
     */
    async requestGoldData() {
        this.goldTime.string = `(${GameData.instance.pledgeData.pledgeNum}/H)`;
        this.goldNum.string = GameUtils.instance.getShowDiamond(GameData.instance.pledgeData.goldNum);
        // this.pledgeNum.string = GameData.instance.pledgeData.pledgeNum;
        GameData.instance.requestPledgeData(1, () => {
            if (!cc.isValid(this.node)) return;
            this.goldTime.string = `(${GameData.instance.pledgeData.pledgeNum}/H)`;
            this.goldNum.string = GameUtils.instance.getShowDiamond(GameData.instance.pledgeData.goldNum);
            // this.pledgeNum.string = GameData.instance.pledgeData.pledgeNum;
            this.numRollAnim(this.pledgeNum, GameData.instance.pledgeData.pledgeNum);
        });
    }

    initUI() {
        //猴币
        let totalMoney = GameData.instance.getTotalMoneyNum();
        this.baycNum.string = GameUtils.instance.getShowDiamond(totalMoney);
        //钱包地址
        let code = GameUtils.instance.getPlayNickName(GameData.instance.tonAddress, 10);
        this.walletCode.string = code;

        if (GameData.instance.isShowPledgeRule) GameUI.instance.showDialog('ui/pledge/PledgeRule', 'PledgeRule', this);
    }

    onBtnClick(event: { target: { name: any; }; }, customEventData: any) {
        let name = event.target.name;
        switch (name) {
            case 'btn_close'://关闭
                this.close();
                break;
            case 'btn_help'://帮助
                GameUI.instance.showDialog('ui/pledge/PledgeRule', 'PledgeRule', this);
                break;
            case 'btn_pledge'://质押
                let earnUrl = 'https://t.me/uptonfi_bot/uptonfi_bot_web';
                GameWeb.instance.openLink(earnUrl);
                break;
            case 'btn_speed'://加速
                let isOpenAccelerate = GameData.instance.isOpenAccelerate;
                if (!isOpenAccelerate) {
                    GameUI.instance.showDialog('ui/earning/Earnings', 'Earnings', this, false, { type: 3 });
                } else {
                    let earnUrl = 'https://t.me/uptonfi_bot/uptonfi_bot_web';
                    GameWeb.instance.openLink(earnUrl);
                }
                break;
            case 'btn_bonus'://猴币
                //直接跳转到福利任务界面
                let canvas = cc.director.getScene().getChildByName('Canvas');
                let mainTS = canvas.getComponent('Main');
                mainTS.onToggleEvent({ 'node': { 'name': 'toggle1' } }, false);
                break;
            case 'btn_copy'://复制
                GameUI.instance.copyToClipboard(GameData.instance.tonAddress);
                break;
            default:
                break;
        }
    }

    /**
     * 数字滚动动画(从0到目标num)
     * @param {cc.Label} animLab 动画文本
     * @param {number} target 目标数字
     */
    numRollAnim(animLab: cc.Label, target: number) {
        if (!animLab || !cc.isValid(animLab.node) || 0 >= target) return;

        let startScore = 0;
        let scoreDifference = target - startScore;
        let elapsedTime = 0;
        //动画时间
        let duration = 1;
        if (target <= 10) {
            duration = 0.5;
        } else if (target <= 100) {
            duration = 1;
        } else {
            duration = 2;
        }

        this.schedule((dt: number) => {
            elapsedTime += dt;
            let progress = Math.min(elapsedTime / duration, 1);
            let newScore = startScore + Math.floor(scoreDifference * progress);
            animLab.string = newScore.toString();

            if (progress === 1) {
                this.unscheduleAllCallbacks(); // 动画完成后停止更新
                // 使用 cc.tween 创建一个重复三次的放大缩小动画
                let scaleTime = 0.3;
                cc.tween(animLab.node)
                    .repeat(3, // 重复三次
                        cc.tween()
                            .to(scaleTime, { scale: 1.5 }) // 放大
                            .to(scaleTime, { scale: 1 }) // 缩小回原始大小
                    )
                    .start();
            }
        }, 0);

    }


    //关闭
    close() {
        this.node.destroy();
        GameEvent.instance.dispatchEvent(GameEvent.UPDATE_TOGGLE_PAGE);
    }
}
