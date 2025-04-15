import GameBezier from "../tool/GameBezier";
import GameEvent from "../tool/GameEvent";
import GameUI from "../tool/GameUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AirDrop extends cc.Component {

    bezierPos: any = null;

    /** 空投数据*/
    airBoxData: any = null;

    init(base, data) {
        this.airBoxData = data.airBoxData;
        this.initPosition();
    }

    onLoad() {
        this.initPosition();

        //开始运动
        GameBezier.instance.runUniformBezierAct(this.node, 15, [{
            startPos: this.bezierPos.one,
            c1: this.bezierPos.two,
            c2: this.bezierPos.three,
            endPos: this.bezierPos.four,
        }], () => {
            this.node.destroy();
            //发送空投落地消息
            GameEvent.instance.dispatchEvent(GameEvent.MAIN_AIR_BOX_ACTIVE, true);
        });
    }

    /**
     * 初始化位置
     */
    initPosition() {
        let winHeight = cc.winSize.height / 2;
        this.node.setPosition(0, winHeight);

        let bottomY = -350;
        let gapY = (winHeight - bottomY) / 3;
        let y1 = winHeight - gapY;
        let y2 = winHeight - (gapY * 2);
        //设置曲线动画
        this.bezierPos = {
            one: cc.v2(0, winHeight),
            two: cc.v2(-360 * 2.5, y1),
            three: cc.v2(360 * 2.5, y2),
            four: cc.v2(0, bottomY),
        };
    }

    /**
     * 点击空投
     */
    onBtnClick() {
        GameUI.instance.showDialog('ui/airdrop/AirDropReward', 'AirDropReward', this, false, this.airBoxData);
        this.node.destroy();
    }
}
