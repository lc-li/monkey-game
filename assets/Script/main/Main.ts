import GameEvent from "../tool/GameEvent";
import GameGlobal from "../tool/GameGlobal";
import GameData, { MONEY_GET_CHANNEL } from "../tool/GameData";
import GameUI, { DIALOG_Z_INDEX } from "../tool/GameUI";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import GameAudio from "../tool/GameAudio";
import GamePublic from "../tool/GamePublic";
import GameTable from "../Table/GameTable";
import { IF_TB_Skin } from "../Table/GameCfgInterface";
import GameWeb from "../tool/GameWeb";
import GameHttp from "../tool/GameHttp";
const TB_Skin: IF_TB_Skin = GameTable.data.Skin;
const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    @property(cc.Node)
    clickBg: cc.Node = null;

    @property(cc.Node)
    topLayout: cc.Node = null;

    @property(cc.Node)
    btn_air: cc.Node = null;//空投按钮

    @property(cc.Node)
    centerLayout: cc.Node = null;//弹窗有层级要求的父节点

    @property(cc.Sprite)
    head: cc.Sprite = null;//头像

    @property(cc.Label)
    nickName: cc.Label = null;//昵称

    @property(cc.Label)
    level: cc.Label = null;//等级

    @property(cc.ProgressBar)
    levelPregress: cc.ProgressBar = null;//等级进度

    @property(cc.Label)
    upLevelRate: cc.Label = null;//当前等级进度

    @property(cc.Label)
    profitNum: cc.Label = null;//盈利

    @property(cc.Label)
    goldNum: cc.Label = null;//金积分

    @property(cc.Label)
    money: cc.Label = null;//金币

    @property(sp.Skeleton)
    spineMonkey: sp.Skeleton = null;//猴子动画

    @property(cc.Sprite)
    shadowDog: cc.Sprite = null;//狗阴影

    @property(cc.Sprite)
    shadowMonkey: cc.Sprite = null;//猴子阴影

    @property(cc.Label)
    angerTime: cc.Label = null;//怒气回复

    @property(cc.ProgressBar)
    angerProgress: cc.ProgressBar = null;//怒气进度

    @property(cc.Label)
    angerRate: cc.Label = null;//怒气进度

    @property(sp.Skeleton)
    angerSpine1: sp.Skeleton = null;//怒气动画1

    @property(sp.Skeleton)
    angerSpine2: sp.Skeleton = null;//怒气动画2

    @property(cc.Node)
    bottomToggle: cc.Node = null;//底部toggle

    @property(cc.Prefab)
    flyEffect: cc.Prefab = null;//飞动画节点

    /** 上一次点击的时间*/
    lastClickTime: number = 0;

    /** start动画是否播放完毕*/
    startAnimFinish: boolean = true;

    /** 待机动画播放的指定次数*/
    ANIM_LOOP_COUNT: number = 2;
    /** 待机动画数据*/
    standAnimData: any = {
        /** 待机动画名称*/
        standAnimName: 'loop_1',
        /** 待机动画次数*/
        animNum: this.ANIM_LOOP_COUNT,
    };

    /** 1s计时器 */
    oneSecondTimer: Function = null;
    /** 5s计时器 */
    fiveSecondTimer: Function = null;

    /** 怒气值动画是否播放完成*/
    angerAnimComplete: boolean = true;

    onLoad() {
        this.addEvent();
        //预加载一个加载界面
        GameUI.instance.showDialog('public/PopLoading', 'PopLoading', this);
        //GM
        cc.find('btn_gm', this.topLayout).active = GameGlobal.DEBUG;

        //更新玩家信息
        this.updatePlayerUI();
        //更新金币
        this.updateMoneyUI();
        //更新金积分
        this.updateGoldUI();
        //更新怒气ui
        this.updateAngerUI();
        //更新空投按钮ui
        this.updateAirBoxUI();
        //更新穿戴的皮肤
        this.updateWearSkin();
    }

    onDestroy() {
        this.removeEvent();
    }

    addEvent() {
        this.clickBg.on(cc.Node.EventType.TOUCH_START, this.onClickBg, this);
        this.spineMonkey.setCompleteListener(this.spineMoneyEventComplete.bind(this));//猴子动画播放完成事件
        this.angerSpine2.setCompleteListener(this.spineAngerEventComplete.bind(this));//怒气值动画播放完成事件
        GameEvent.instance.addListener(GameEvent.UPDATE_MONEY_DATA, this.updateMoneyUI, this);//更新金币ui
        GameEvent.instance.addListener(GameEvent.UPDATE_ANGER_DATA, this.updateAngerUI, this);//更新怒气ui
        GameEvent.instance.addListener(GameEvent.TIMER_S_UPDATE, this.timeSecondUpdate, this);//每秒计时器
        GameEvent.instance.addListener(GameEvent.GAME_OFFLINE_EARNINGS, this.offLineDetection, this);//计算离线收益
        GameEvent.instance.addListener(GameEvent.UPDATE_TOGGLE_PAGE, this.backTogglePage, this);//切换toggele分页
        GameEvent.instance.addListener(GameEvent.AIR_BOX_APPEAR, this.airBoxAppear, this);//空投出现
        GameEvent.instance.addListener(GameEvent.MAIN_AIR_BOX_ACTIVE, this.updateAirBoxUI, this)//空投落地
        GameEvent.instance.addListener(GameEvent.UPDATE_WEAR_SKIN, this.updateWearSkin, this);//穿戴皮肤更新
    }

    removeEvent() {
        this.clickBg.off(cc.Node.EventType.TOUCH_START, this.onClickBg, this);
        this.spineMonkey.setCompleteListener(null);//猴子动画播放完成事件
        this.angerSpine2.setCompleteListener(null);//怒气值动画播放完成事件
        GameEvent.instance.removeListener(GameEvent.UPDATE_MONEY_DATA, this.updateMoneyUI, this);//更新金币ui
        GameEvent.instance.removeListener(GameEvent.UPDATE_ANGER_DATA, this.updateAngerUI, this);//更新怒气ui
        GameEvent.instance.removeListener(GameEvent.TIMER_S_UPDATE, this.timeSecondUpdate, this);//每秒计时器
        GameEvent.instance.removeListener(GameEvent.GAME_OFFLINE_EARNINGS, this.offLineDetection, this);//计算离线收益
        GameEvent.instance.removeListener(GameEvent.UPDATE_TOGGLE_PAGE, this.backTogglePage, this);//切换toggele分页
        GameEvent.instance.removeListener(GameEvent.AIR_BOX_APPEAR, this.airBoxAppear, this);//空投出现
        GameEvent.instance.removeListener(GameEvent.MAIN_AIR_BOX_ACTIVE, this.updateAirBoxUI, this)//空投落地
        GameEvent.instance.removeListener(GameEvent.UPDATE_WEAR_SKIN, this.updateWearSkin, this);//穿戴皮肤更新
    }

    /**
     * 秒钟计时器
     */
    timeSecondUpdate() {
        //更新怒气值
        GameData.instance.updateAngerData(true);
    }

    /**
     * 主界面按钮点击
     * @param event 点击事件 
     * @param customEventData 自定义参数
     */
    onBtnClock(event: any, customEventData: any) {
        let name = event.target.name;
        switch (name) {
            case 'btn_gm'://GM
                GameUI.instance.showDialog('gm/GM', 'GMTest', this);
                break;
            case 'userNode'://用户
                GameUI.instance.showDialog('ui/rank/RankNew', 'RankNew', this);
                break;
            case 'profitNode'://盈利
                GameUI.instance.showDialog('ui/earning/Earnings', 'Earnings', this, false, { type: 1 });
                break;
            case 'goldPointNode'://金积分增加
                let isOpenAccelerate = GameData.instance.isOpenAccelerate;
                if (!isOpenAccelerate) {
                    GameUI.instance.showDialog('ui/earning/Earnings', 'Earnings', this, false, { type: 3 });
                } else {
                    this.goToBindWallet(() => {
                        let earnUrl = 'https://t.me/uptonfi_bot/uptonfi_bot_web';
                        GameWeb.instance.openLink(earnUrl);
                    });
                }
                break;
            case 'btn_setting'://设置
                GameUI.instance.showDialog('ui/setting/Setting', 'Setting', this);
                break;
            case 'btn_backpack'://背包
                GameUI.instance.showDialog('ui/backpack/Backpack', 'Backpack', this);
                break;
            case 'btn_air'://空投按钮
                GameUI.instance.showDialog('ui/airdrop/AirDropReward', 'AirDropReward', this, false, GameData.instance.airBoxData);
                break;
            case 'btn_earn'://银行赚钱
                this.goToBindWallet(() => {
                    let earnUrl = 'https://t.me/uptonfi_bot/uptonfi_bot_web';
                    GameWeb.instance.openLink(earnUrl);
                });
                break;
            case 'btn_speedUp'://加速
                let gmgnUrl = 'https://gmgn.ai/?ref=8hrS42z0&chain=sol';
                GameWeb.instance.openLink(gmgnUrl);
                // GameUI.instance.showTiShi('tishi/label2');
                break;
            default:
                break;
        }
    }

    /**
     * toggle点击事件
     * @param {cc.Toggle} toggle 点击的toggle
     */
    onToggleEvent(toggle: cc.Toggle, isPlayEffect: boolean = true) {
        if (isPlayEffect) GameAudio.instance.playEffect('dianji');
        let name = toggle.node.name;

        //移除弹窗
        for (let i = 0; i < this.centerLayout.childrenCount; i++) {
            let child = this.centerLayout.children[i];
            if (child.name == 'AirDrop') continue;
            child.destroy();
        }

        switch (name) {
            case 'toggle1'://福利任务
                GameUI.instance.showDialog('ui/task/Task', 'Task', this, false, { childParent: this.centerLayout });
                break;
            case 'toggle2'://银行质押
                this.goToBindWallet(() => {
                    GameUI.instance.showDialog('ui/pledge/Pledge', 'Pledge', this, false, { childParent: this.centerLayout });
                });
                break;
            case 'toggle3'://主界面
                break;
            case 'toggle4'://邀请好友
                GameUI.instance.showDialog('ui/invite/InvitePrefab', 'InviteLayout', this, false, { childParent: this.centerLayout });
                break;
            default:
                break;
        }
    }

    /**
     * 检测是否绑定钱包,没有绑定就去绑定
     */
    goToBindWallet(callback: Function = null) {
        if (!GameWeb.instance.checkConnected()) {
            GameUI.instance.showDialog('ui/wallet/ConnectWallet', 'ConnectWallet', this, false,
                {
                    childParent: this.centerLayout,
                    bindCall: (result: any) => {
                        if (!result) return;
                        if (callback) callback();
                    },

                });
        } else {
            if (callback) callback();
        }
    }

    /**
     * 返回主分页
     */
    backTogglePage() {
        let childNode = this.bottomToggle.children[2];
        if (!cc.isValid(childNode)) return;
        childNode.getComponent(cc.Toggle).check();
    }


    /**
     * 背景点击
     * @param event 点击事件
     * @param customEventData 自定义参数 
     */
    onClickBg(event: { getTouches: () => any; }, customEventData: any) {
        //添加触觉反馈
        GameWeb.instance.hapticFeedback(2);
        //判断当前怒气值是否可以点击
        let angerData = GameData.instance.angerData;
        if (angerData.curNum < angerData.consumeNum) {
            //怒气值不够
            this.playAngerAnim('start_2', false);
            return;
        }

        //得到当前点击数字
        let isCritical = GameUtils.instance.getRandomCritical();
        let clickNum = GameData.instance.getClickMoney(isCritical);

        //将点击坐标转为世界坐标
        let touches = event.getTouches();
        let touchLoc = touches[0].getLocation();
        touchLoc = this.node.convertToNodeSpaceAR(touchLoc);

        //创建一个数字动画
        let numData = {
            pos: touchLoc,
            num: clickNum,
        };
        GameUI.instance.careteNumAnim(this.node, numData);
        //添加金币
        GameData.instance.updateMoneyData({ type: 1, isCritical: isCritical });
        //更新怒气值
        GameData.instance.updateAngerData(false);

        //更新计时器间隔
        this.updateTimerGap(() => {
            //请求服务端数据
            GameData.instance.requestMoneyData(MONEY_GET_CHANNEL.CLICK_ONLINE);
        });

        //播放动画
        this.playMonkeyDogAnim();
    }

    /**
     * 更新用户信息
     */
    updatePlayerUI() {
        //昵称
        this.nickName.string = GameUtils.instance.getPlayNickName(GameData.instance.nickName);
        //头像
        GameUI.instance.loadTGHead(this.head, GameData.instance.photoUrl);
    }

    /**
     * 更新金币ui
     */
    updateMoneyUI() {
        //得到金币总数
        let totalMoney = GameData.instance.getTotalMoneyNum();
        //格式化后赋值
        this.money.string = GameUtils.instance.getNumberSplit(totalMoney);
        //等级
        let curLevel = GameData.instance.getCurLevel();
        this.level.string = `Lv.${curLevel}`;
        //更新进度
        let moneyData = GameData.instance.moneyData;
        let curNum = moneyData.serverNum;
        let upNum = GameData.instance.getUpLvMoney();
        let rate = Math.min(1, curNum / upNum);
        this.levelPregress.progress = rate;
        this.upLevelRate.string = `${Math.floor(rate * 100)}%`;
        //计算每小时盈利
        let hourOnlineNum = moneyData.onlineNum * 60 * 60;
        this.profitNum.string = `${GameUtils.instance.getShowDiamond(hourOnlineNum)}/H`;

        //检测是否升级
        let changeLv = GameData.instance.getCurLevel(totalMoney);
        if (changeLv > curLevel) {
            //请求服务端数据
            GameData.instance.requestMoneyData(MONEY_GET_CHANNEL.CLICK_ONLINE);
            //移除计时器
            if (this.oneSecondTimer) this.unschedule(this.oneSecondTimer);
            this.oneSecondTimer = null;
            if (this.fiveSecondTimer) this.unschedule(this.fiveSecondTimer);
            this.fiveSecondTimer = null;
        }
    }

    /**
     * 更新怒气值ui
     */
    updateAngerUI() {
        let angerData = GameData.instance.angerData;
        this.angerTime.string = `${angerData.recoverNum}/S`;
        let rate = angerData.curNum / angerData.totalNum;
        this.angerProgress.progress = rate;
        this.angerRate.string = `${angerData.curNum}/${angerData.totalNum}`;
        if (rate >= 1) {
            this.angerSpine1.node.active = true;
        } else {
            this.angerSpine1.node.active = false;
            this.angerAnimComplete = true;
        }
        this.angerSpine2.node.active = false;
    }

    /**
     * 更新金积分
     */
    async updateGoldUI() {
        this.goldNum.string = GameUtils.instance.getShowDiamond(GameData.instance.pledgeData.goldNum);
        GameData.instance.requestPledgeData(3, () => {
            if (!cc.isValid(this.node)) return;
            this.goldNum.string = GameUtils.instance.getShowDiamond(GameData.instance.pledgeData.goldNum);
        });
    }

    /**
     * 更新计时器间隔
     * @param {Function} timeCall 计时结束回调 
     */
    updateTimerGap(timeCall: Function = null) {
        //创建一个1s的计时器
        if (this.oneSecondTimer) this.unschedule(this.oneSecondTimer);
        //创建一个计时器
        this.oneSecondTimer = () => {
            if (this.fiveSecondTimer) this.unschedule(this.fiveSecondTimer);
            this.fiveSecondTimer = null;
            if (timeCall) timeCall();
        };
        this.scheduleOnce(this.oneSecondTimer, 2);

        //创建一个5s的计时器
        if (!this.fiveSecondTimer) {
            this.fiveSecondTimer = () => {
                if (this.oneSecondTimer) this.unschedule(this.oneSecondTimer);
                this.fiveSecondTimer = null;
                if (timeCall) timeCall();
            };
            this.scheduleOnce(this.fiveSecondTimer, 7);
        }
    }

    /**
     * 离线收益计算
     */
    offLineDetection() {
        //新用户引导没做完不出现
        if (0 == GameData.instance.offlineTime) return;
        //离线最短时间5分钟 最长时间3小时
        let minTime = 5 * 60 * 1000;
        let maxTime = 3 * 60 * 60 * 1000;
        //得到离线时间
        let offlineTime = GameData.instance.getOfflineTime(0);
        GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `offLineTime: ${GameUtils.instance.getHourAndMinAndSec(Math.floor(offlineTime / 1000))}`)
        if (offlineTime < minTime) return;
        offlineTime = Math.min(offlineTime, maxTime);

        let offlineData = {
            type: 2,
            offlineTime: offlineTime,
        };
        GameUI.instance.showDialog('ui/earning/Earnings', 'Earnings', this, false, offlineData);
    }

    /**
     * 空投出现
     * @param {any} airBoxData 空投数据 
     */
    airBoxAppear(airBoxData: any) {
        if (!airBoxData) return;
        GamePublic.instance.isHavaAirBox = true;
        GameUI.instance.showDialog('ui/airdrop/AirDrop', 'AirDrop', this, false, {
            childParent: this.centerLayout,
            airBoxData: airBoxData,
        }, DIALOG_Z_INDEX.DEFAULT - 1);
    }

    /**
     * 更新空投按钮ui
     * @param {boolean} isAnim 显示按钮时是否需要播放动画
     * @returns 
     */
    updateAirBoxUI(isAnim: boolean = false) {
        let airBoxData = GameData.instance.airBoxData;
        if (!airBoxData || 0 !== airBoxData.state) {
            this.btn_air.active = false;
            return;
        }

        GamePublic.instance.isHavaAirBox = true;
        this.btn_air.active = true;
        if (isAnim) {
            let spineIcon = cc.find('spineIcon', this.btn_air);
            let spineFly = cc.find('spineFly', this.btn_air);
            let lab = cc.find('label', this.btn_air);
            spineIcon.active = false;
            lab.active = false;
            spineFly.active = true;
            let flyAnim = spineFly.getComponent(sp.Skeleton);
            flyAnim.setCompleteListener((trackEntry: any, loopCount: any) => {
                spineFly.active = false;
                spineIcon.active = true;
                lab.active = true;
            });
            flyAnim.setAnimation(0, 'loop_2', false);
        }
    }

    /**
     * 更新穿戴的皮肤
     */
    updateWearSkin() {
        //得到当前穿戴的皮肤
        let curSkin = GameData.instance.curWearSkinId;
        let skinData = TB_Skin[curSkin];
        if (!skinData) return;
        //加载主界面背景
        // let clickBgSp = this.clickBg.getComponent(cc.Sprite);
        // if (clickBgSp.spriteFrame.name !== skinData.Bg) {
        //     GameUI.instance.loadSpriteFrame(clickBgSp, `ui/common/${skinData.Bg}`, this.name);
        // }
        let bgSpine = cc.find('spine', this.clickBg).getComponent(sp.Skeleton);
        if (!bgSpine.skeletonData || bgSpine.skeletonData.name !== skinData.Bg_spine) {
            GameUI.instance.loadSpine(bgSpine, `spine/ui/${skinData.Bg_spine}/`, skinData.Bg_spine, this.name, {
                callback: () => {
                    if (!bgSpine || !cc.isValid(bgSpine.node)) return;
                    bgSpine.setAnimation(0, 'loop_1', true);
                }
            });
        }

        //加载猴子和狗的spine资源
        GameUI.instance.loadSpine(this.spineMonkey, `spine/skin/${skinData.Monkey_spine}/`, skinData.Monkey_spine, this.name, {
            callback: () => {
                if (!this.spineMonkey || !cc.isValid(this.spineMonkey.node)) return;
                this.spineMonkey.setAnimation(0, 'loop_1', true);
                //更新影子
                if (3 == skinData.Skin_id) {//悟空
                    this.shadowDog.node.setPosition(cc.v2(-150, -180));
                    this.shadowDog.node.scaleX = -1;
                    this.shadowMonkey.node.setPosition(cc.v2(150, -180));
                    GameUI.instance.loadSpriteFrame(this.shadowDog, `ui/home/ui_home_bg12`, this.name);
                    GameUI.instance.loadSpriteFrame(this.shadowMonkey, `ui/home/ui_home_bg12`, this.name);
                } else {
                    this.shadowDog.node.setPosition(cc.v2(-125, -180));
                    this.shadowDog.node.scaleX = 1;
                    this.shadowMonkey.node.setPosition(cc.v2(120, -180));
                    GameUI.instance.loadSpriteFrame(this.shadowDog, `ui/home/ui_home_bg10`, this.name);
                    GameUI.instance.loadSpriteFrame(this.shadowMonkey, `ui/home/ui_home_bg10`, this.name);
                }
            }
        });
    }

    /**
     * 播放猴子打狗的动画
     */
    playMonkeyDogAnim() {
        //计算点击速度
        let timeScale = this.calcClickSpeed();
        if (timeScale > 13.6) return;
        this.spineMonkey.timeScale = timeScale;

        this.scheduleOnce(() => {
            GameAudio.instance.playEffect('slap');
        }, 0.5 / timeScale);

        //根据怒气值播放狗子的动画
        let angerData = GameData.instance.angerData;
        let curAnger = angerData.curNum;
        let totalAnger = angerData.totalNum;
        let rate = curAnger / totalAnger;
        let state = 1;
        if (rate >= 0.6) {
            state = 2;
        } else if (rate >= 0.3) {
            state = 3;
        } else if (rate >= 0) {
            state = 4;
        }
        this.spineMonkey.setAnimation(0, `start_${state}`, false);
        this.startAnimFinish = false;
    }

    /**
     * 猴子动画播放完成监听
     * @param trackEntry 
     * @param loopCount 
     */
    spineMoneyEventComplete(trackEntry: { animation: { name: any; }; }, loopCount: any) {
        if (!trackEntry || !trackEntry.animation) return;
        this.spineMonkey.timeScale = 1;
        let name = trackEntry.animation.name;
        let nameSplit = name.split('_');
        if ('start' == nameSplit[0]) {//播放的是start动画
            this.standAnimData.standAnimName = `loop_${nameSplit[1]}`;
            this.startAnimFinish = true;
            this.spineMonkey.setAnimation(0, this.standAnimData.standAnimName, false);
        } else if ('loop' == nameSplit[0]) {//播放的是loop动画
            this.standAnimData.animNum--;
            if (this.standAnimData.animNum <= 0) {
                this.standAnimData.animNum = this.ANIM_LOOP_COUNT;
                let loopSplit = name.split('.');
                if (loopSplit.length == 1) {
                    this.standAnimData.standAnimName = `${loopSplit[0]}.2`;
                } else {
                    this.standAnimData.standAnimName = loopSplit[0];
                }
            }
            this.spineMonkey.setAnimation(0, this.standAnimData.standAnimName, false);
        }
    }

    /**
     * 播放怒气值动画
     * @param {string} animName 动画名称
     * @param {boolean} isLoop 是否循环
     */
    playAngerAnim(animName: string, isLoop: boolean = true) {
        if (!this.angerAnimComplete) return;

        this.angerSpine2.node.active = true;
        this.angerSpine2.setAnimation(0, animName, isLoop);
        this.angerAnimComplete = false;
    }

    /**
     * 怒气值动画播放完成监听
     * @param trackEntry 
     * @param loopCount 
     */
    spineAngerEventComplete(trackEntry: any, loopCount: any) {
        this.angerAnimComplete = true;
    }

    /**
     * 计算点击速度
     */
    calcClickSpeed() {
        //计算点击间隔
        let curTime = new Date().getTime();
        let diffTime = curTime - this.lastClickTime;

        this.lastClickTime = curTime;
        //动画0.67s播放完成
        const playTime = 0.67;
        //计算速度
        let speed = (playTime / (diffTime / 1000));
        speed = +speed.toFixed(2);
        speed = Math.max(1, speed);
        // speed = Math.min(10, speed);
        return speed;
    }
}
