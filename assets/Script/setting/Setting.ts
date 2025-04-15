import BaseDialog from "../tool/BaseDialog";
import GameAudio from "../tool/GameAudio";
import GameData from "../tool/GameData";
import GameGlobal from "../tool/GameGlobal";
import GameUI from "../tool/GameUI";
import GameUtils from "../tool/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Setting extends BaseDialog {

    @property(cc.Label)
    id: cc.Label = null;

    @property(cc.Node)
    btn_music: cc.Node = null;

    @property(cc.Node)
    btn_sound: cc.Node = null;

    @property(cc.Label)
    version: cc.Label = null;

    clickCnt: number = 0; //点击次数

    init(base, data) {
        super.init(base, data);
    }

    onLoad() {
        super.onLoad();
        this.initUI();
    }

    onDestroy() {
        super.onDestroy();
    }

    initUI() {
        // 音乐
        // if (GameAudio.instance.isEnableMusic()) {
        //     cc.find('music_on', this.btn_music).active = true;
        //     cc.find('music_off', this.btn_music).active = false;
        // } else {
        cc.find('music_on', this.btn_music).active = false;
        cc.find('music_off', this.btn_music).active = true;
        // }

        // 音效
        if (GameAudio.instance.isEnableEffect()) {
            cc.find('sound_on', this.btn_sound).active = true;
            cc.find('sound_off', this.btn_sound).active = false;
        } else {
            cc.find('sound_on', this.btn_sound).active = false;
            cc.find('sound_off', this.btn_sound).active = true;
        }

        this.version.string = GameGlobal.version;

        let idStr = GameUtils.instance.getPlayNickName(GameData.instance.userId, 6);
        this.id.string = `ID: ${idStr}`;
    }

    /**
     * 点击音乐按钮
     */
    onClickBtnMusic() {
        return;
        let isMusic = GameAudio.instance.isEnableMusic();
        GameAudio.instance.enableMusic(!isMusic);

        this.initUI();
    }

    /**
     * 点击音效按钮
     */
    onClickBtnEffect() {
        let isEffect = GameAudio.instance.isEnableEffect();
        GameAudio.instance.enableEffect(!isEffect);

        this.initUI();
    }

    onClickBtnClose() {
        this.node.destroy();
    }

    onClickBtnCopy() {
        GameUI.instance.copyToClipboard(GameData.instance.userId);
    }

    onBtnClickDebug() {
        //@ts-ignore
        if (window.vConsole) return;
        this.clickCnt++;
        if (this.clickCnt >= 30) {
            this.clickCnt = 0;
            //@ts-ignore
            window.vConsole = new VConsole();
        }
    }
}
