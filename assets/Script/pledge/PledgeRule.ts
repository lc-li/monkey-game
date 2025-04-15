import BaseDialog from "../tool/BaseDialog";
import GameData from "../tool/GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PledgeRule extends BaseDialog {

    init(base, data) {
        super.init(base, data);
    }

    onLoad() {
        super.onLoad();
        if (GameData.instance.isShowPledgeRule) {
            GameData.instance.isShowPledgeRule = false;
            GameData.instance.saveData();
        }
    }

    onDestroy() {
        super.onDestroy();
    }

    onBtnClose() {
        this.node.destroy();
    }
}
