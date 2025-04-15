import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import GameTable from "../Table/GameTable";
import { IF_TB_MonkeyExp } from "../Table/GameCfgInterface";
import GameData from "../tool/GameData";
import GameUI from "../tool/GameUI";
const TB_MonkeyExp: IF_TB_MonkeyExp = GameTable.data.MonkeyExp;

const { ccclass, property } = cc._decorator;

@ccclass
export default class RankPageItem extends cc.Component {

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    @property(cc.Label)
    rate: cc.Label = null;

    init(base, data) {
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, data);
        this.title.string = data.Tier_name;

        let curMoney = GameData.instance.moneyData.serverTotal;
        // let curRankData = GameData.instance.getCurRankData(curMoney);
        // let upNum = GameUtils.instance.clone(TB_MonkeyExp[curRankData.Leaderboard_id > data.Leaderboard_id ? data.Goal : data.Goal + 1].Up_points);
        let upNum = GameUtils.instance.clone(TB_MonkeyExp[data.Goal].Up_points);
        let rate = 0;
        //得到当前段位数据
        if (-1 == upNum) {
            let curRankData = GameData.instance.getCurRankData(curMoney);
            if (curRankData.Leaderboard_id < data.Leaderboard_id) {
                upNum = TB_MonkeyExp[data.Goal - 1].Up_points;
                rate = curMoney / upNum;
            } else {
                rate = 1;
            }
            this.rate.string = `${GameUtils.instance.getShowDiamond(curMoney)}/∞`;
        } else {
            rate = curMoney / upNum;
            this.rate.string = `${GameUtils.instance.getShowDiamond(curMoney)}/${GameUtils.instance.getShowDiamond(upNum)}`;
        }

        this.progressBar.progress = Math.min(1, rate);

        //加载spine
        GameUI.instance.loadSpine(this.spine, `spine/ui/pub_1-5/${data.Phb_spine[0]}/`, data.Phb_spine[0], this.name, {
            callback: () => {
                if (!this.spine || !cc.isValid(this.spine.node)) return;
                this.spine.setAnimation(0, data.Phb_spine[1], true);
            }
        });
    }
}
