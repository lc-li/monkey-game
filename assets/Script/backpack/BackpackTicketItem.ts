import GameUI from "../tool/GameUI";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BackpackTicketItem extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.RichText)
    describe: cc.RichText = null;

    data: any;

    init(base, data) {
        this.data = data;
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, data);
        //icon
        GameUI.instance.loadSpriteFrame(this.icon, `ui/common/${data.Item_icon}`, this.name);
        //描述
        this.describe.string = `${data.Item_description} <color=#FFA438><size=26>${data.Up * 100}%</size></color>`;
    }

    onLoad() { }

    /**
     * 点击使用
     */
    onBtnClick() {

    }
}
