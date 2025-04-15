import GameData from "../tool/GameData";
import GameUtils from "../tool/GameUtils";
import { PoolManager } from "../tool/PoolManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NumAnim extends cc.Component {

    @property(cc.Label)
    num: cc.Label = null;

    isRedouble: boolean = false;

    numData: any = {
        normal: {
            size: 30,
            color: '#FFFFFF',
        },
        critical: {
            size: 44,
            color: '#FFE44F',
        },
    };

    init(base, data) {
        let normalNum = GameData.instance.moneyData.clickNum;
        this.num.string = `+${data.num}`;

        if (data.num == normalNum) {
            this.isRedouble = false;
            this.num.node.color = new cc.Color().fromHEX(this.numData.normal.color);
            this.num.fontSize = this.numData.normal.size;
        } else {
            this.isRedouble = true;
            this.num.fontSize = this.numData.critical.size;
            this.num.node.color = new cc.Color().fromHEX(this.numData.critical.color);
        }

        this.node.setPosition(data.pos);
        this.node.opacity = 255;
        this.node.setScale(1);
        this.node.stopAllActions();

        this.playAnim();
    }

    playAnim() {
        if (!cc.isValid(this.node)) return;
        let randomX = GameUtils.instance.getRndInteger(-10, 10);
        cc.tween(this.node)
            .by(0.4, { x: randomX / 2, y: 200, scale: 0.3 })
            .by(0.8, { x: randomX / 2, y: 150, scale: -0.4, opacity: -255 })
            .call(() => {
                this.node.stopAllActions();
                PoolManager.instance.put(this.node);
            })
            .start();
    }

}
