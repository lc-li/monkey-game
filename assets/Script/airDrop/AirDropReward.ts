import BaseDialog from "../tool/BaseDialog";
import GameGlobal from "../tool/GameGlobal";
import GameHttp from "../tool/GameHttp";
import GamePublic from "../tool/GamePublic";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import GameTable from "../Table/GameTable";
import { IF_TB_Item } from "../Table/GameCfgInterface";
import GameData, { MONEY_GET_CHANNEL } from "../tool/GameData";
import GameUI from "../tool/GameUI";
import GameEvent from "../tool/GameEvent";
const TB_Item: IF_TB_Item = GameTable.data.Item;

const { ccclass, property } = cc._decorator;

@ccclass
export default class AirDropReward extends BaseDialog {

    @property(cc.Node)
    item1: cc.Node = null;

    @property(cc.RichText)
    tips1: cc.RichText = null;

    @property(cc.Node)
    item2: cc.Node = null;

    @property(cc.Label)
    moneyLab: cc.Label = null;

    @property(cc.Node)
    item3: cc.Node = null;

    @property(cc.Label)
    upNum: cc.Label = null;

    airBoxData: IF_TB_Item = null;

    init(base, data) {
        super.init(base, data);
        GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, data);
        this.airBoxData = TB_Item[data.id];
    }

    onLoad() {
        super.onLoad();
        this.initUI();
    }

    onDestroy() {
        super.onDestroy();
    }

    initUI() {
        if (!this.airBoxData) return;
        let type = this.airBoxData.Reward_type;
        this.item1.active = false;
        this.item2.active = false;
        this.item3.active = false;
        switch (type) {
            case 1://加息券
                this.item1.active = true;
                //更新倍率
                GameUI.instance.setLocalizedLabelText(this.tips1, 'AirDropReward/item1/tips', `${this.airBoxData.Up * 100}%`);
                break;
            case 2://金币
                this.item2.active = true;
                //更新显示的金币
                let showMoney = Math.floor(GameData.instance.moneyData.onlineNum * 60 * 60 * this.airBoxData.Up);
                this.moneyLab.string = GameUtils.instance.getShowDiamond(showMoney);
                break;
            case 3://金积分
                this.item3.active = true;
                this.upNum.string = GameUtils.instance.getShowDiamond(this.airBoxData.Up);
                break;
            default:
                break;
        }
    }

    onBtnGet() {
        //发送领取消息
        let url = GameGlobal.httpPort.getAirBox;
        GameHttp.instance.post(url, {},
            (res: any) => {
                res = JSON.parse(res);
                if (!res || 200 !== res.ret_code) {
                    this.node.destroy();
                    return;
                }
                GamePublic.instance.isHavaAirBox = false;
                //空投数据赋值
                GameData.instance.airBoxData = res.data.airbox;
                GameEvent.instance.dispatchEvent(GameEvent.MAIN_AIR_BOX_ACTIVE, false);
                //飞金币动画
                if (2 == this.airBoxData.Reward_type) {
                    GameUI.instance.addFlyEffectEx(this.node, 1, 5);
                }
                //请求金币服务端数据
                GameData.instance.requestMoneyData(MONEY_GET_CHANNEL.CLICK_ONLINE);
                this.node.destroy();
            },
            (err: any) => {

            }
        );
    }
}
