import GameUI, { DIALOG_Z_INDEX } from "./tool/GameUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopLoading extends cc.Component {

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    init(base, data) {
        GameUI.instance.loadingToast = this;
        this.node.active = false;
    }

    //更新加载界面
    updateToast() {
        this.node.zIndex = DIALOG_Z_INDEX.TI_SHI;
        this.node.active = true;
        this.spine.setAnimation(0, 'loop_1', true);
    }

    closeToast() {
        if (cc.isValid(this.node)) this.node.active = false;
    }
}
