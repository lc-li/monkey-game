import BaseDialog from "./tool/BaseDialog";
import GameData from "./tool/GameData";
import GameGlobal from "./tool/GameGlobal";
import GameHttp from "./tool/GameHttp";
import GameStore from "./tool/GameStore";
import GameUI from "./tool/GameUI";
import GameUtils, { LOG_LEVEL } from "./tool/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GMTest extends BaseDialog {

    @property(cc.Label)
    userId: cc.Label = null;

    init(base, data) {
        super.init(base, data);
    }

    onLoad() {
        super.onLoad();

        this.userId.string = GameData.instance.userId;
    }

    onDestroy() {
        super.onDestroy();
    }

    /**
     * GM界面按钮点击
     * @param event 点击事件
     * @param customEventData 
     */
    onBtnClock(event, customEventData) {
        let name = event.target.name;
        switch (name) {
            case 'btn_close':
                this.close();
                break;
            case 'btn_login':
                {
                    const url = GameGlobal.httpPort.login;
                    GameHttp.instance.post(url, {
                        id: GameData.instance.userId, // 玩家id

                    }, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "login------->", JSON.parse(data));
                    }, (err) => { });
                }
                break;
            case 'btn_timer':
                {
                    const url = GameGlobal.httpPort.timer;
                    GameHttp.instance.get(url, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "timer------->", JSON.parse(data));
                    }, (err) => { });
                }
                break;
            case 'btn_scoreA':
                {
                    const url = GameGlobal.httpPort.scoreA;
                    GameHttp.instance.post(url, {
                        type: 1,// 1在线 2离线
                        normalClick: 2/*普通点击次数*/,
                        criticalClick: 2,/*暴击次数*/
                        onlineTime: 2,/*在线时长*/
                        offlineTime: 0,/*离线时长*/
                        powers: 998/**当前怒气值 */,
                    }, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "scoreA------->", JSON.parse(data));
                        // powers:996 怒气值
                        // score:40040 积分
                        // scoreSum:40040 累计积分
                        // airbox:{id:,state}, 空投
                    }, (err) => { });
                }
                break;
            case 'btn_inviteList':
                {
                    const url = GameGlobal.httpPort.inviteList;
                    GameHttp.instance.post(url, {}, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "inviteList------->", JSON.parse(data));
                    }, (err) => { });
                }
                break;
            case 'btn_playersU':
                {
                    let sendData = {
                        type: 4,
                        id: 1,
                    };
                    const url = GameGlobal.httpPort.playersU;
                    GameHttp.instance.post(url, sendData, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "playersU------->", JSON.parse(data));
                    }, (err) => { });
                }
                break;
            case 'btn_ranking':
                {
                    const url = GameGlobal.httpPort.ranking;
                    GameHttp.instance.post(url, {}, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "ranking------->", JSON.parse(data));
                    }, (err) => { });
                }
                break;
            case 'btn_getAirBox':
                {
                    const url = GameGlobal.httpPort.getAirBox;
                    GameHttp.instance.post(url, {}, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "getAirBox------->", JSON.parse(data));
                        // powers:996 怒气值
                        // score:40040 积分
                        // scoreSum:40040 累计积分
                        // airbox:{id:,state}, 空投
                    }, (err) => { });
                }
                break;
            case 'btn_getBagData':
                {
                    const url = GameGlobal.httpPort.getBagData;
                    GameHttp.instance.post(url, {}, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "getBagData------->", JSON.parse(data));
                    }, (err) => { });
                }
                break;
            case 'btn_getTasks':
                {
                    const url = GameGlobal.httpPort.getTasks;
                    GameHttp.instance.post(url, {}, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "getTasks------->", JSON.parse(data));
                    }, (err) => { });
                }
                break;
            case 'btn_obtainTask':
                {
                    const url = GameGlobal.httpPort.obtainTask;
                    GameHttp.instance.post(url, {}, (data) => {
                        GameUtils.instance.log("yangrui", LOG_LEVEL.INFO, "obtainTask------->", JSON.parse(data));
                    }, (err) => { });
                }
                break;
            case 'btn_clearCache':
                GameUI.instance.loadScene('Login', () => {
                    GameData.cleanAll();
                });
                break;
            case 'btn_addScore'://增加猴币
                let addNum = 10000;
                let moneyData = GameData.instance.moneyData;
                moneyData.normalClick = addNum;
                moneyData.criticalClick = addNum;
                moneyData.onlineTime = addNum;
                GameData.instance.requestMoneyData();
                break;
            case 'btn_addAnger'://恢复怒气值
                GameData.instance.updateAngerData(true, GameData.instance.angerData.totalNum);
                break;
            default:
                break;
        }
    }

    close() {
        this.node.destroy();
    }
}
