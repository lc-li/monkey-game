import GameUI, { DIALOG_Z_INDEX } from "../tool/GameUI";
import GameTable from "../Table/GameTable";
import GameEvent from "../tool/GameEvent";
import { IF_TB_Guide } from "../Table/GameCfgInterface";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
const TB_Guide: IF_TB_Guide = GameTable.data.Guide;

/**
 * @file 引导公共模块
 * @author CaoYang 2024/8/19
 */
export default class GameMainGuide {
    private static _instance: GameMainGuide;

    static get instance() {
        if (this._instance) return this._instance;

        this._instance = new GameMainGuide();
        return this._instance;
    }

    /**
     * {
     *      mainGuideId: 强制引导任id, 
     * }
     */
    mainGuideData: any = null;
    guidePopuUpdate: Function = null; // 强制引导弹窗更新函数
    guidePopuClose: Function = null; // 强制引导弹窗关闭函数

    init() {
        this.initMainGuide();
    }

    initMainGuide() {
        if (!this.mainGuideData) {
            this.mainGuideData = {
                mainGuideId: 1,
            };
        }

        // 强制引导容错处理
        this.fixMainGuide();

        //显示引导
        this.showMainGuide();
    }

    /**
     * 强制引导容错处理
     */
    fixMainGuide() {

    }

    /**
     * 强制引导
     * @param {number} guideId (可选参数)引导id 
     * @returns 
     */
    showMainGuide(guideId?: number) {
        this.mainGuideData.mainGuideId = guideId || this.mainGuideData.mainGuideId;

        if (cc.find("Canvas").getChildByName("guideMainPopu")) return;

        let guideCfg = TB_Guide[this.mainGuideData.mainGuideId];

        if (!guideCfg.ID) {
            // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `can not find guide config, guideId: ${this.mainGuideData.mainGuideId}`);
            return;
        }

        GameUI.instance.showDialog('ui/guide/guideMain', 'GuideMain', this, null, this.mainGuideData.mainGuideId, DIALOG_Z_INDEX.GUID_DIALOG);
    }

    /**
    * 完成强制引导
    * @param {*} guideId 
    */
    completeMainGuide(guideId) {
        guideId = guideId || this.mainGuideData.mainGuideId;
        let guideCfg = TB_Guide[guideId];

        if (!guideCfg.ID) {
            // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `completeMainGuide can not find guide config, guideId: ${guideId}`);
            return;
        }

        this.mainGuideData.mainGuideId = guideCfg.NextId;
    }

    /**
     * 判断本次点击是否完成当前强制引导
     * @param {string} btnName 点击按钮名称
     */
    checkMainGuide(btnName) {

        let guideId = this.mainGuideData.mainGuideId;
        let guideCfg = TB_Guide[guideId];

        if (!guideCfg.ID) {
            // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `checkMainGuide can not find guide config, guideId: ${guideId}`);
            return;
        }
        if (btnName !== guideCfg.BtnName) return;

        this.completeMainGuide(guideId); // 完成当前引导

        // 自动下一个引导
        if (1 === guideCfg.AutoNext) {
            !!this.guidePopuUpdate && this.guidePopuUpdate(this.mainGuideData.mainGuideId);
        } else {
            !!this.guidePopuClose && this.guidePopuClose();
        }
    }

    /**
     * 检测强制引导是否完成
     */
    checkMainGuideComplete() {
        let guideCfg = TB_Guide[this.mainGuideData.mainGuideId];
        return !guideCfg.ID;
    }

    /**
     * 跳过新手引导
     */
    jumpGuide() {
        let finalId = this.getFinalGuideId(this.mainGuideData.mainGuideId);

        this.mainGuideData.mainGuideId = finalId;
        GameEvent.instance.dispatchEvent(GameEvent.MAIN_GUIDE_COMPLETE);
    }

    //得到最后一个引导id
    getFinalGuideId(guideId) {
        let guideCfg = TB_Guide[guideId];
        let nexeId = guideCfg.NextId;
        let nextGuideCfg = TB_Guide[nexeId];

        if (nextGuideCfg.ID) {
            return this.getFinalGuideId(nexeId);
        } else {
            return nexeId;
        }
    }

    /**
     * 获取顶部提示的Y坐标
     * @param {number} guideId 当前引导id
     */
    getTopTipsPosY(guideId) {
        return 460;
    }
}

