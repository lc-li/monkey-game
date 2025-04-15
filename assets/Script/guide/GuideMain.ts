import BaseDialog from "../tool/BaseDialog";
import GameEvent from "../tool/GameEvent";
import GameMainGuide from "./GameMainGuide";
import GameTable from "../Table/GameTable";
import { IF_TB_Guide } from "../Table/GameCfgInterface";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
const TB_Guide: IF_TB_Guide = GameTable.data.Guide;

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideMain extends BaseDialog {

    @property(cc.Node)
    nodeEmpty: cc.Node = null;

    @property(cc.Mask)
    nodeMask: cc.Mask = null;

    @property(cc.Node)
    nodeSpMask: cc.Node = null;

    @property(cc.SpriteFrame)
    maskRect: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    maskCircle: cc.SpriteFrame = null;

    @property(cc.Node)
    tipsLayout: cc.Node = null;

    @property(cc.Label)
    lblTopTips: cc.Label = null;

    @property(cc.Node)
    guideSpine: cc.Node = null;

    @property(cc.Node)
    nodeText: cc.Node = null;

    @property(cc.Label)
    text: cc.Label = null;

    @property(cc.Node)
    nodeFinger: cc.Node = null;

    @property(cc.Node)
    nodeContinue: cc.Node = null;

    clickEnable: boolean = false;//是否可以点击
    curGuideId: number = -1;//当前引导id
    nextGuideId: number = -1;//下一个引导id
    clickNext: number = 0;//1表示点击任意地方即可完成当前指引
    autoNext: number = 0;//1表示自动接下一个指引

    init(base, guideId) {
        super.init(base, guideId);

        this.clickEnable = false;
        this.hideAll(guideId);

        this.updatePopu(guideId);
        this.scheduleOnce(() => {
            this.clickEnable = true;
        }, 1);
    }

    onLoad() {
        super.onLoad();

        // this.startContinueAnim();
    }

    onDestroy() {
        super.onDestroy();
    }

    onClickEmpty() {
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `onClickEmpty, this.clickNext: ${this.clickNext}`);
        if (true != this.clickEnable) return;

        this.clickEnable = false;
        this.scheduleOnce(() => {
            this.clickEnable = true;
        }, 0.5);

        // 点击任意地方即可完成引导
        if (1 === this.clickNext) {
            GameMainGuide.instance.completeMainGuide(this.curGuideId);

            // 自动下一个引导
            if (1 === this.autoNext) {
                this.updatePopu(this.nextGuideId);
            } else {
                this.onClose();
            }
        }
    }

    onClose() {
        // 新手引导已完成，开启埋点
        if (true === GameMainGuide.instance.checkMainGuideComplete()) {
            GameEvent.instance.dispatchEvent(GameEvent.MAIN_GUIDE_COMPLETE);
        }

        this.node.destroy();
    }

    updatePopu(guideId) {
        let guideCfg = TB_Guide[guideId];
        if (!guideCfg.ID) {
            // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `can not find guideCfg, guideId: ${guideId}`);
            this.onClose();
            return;
        }

        this.curGuideId = guideId;
        this.nextGuideId = guideCfg.NextId;
        this.clickNext = guideCfg.ClickNext;
        this.autoNext = guideCfg.AutoNext;
        this.showTopTips(guideCfg.TopTips);
        this.showGuideGirl(guideCfg.ShowGuideGirl, guideCfg.GuideGirlIsRight);
        this.showDialogText(guideCfg.Text);

        let prefabName = guideCfg.PrefabName;
        let btnName = guideCfg.BtnName;
        if (!prefabName) {
            this.showMask(guideCfg.MaskData, guideCfg.MaskType);
            this.showFinger(guideCfg.FingerPos);
        } else {
            let canvas = cc.director.getScene().getChildByName('Canvas');
            let findCanvas = null;
            let btn = null;
            if (!!prefabName) {
                findCanvas = cc.find(prefabName, canvas);
            } else {
                findCanvas = canvas;
            }
            if (!!findCanvas) {
                btn = cc.find(btnName, findCanvas);
                if (!!btn) {
                    this.scheduleOnce(function () {
                        let pos2 = btn.convertToWorldSpaceAR(cc.v2(0, 0));
                        let pos3 = this.node.convertToNodeSpaceAR(pos2);
                        let rectArr = guideCfg.MaskData.split(',').map(Number);
                        rectArr[1] = pos3.y;
                        this.showMaskByPos(rectArr, guideCfg.MaskType);
                        this.showFingerByPos(pos3);
                    }, 0);
                }
            }
        }

        // 等待一段时间自动完成的引导
        if (!!guideCfg.AutoCompleteTime && guideCfg.AutoCompleteTime > 0) {
            let func = function (guideId) {
                return () => {
                    if (guideId !== this.curGuideId) {
                        return;
                    }

                    GameMainGuide.instance.completeMainGuide(this.curGuideId);

                    // 自动下一个引导
                    if (1 === this.autoNext) {
                        this.updatePopu(this.nextGuideId);
                    } else {
                        this.onClose();
                    }
                }
            }.bind(this);
            this.scheduleOnce(func(this.curGuideId), guideCfg.AutoCompleteTime);
        }
    }

    /**
     * 显示顶部提示内容
     * @param {*} text 
     */
    showTopTips(text = "") {
        if (text == "") {
            this.tipsLayout.active = false;
        } else {
            this.lblTopTips.string = text;

            // 店外宣传顶部提示位置调整
            this.tipsLayout.y = GameMainGuide.instance.getTopTipsPosY(this.curGuideId);
            this.tipsLayout.active = true;
        }
    }

    /**
     * 更新指引娘的位置 
     * @param {int} isShow 0/1显隐指引girl
     * @param {int} isRight 0/1表示是否在右侧
     */
    showGuideGirl(isShow, isRight) {
        if (1 !== isShow) {
            this.guideSpine.active = false;
            return;
        }

        this.guideSpine.x = 1 === isRight ? 170 : -170;
        let scaleNum = Math.abs(this.guideSpine.scaleX);
        this.guideSpine.scaleX = (1 === isRight) ? (scaleNum * -1) : scaleNum;
        this.guideSpine.active = true;
    }

    /**
     * 显示对话内容
     * @param {*} text 
     */
    showDialogText(text = "") {
        if ("" === text) {
            this.nodeText.active = false;
            return;
        }

        this.text.string = text;
        this.nodeText.active = true;
    }

    /**
     * 添加遮罩
     * @param {string} maskData "x,y,width,height"
     * @param {number} maskType 1方形，2圆形
     */
    showMask(maskData, maskType) {
        if (!maskData) {
            this.nodeMask.node.x = -800;
            this.nodeSpMask.x = 800;
            return;
        }

        let rectArr = maskData.split(',').map(Number);
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `showMask maskType: ${maskType}, type: ${typeof (maskType)}, rect: `, rectArr);
        this.nodeMask.spriteFrame = 1 === parseInt(maskType) ? this.maskRect : this.maskCircle;
        this.nodeMask.node.setPosition(rectArr[0], rectArr[1]);
        this.nodeSpMask.setPosition(-rectArr[0], -rectArr[1]);
        this.nodeMask.node.width = rectArr[2];
        this.nodeMask.node.height = rectArr[3];
    }

    /**
     * 添加遮罩
     * @param {string} rectArr x,y,width,height
     * @param {number} maskType 1方形，2圆形
     */
    showMaskByPos(rectArr, maskType) {
        if (!rectArr) {
            this.nodeMask.node.x = -800;
            this.nodeSpMask.x = 800;
            return;
        }

        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `showMaskByPos maskType: ${maskType}, type: ${typeof (maskType)}, rect: `, rectArr);
        this.nodeMask.spriteFrame = 1 === parseInt(maskType) ? this.maskRect : this.maskCircle;
        this.nodeMask.node.setPosition(rectArr[0], rectArr[1]);
        this.nodeSpMask.setPosition(-rectArr[0], -rectArr[1]);
        this.nodeMask.node.width = rectArr[2];
        this.nodeMask.node.height = rectArr[3];
    }

    /**
     * 显示手指图标
     * @param {string} fingerPos "x,y"
     */
    showFinger(fingerPos) {
        if (!fingerPos) {
            this.nodeFinger.active = false;
            return;
        }

        let pos = fingerPos.split(",").map(Number);
        this.nodeFinger.setPosition(pos[0], pos[1]);
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `showFinger fingerPos: ${fingerPos}`);
        // this.nodeFinger.setPosition(fingerPos);
        this.nodeFinger.active = true;
    }

    /**
     * 显示手指图标
     * @param {cc.v2} fingerPos 
     */
    showFingerByPos(fingerPos) {
        if (!fingerPos) {
            this.nodeFinger.active = false;
            return;
        }

        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `showFingerByPos fingerPos: (${fingerPos.x}, ${fingerPos.y})`);
        this.nodeFinger.setPosition(fingerPos);
        this.nodeFinger.active = true;
    }

    /**
    * 隐藏除遮罩外的其他所有节点
    */
    hideAll(guideId) {
        this.guideSpine.active = false;
        this.nodeText.active = false;
        this.nodeFinger.active = false;
        this.nodeMask.node.x = -800;
        this.nodeSpMask.x = 800;

        let guideCfg = TB_Guide[guideId];
        if (!!guideCfg.ID) {
            this.showTopTips(guideCfg.TopTips);
            this.showGuideGirl(guideCfg.ShowGuideGirl, guideCfg.GuideGirlIsRight);
            this.showDialogText(guideCfg.Text);
        }
    }

    /**
     * 跳过新手引导
     */
    onClickBtnJumpGuide() {
        GameMainGuide.instance.jumpGuide();
        this.onClose();
    }

    /**
     * 继续动画
     */
    startContinueAnim() {
        let node = this.nodeContinue;

        cc.tween(node)
            .repeatForever(
                cc.tween(node)
                    .to(1, { opacity: 100 })
                    .to(1, { opacity: 255 })
            )
            .start();
    }

}
