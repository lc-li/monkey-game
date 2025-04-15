export class BezierData {
    startPos: cc.Vec2;
    c1: cc.Vec2;  // 起点的控制点
    c2: cc.Vec2;  //终点的控制点
    endPos: cc.Vec2;
}

export default class GameBezier {
    private static _instance: GameBezier;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new GameBezier();
        return this._instance;
    }

    /**
     * 引擎自带的贝塞尔曲线运动
     * @param {cc.Node} actNode 运动节点 
     * @param {number} duration 运动时间 
     * @param {BezierData[]} bezierDatas 运动控制点数组
     * @returns 
     */
    runBezierAct(actNode: cc.Node, duration: number, bezierDatas: BezierData[]) {
        if (bezierDatas.length <= 0) return;
        let tw = cc.tween();
        for (let i = 0; i < bezierDatas.length; ++i) {
            tw.bezierTo(duration, bezierDatas[i].c1, bezierDatas[i].c2, bezierDatas[i].endPos);
        }
        actNode.setPosition(bezierDatas[0].startPos);
        tw.clone(actNode).start();
    }

    /**
     * 匀速贝塞尔曲线运动
     * @param {cc.Node} actNode 运动节点 
     * @param {number} duration 运动时间 
     * @param {BezierData[]} bezierDatas 运动控制点数组
     * @param {Function} callback 运动完成回调
     * @returns 
     */
    runUniformBezierAct(actNode: cc.Node, duration: number, bezierDatas: BezierData[], callback?: Function) {
        if (bezierDatas.length <= 0) return;

        let tw = cc.tween();
        let allBezierPos: cc.Vec2[] = [];
        for (let i = 0; i < bezierDatas.length; ++i) {
            let posArr = [bezierDatas[i].startPos, bezierDatas[i].c1, bezierDatas[i].c2, bezierDatas[i].endPos];
            allBezierPos = allBezierPos.concat(this._caculateBezierPoint(posArr));
        }

        let totalLineLen = this._caculateBezierLength(allBezierPos);
        let speed = totalLineLen / duration;
        for (let i = 1; i < allBezierPos.length; ++i) {
            let dis = cc.v2(allBezierPos[i].x - allBezierPos[i - 1].x, allBezierPos[i].y - allBezierPos[i - 1].y).len();
            if (dis > 0) {
                // 这里过滤掉两段贝塞尔曲线首位连接的点
                let t = dis / speed;
                tw.to(t, { position: allBezierPos[i] });
            }
        }
        actNode.setPosition(allBezierPos[0]);
        tw.call(() => {
            callback && callback();
        })
        tw.clone(actNode).start();
    }

    /**
     * 计算所有贝塞尔曲线的点
     * @param {cc.Vec2[]} posArr 
     * @returns 
     */
    private _caculateBezierPoint(posArr: cc.Vec2[]) {
        let allBezierPos = [];
        let gap = 1 / 300 // 每次迭代步长,这个值越小越精细,但是效率越低,这里迭代300次已经够了
        for (let i = 0; i <= 1; i += gap) {
            let pos = this._caculateBezierP(posArr, i);
            allBezierPos.push(pos);
        }

        return allBezierPos;
    }

    /**
     * 计算贝塞尔曲线的长度
     * @param {cc.Vec2[]} allBezierPos 
     * @returns 
     */
    private _caculateBezierLength(allBezierPos: cc.Vec2[]) {
        let totalLineLen = 0;
        for (let i = 1; i < allBezierPos.length; ++i) {
            let dis = cc.v2(allBezierPos[i].x - allBezierPos[i - 1].x, allBezierPos[i].y - allBezierPos[i - 1].y).len();
            totalLineLen += dis;
        }

        return totalLineLen;
    }

    /**
     * 计算三阶贝塞尔在 t时刻 的位置
     * @param p 三阶贝塞尔的四个点,数组对应为 0起点,1起点控制点,2终点控制点,3终点
     * @param t 传入0-1的值,一个时间的迭代过程
     * @returns 
     */
    private _caculateBezierP(p: cc.Vec2[], t: number): cc.Vec2 {
        // 三阶贝塞尔运算
        let bezierP: cc.Vec2 = cc.v2();
        bezierP.x = Math.floor(Math.pow(1 - t, 3) * p[0].x + 3 * t * Math.pow(1 - t, 2) * p[1].x + 3 * Math.pow(t, 2) * (1 - t) * p[2].x + Math.pow(t, 3) * p[3].x);
        bezierP.y = Math.floor(Math.pow(1 - t, 3) * p[0].y + 3 * t * Math.pow(1 - t, 2) * p[1].y + 3 * Math.pow(t, 2) * (1 - t) * p[2].y + Math.pow(t, 3) * p[3].y);
        return bezierP;
    }
}