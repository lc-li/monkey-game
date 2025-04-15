import BaseDialog from "../tool/BaseDialog";
import ButtonEx from "../tool/ButtonEx";
import GameData from "../tool/GameData";
import GameUI from "../tool/GameUI";
import GameWeb from "../tool/GameWeb";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideNew extends BaseDialog {

    @property(cc.Node)
    oneStep: cc.Node = null;

    @property(cc.Node)
    twoStep: cc.Node = null;

    @property(cc.ProgressBar)
    oneProgress: cc.ProgressBar = null;

    @property(cc.ProgressBar)
    twoProgress: cc.ProgressBar = null;

    @property(cc.ProgressBar)
    threeProgress: cc.ProgressBar = null;

    @property(cc.ProgressBar)
    fourProgress: cc.ProgressBar = null;

    @property(ButtonEx)
    btn_twoContinue: ButtonEx = null;

    @property(cc.Node)
    threeStep: cc.Node = null;

    @property(cc.Label)
    threeNum: cc.Label = null;

    @property(cc.Label)
    tips6: cc.Label = null;

    @property(cc.Node)
    fourStep: cc.Node = null;

    @property(cc.Label)
    fourNum: cc.Label = null;

    @property(cc.SpriteFrame)
    iconArr: cc.SpriteFrame[] = [];

    data: any = null;

    colorData: any = {
        normal: '#B58314',
        forbidden: '#818181',
    };

    init(base, data) {
        super.init(base, data);
        this.data = data;
        this.updateStepUI(1, true);
    }

    onLoad() {
        super.onLoad();
    }

    onDestroy() {
        super.onDestroy();
    }

    onBtnClock(event) {
        let name = event.target.name;
        switch (name) {
            case 'btn_go'://一阶段前往
                this.updateStepUI(2, true);
                break;
            case 'btn_twoBack'://二阶段返回
                if (!this.btn_twoContinue.interactable) return;
                this.updateStepUI(1, false);
                break;
            case 'btn_twoContinue'://二阶段继续
                this.updateStepUI(3, true);
                break;
            case 'btn_threeBack'://三阶段返回
                this.updateStepUI(2, false);
                break;
            case 'btn_threeContinue'://三阶段继续
                this.updateStepUI(4, true);
                break;
            case 'btn_fourBack'://四阶段返回
                this.updateStepUI(3, false);
                break;
            case 'btn_join'://四阶段加入社区
                const tgLink = GameWeb.instance.nn.jointg;
                GameWeb.instance.openLink(tgLink);
                break;
            case 'btn_play'://四阶段开始游戏
                if (this.data && this.data.callback) this.data.callback();
                this.node.destroy();
                break;
            default:
                break;
        }
    }

    /**
     * 更新步骤ui
     * @param {number} type 步骤 
     * @param {boolean} isInit 是否是第一次进入 
     */
    updateStepUI(type: number = 1, isInit: boolean = true) {
        this.oneStep.active = type == 1;
        this.twoStep.active = type == 2;
        this.threeStep.active = type == 3;
        this.fourStep.active = type == 4;

        if (!isInit) return;
        switch (type) {
            case 2:
                this.updateStepTwoUI();
                break;
            case 3:
                this.updateStepThreeUI();
                break;
            case 4:
                this.updateStepFourUI();
                break;

            default:
                break;
        }
    }

    /**
     * 更新步骤二ui
     */
    updateStepTwoUI() {
        //初始化进度ui
        this.initProgressUI();
        let time = 1.5;
        this.playProgressAnim(this.oneProgress, time, () => {
            this.playProgressAnim(this.twoProgress, time, () => {
                this.playProgressAnim(this.threeProgress, time, () => {
                    this.playProgressAnim(this.fourProgress, time, () => {
                        this.btn_twoContinue.interactable = true;
                        cc.find('label', this.btn_twoContinue.node).getComponent(cc.LabelOutline).color = new cc.Color().fromHEX(this.colorData.normal);
                    })
                })
            })
        })
    }

    /**
     * 更新步骤三ui
     */
    updateStepThreeUI() {
        let scoreData = this.data.scoreData;
        this.threeNum.string = scoreData.og;

        let tempStr = this.tips6.string;
        tempStr = tempStr.replace('XXX', GameData.instance.openId);
        tempStr = tempStr.replace('###', `${scoreData.ogPer}%`);
        this.tips6.string = tempStr;
    }

    /**
     * 更新步骤四ui
     */
    updateStepFourUI() {
        let scoreData = this.data.scoreData;
        this.fourNum.string = scoreData.score;
    }

    /**
     * 初始化进度ui
     */
    initProgressUI() {
        this.btn_twoContinue.interactable = false;
        cc.find('label', this.btn_twoContinue.node).getComponent(cc.LabelOutline).color = new cc.Color().fromHEX(this.colorData.forbidden);
        this.oneProgress.progress = 0;
        this.twoProgress.progress = 0;
        this.threeProgress.progress = 0;
        this.fourProgress.progress = 0;
        cc.find('icon', this.oneProgress.node).getComponent(cc.Sprite).spriteFrame = this.iconArr[0];
        cc.find('icon', this.twoProgress.node).getComponent(cc.Sprite).spriteFrame = this.iconArr[0];
        cc.find('icon', this.threeProgress.node).getComponent(cc.Sprite).spriteFrame = this.iconArr[0];
        cc.find('icon', this.fourProgress.node).getComponent(cc.Sprite).spriteFrame = this.iconArr[0];
    }

    /**
     * 播放进度条动画
     * @param {cc.ProgressBar} progressBar 进度条
     * @param {number} time 时间
     * @param {Function} callback 回调 
     */
    playProgressAnim(progressBar: cc.ProgressBar, time: number, callback?: Function) {
        if (!progressBar || !cc.isValid(progressBar)) return;
        progressBar.progress = 0;
        cc.tween(progressBar)
            .to(time, { progress: 1 }, { easing: 'sineOut' }) // 2秒钟内将进度从0增加到1
            .call(() => {
                cc.find('icon', progressBar.node).getComponent(cc.Sprite).spriteFrame = this.iconArr[1];
                if (callback) callback();
            })
            .start();
    }
}
