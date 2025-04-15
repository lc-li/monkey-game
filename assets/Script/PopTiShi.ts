/**
 * @file 游戏通用文本提示管理脚本
 * @author caoyang 2024/8/15
 */
import { IF_TB_I18n_LanguageText } from "./Table/GameCfgInterface";
import GameTable from "./Table/GameTable";
import GameGlobal from "./tool/GameGlobal";
const TB_LanguageText: IF_TB_I18n_LanguageText = GameTable.data.LanguageText;

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopTiShi extends cc.Component {

    @property(cc.Node)
    blockBg: cc.Node = null;

    @property(cc.Label)
    text: cc.Label = null;

    @property(cc.Node)
    anim: cc.Node = null;

    //是否正在播放动画
    isPlayAnim: boolean = false;

    /**
     * 创建文本时调用init初始化
     * @param {*} data {text:需要显示的文本内容}
     */
    init(base, data) {
        if (this.isPlayAnim) return;
        this.anim.y = data.initY ? data.initY : 60;
        this.anim.opacity = 255;
        this.text.string = this.getTextStr(data.text);
    }

    start() {
        this.anim.stopAllActions();
        // 播放淡入动画
        this.isPlayAnim = true;
        cc.tween(this.anim)
            .to(0.3, { position: new cc.Vec3(this.anim.x, this.anim.y + 60, 0) })
            .delay(2.5)
            .to(0.3, { position: new cc.Vec3(this.anim.x, this.anim.y + 120, 0), opacity: 0 })
            .call(() => {
                this.isPlayAnim = false;
                this.node.destroy();
            })
            .start();
    }

    /**
     * 得到提示文本
     * @param {string} text 配置表字段
     */
    getTextStr(text: string) {
        let languageData = TB_LanguageText[text];
        if (!languageData) return text;
        let lauguageType = GameGlobal.lauguageType;
        return languageData[`type_${lauguageType}`];
    }
}
