import GameData from "../tool/GameData";
import GameUI from "../tool/GameUI";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RankListItem extends cc.Component {

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.SpriteFrame)
    bgArr: cc.SpriteFrame[] = [];

    @property(cc.Node)
    rankIcon: cc.Node = null;

    @property(cc.SpriteFrame)
    rankIconArr: cc.SpriteFrame[] = [];

    @property(cc.Label)
    rankLab: cc.Label = null;

    @property(cc.Sprite)
    head: cc.Sprite = null;

    @property(cc.Label)
    nickName: cc.Label = null;

    @property(cc.Sprite)
    goldIcon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    goldIconArr: cc.SpriteFrame[] = [];

    @property(cc.Label)
    num: cc.Label = null;

    rankData: any;

    init(base, data) {
        this.rankData = data;
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, data);
        //判断是不是自己
        if (data.isMe) {
            this.initMeUI();
        } else {
            this.initOtherUI();
        }

    }

    /**
     * 初始化自己的排名
     */
    initMeUI() {
        //昵称
        this.nickName.string = GameUtils.instance.getPlayNickName(GameData.instance.nickName);
        //排名
        if (this.rankData.rank >= 1 && this.rankData.rank <= 3) {
            this.rankIcon.getComponent(cc.Sprite).spriteFrame = this.rankIconArr[this.rankData.rank - 1];
            this.rankIcon.active = true;
            this.rankLab.node.active = false;
            this.bg.spriteFrame = this.bgArr[this.rankData.rank + 1];
        } else {
            this.rankLab.string = `${this.rankData.rank >= 0 ? this.rankData.rank : '--'}`;
            this.rankIcon.active = false;
            this.rankLab.node.active = true;
            this.bg.spriteFrame = this.bgArr[1];
        }

        //加载tg头像
        GameUI.instance.loadTGHead(this.head, GameData.instance.photoUrl);
        //加载金币图标
        let goldType = this.rankData.curMoneyType;
        this.goldIcon.spriteFrame = this.goldIconArr[goldType - 1];
        if (1 == goldType) {//猴币
            this.num.node.color = new cc.Color().fromHEX('#FFB424');
            this.num.node.getComponent(cc.LabelOutline).enabled = false;
            //分数
            let socreStr = GameUtils.instance.getShowDiamond(GameData.instance.moneyData.serverTotal);
            this.num.string = socreStr ? socreStr : '0';
        } else if (2 == goldType) {//金积分
            this.num.node.color = new cc.Color().fromHEX('#FFFFFF');
            this.num.node.getComponent(cc.LabelOutline).enabled = true;
            //分数
            let goleStr = GameUtils.instance.getShowDiamond(GameData.instance.pledgeData.goldNum);
            this.num.string = goleStr ? goleStr : '0';
        }
    }

    /**
     * 初始化其他人的排名
     */
    initOtherUI() {
        //昵称
        this.nickName.string = GameUtils.instance.getPlayNickName(this.rankData.name);
        //排名
        if (this.rankData.rank <= 3) {
            this.rankIcon.getComponent(cc.Sprite).spriteFrame = this.rankIconArr[this.rankData.rank - 1];
            this.rankIcon.active = true;
            this.rankLab.node.active = false;
            this.bg.spriteFrame = this.bgArr[this.rankData.rank + 1];
        } else {
            this.rankLab.string = `${this.rankData.rank ? this.rankData.rank : '--'}`;
            this.rankIcon.active = false;
            this.rankLab.node.active = true;
            this.bg.spriteFrame = this.bgArr[0];
        }
        //分数
        let scoreStr = GameUtils.instance.getShowDiamond(this.rankData.score);
        this.num.string = scoreStr ? scoreStr : '0';
        //加载tg头像
        GameUI.instance.loadTGHead(this.head, this.rankData.photoUrl);
        //加载金币图标
        let goldType = this.rankData.curMoneyType;
        this.goldIcon.spriteFrame = this.goldIconArr[goldType - 1];
        if (1 == goldType) {//猴币
            this.num.node.color = new cc.Color().fromHEX('#FFB424');
            this.num.node.getComponent(cc.LabelOutline).enabled = false;
        } else if (2 == goldType) {//金积分
            this.num.node.color = new cc.Color().fromHEX('#FFFFFF');
            this.num.node.getComponent(cc.LabelOutline).enabled = true;
        }
    }
}
