import GameUtils, { LOG_LEVEL } from "./tool/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FlyEffectItem extends cc.Component {

    @property(cc.Node)
    item_1: cc.Node = null;

    onLoad() {
        // 1 金币
    }

    init(type) {
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `flyEffectItem type: ${type}, !type: ${!type}`);
        // let spriteFramelst = ['ui_xianjin_1', 'ui_fensi_1', 'ui_xianjin_1', 'ui_xianjin_1'];
        // if (!type || type < 0 || type >= this.spriteFramelst.length) return;
        this.item_1.active = false;
        // 显示对应UI
        switch (type) {
            case 0:
                this.item_1.active = true;
                break;
            default:
                break;
        }

        // this.itemSp.node.active = true;
    }
}
