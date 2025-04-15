import { PoolManager } from "./tool/PoolManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FlyEffect extends cc.Component {

    random1: number = -100;
    random2: number = 100;
    createcoin: number = 15;
    createTime: number = 0.05;
    standingTime: number = 0.08;
    coinSpeed: number = 1000;

    baseLayer: any;
    data: any;

    coinNode: cc.Node = null;

    init(base, data) {
        this.baseLayer = base;
        this.data = data;
    }

    onPlayConiAni(type, touchPos, coinNode, coinNum = this.createcoin, callback) {
        let tempPlayer = this.node.convertToNodeSpaceAR(touchPos);
        // coinNode.y -= 50;
        // if (type === 3) {
        //     coinNode.x -= 100;
        // }

        this.coinNode = coinNode;
        let surCoinNum = coinNum;

        this.schedule(() => {
            let pre = PoolManager.instance.get('FlyEffectItem');
            if (!pre) return;
            pre.parent = this.node;
            pre.setPosition(tempPlayer);
            let pos = pre.getPosition();

            let number = Math.floor(Math.random() * (800));
            let x = pre.x + number;
            let y = pre.y - 600;
            let coinpos = this.coinNode.getPosition();
            var bezier = [pos, cc.v2(x, y), coinpos];
            if (type === 0 || type === 1 || 2 === type || 3 === type) {
                coinpos = this.coinNode.parent.convertToWorldSpaceAR(coinpos)
                coinpos = this.node.convertToNodeSpaceAR(coinpos);
                bezier = [pos, cc.v2(x, y), coinpos];
                // } else if (type === 2) {
                // bezier = [pos, cc.v2(x, y), cc.v2(coinpos.x - 200, coinpos.y - 50)];
            }
            let preFly = pre.getComponent("FlyEffectItem");
            preFly.init(type);

            let bezierAnim = cc.bezierTo(1, bezier);
            let scaleAnim = cc.scaleTo(0.02, 1.5);

            //播放飞行动画
            surCoinNum--;
            this.playFlyAnim(bezierAnim, scaleAnim, pre, surCoinNum, callback);


        }, 0.03, coinNum);
    }


    /**
     * 播放飞行动画
     * @param {*} bezierAnim 贝塞尔动画
     * @param {*} scaleAnim 缩放动画
     * @param {*} pre 播放动画的节点
     * @param {*} surCoinNum 剩余的硬币数量
     * @param {*} callback 回调
     */
    playFlyAnim(bezierAnim, scaleAnim, pre, surCoinNum, callback) {

        let finshend = cc.callFunc(function () {
            PoolManager.instance.put(pre);
            // this.coinNode.getComponent(cc.Animation).play()
            if (surCoinNum <= 0) {
                //结束
                // this.node.destroy();
                if (callback) callback();
            }
        }, this);

        cc.tween(pre)
            .then(cc.sequence(bezierAnim, scaleAnim, finshend))
            .start();
    }
}
