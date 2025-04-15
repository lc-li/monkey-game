import BaseDialog from "../tool/BaseDialog";
import GamePublic from "../tool/GamePublic";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginOffline extends BaseDialog {

    @property(cc.Node)
    tips1: cc.Node = null;

    @property(cc.Node)
    tips2: cc.Node = null;

    init(base, data) {
        super.init(base, data);
        let type = 1;
        if (data && data.type) type = data.type;
        if (1 == type) {
            this.tips1.active = true;
            this.tips2.active = false;
        } else if (2 == type) {
            this.tips1.active = false;
            this.tips2.active = true;
        }
    }

    onLoad() {
        super.onLoad();
    }

    onDestroy() {
        super.onDestroy();
    }

    /**
     * 确定
     */
    onBtnOK() {
        GamePublic.instance.isKickToLogin = false;
        this.node.destroy();
    }

}
