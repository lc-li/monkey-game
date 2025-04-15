import BaseDialog from "../tool/BaseDialog";
import GameData from "../tool/GameData";
import GameUI from "../tool/GameUI";
import GameUtils from "../tool/GameUtils";
import GameWeb from "../tool/GameWeb";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Enrnings extends BaseDialog {

    @property(cc.Node)
    hourNode: cc.Node = null;

    @property(cc.Node)
    offlineNode: cc.Node = null;

    @property(cc.Label)
    offlineNum: cc.Label = null;

    @property(cc.Node)
    goldNode: cc.Node = null;

    @property(cc.Label)
    goldNum: cc.Label = null;

    //离线收益
    offlineMoney: number = 0;
    data: any;

    init(base, data) {
        super.init(base, data);
        this.data = data;
    }

    onLoad() {
        super.onLoad();
        this.updateUI();
    }

    onDestroy() {
        super.onDestroy();
    }

    updateUI() {
        if (this.data.type == 1) {//离线收益
            this.offlineNode.active = false;
            this.goldNode.active = false;
            this.playAnim(this.hourNode);
        } else if (this.data.type == 2) {//在线收益
            this.hourNode.active = false;
            this.goldNode.active = false;
            //随机一个收益
            let offlineSecond = Math.floor(this.data.offlineTime / 1000);
            this.offlineMoney = offlineSecond * GameData.instance.moneyData.onlineNum;
            this.offlineNum.string = `+${GameUtils.instance.getShowDiamond(this.offlineMoney)}`;
            this.playAnim(this.offlineNode);
        } else if (this.data.type == 3) {//质押金积分
            this.offlineNode.active = false;
            this.hourNode.active = false;
            this.goldNum.string = `${GameData.instance.pledgeData.pledgeNum}/H`;
            this.playAnim(this.goldNode);
            //保存数据
            GameData.instance.isOpenAccelerate = true;
            GameData.instance.saveData();
        }
    }

    /**
     * 开始挖掘
     */
    onBtnExcavate() {
        this.onBtnClose();
    }

    /**
     * 获取奖励
     */
    onBtnGet() {
        //飞钱
        GameUI.instance.addFlyEffectEx(this.offlineNum.node, 1, 5);
        //更新金币数量
        GameData.instance.updateMoneyData({ type: 3, offlineTime: this.data.offlineTime });

        //更新离线时间
        GameData.instance.updateOfflineTime();
        this.node.destroy();
    }

    /**
     * 质押金积分加速
     */
    onBtnSpeedUp() {
        let canvas = cc.find('Canvas', cc.director.getScene());
        let mainTS = canvas.getComponent('Main');
        mainTS.onBtnClock({ target: { name: 'goldPointNode' } });
        this.onBtnClose();
    }

    onBtnClose() {
        //离线收益直接获取奖励
        if (2 == this.data.type) {
            this.onBtnGet();
            return;
        }
        this.node.destroy();
    }

    /**
     * 播放动画
     * @param {cc.Node} animNode 动画节点 
     */
    playAnim(animNode: cc.Node) {
        if (!cc.isValid(animNode)) return;

        animNode.setPosition(cc.v2(0, -animNode.height));
        animNode.active = true;

        cc.tween(animNode)
            .to(0.3, { position: cc.v3(0, 0, 0) })
            .start();
    }
}
