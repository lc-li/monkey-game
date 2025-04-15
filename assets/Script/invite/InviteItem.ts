import GameUI from "../tool/GameUI";
import GameUtils from "../tool/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InviteItem extends cc.Component {

    @property(cc.Sprite)
    head: cc.Sprite = null;

    @property(cc.Label)
    nickName: cc.Label = null;

    @property(cc.Label)
    his: cc.Label = null;

    @property(cc.Label)
    mine: cc.Label = null;


    init(base, data) {
        this.nickName.string = GameUtils.instance.getPlayNickName(data.name);
        if (data.photoUrl) {
            GameUI.instance.loadTGHead(this.head, data.photoUrl);
        }
    }

    onLoad() { }

}
