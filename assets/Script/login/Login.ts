import GameGlobal from "../tool/GameGlobal";
import GameData from "../tool/GameData";
import GameUI, { PRELOAD_TYPE } from "../tool/GameUI";
import LoginLoading from "./LoginLoading";
import GameHttp from "../tool/GameHttp";
import GameStore from "../tool/GameStore";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import GameWeb from "../tool/GameWeb";
import GamePublic from "../tool/GamePublic";

const { ccclass, property } = cc._decorator;

/** 预加载资源列表*/
const resList = [
    //预制体
    ['prefab/public/NumAnim', PRELOAD_TYPE.PREFAB],
    ['prefab/public/PopLoading', PRELOAD_TYPE.PREFAB],
    ['prefab/public/PopTiShi', PRELOAD_TYPE.PREFAB],
    ['prefab/public/FlyEffect', PRELOAD_TYPE.PREFAB],
    ['prefab/public/FlyEffectItem', PRELOAD_TYPE.PREFAB],
];

@ccclass
export default class Login extends cc.Component {
    @property(cc.Node)
    loading: cc.Node = null;

    /** 加载界面脚本*/
    loadingTs: LoginLoading = null;

    onEnable() {
        let isKickToLogin = GamePublic.instance.isKickToLogin;
        if (!isKickToLogin) {
            GameWeb.instance.init();
            GameData.instance.load();
        }
    }

    onLoad() {
        this.loadingTs = this.loading.getComponent(LoginLoading);

        //加载加载界面
        this.loadLoading();
    }

    start() {
        //预加载prefab资源
        GameUI.instance.preload(resList, null, (flag, per) => {
            //请求登录
            if (flag) this.requestLogin();
        });
    }

    loadLoading() {
        //预加载game场景
        cc.director.preloadScene('Main',
            (completedCount, totalCount, item) => {
                let rate = completedCount / totalCount;
                if (this.loadingTs) this.loadingTs.loadSceneRate(rate);
            },
            (error) => {
                if (this.loadingTs) this.loadingTs.isProldGame = true;
            }
        );
    }

    // 请求服务器获取当前玩家登录数据
    requestLogin() {
        let telegramData = GameWeb.instance.getTelegramData();
        let url = GameGlobal.httpPort.login;
        let sendData = {
            id: GameData.instance.userId,
            telegramData: telegramData,
            inviteCode: GameWeb.instance.getInviteCode(), // 邀请码
            // encrypt: game.setting.encrypt,
        };

        GameHttp.instance.post(url, sendData,
            (res) => {
                res = JSON.parse(res);
                GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, res);
                if (res) {
                    //检测是否登陆成功
                    if (200 !== res.ret_code) {
                        //提示登录失败
                        GameUI.instance.showTiShi("tishi/label3");
                        return;
                    }

                    let data = res.data;
                    GameData.instance.accessToken = res.access_token;
                    GameData.instance.userId = data.id;
                    if (data.openId) GameData.instance.openId = data.openId;
                    GameData.instance.nickName = data.name;
                    if (data.url) GameData.instance.photoUrl = data.url;
                    GameData.instance.myInviteCode = data.myInviteCode;
                    //金币数据
                    GameData.instance.moneyData.serverTotal = data.scoreSum;
                    GameData.instance.moneyData.serverNum = data.score;
                    //怒气值数据
                    GameData.instance.angerData.curNum = data.powers;
                    GameData.instance.angerData.refreshTime = data.powersRefreshTime;
                    //空投数据
                    GameData.instance.airBoxData = data.airbox;
                    //更新当前游戏的默认数据
                    GameData.instance.updateDefaultData(data.equiped);

                    //钱包码
                    if (data.tAddress) GameData.instance.tonAddress = data.tAddress;

                    if (res.scores) {
                        GameUI.instance.showDialog('ui/guide/GuideNew', 'GuideNew', this, false,
                            {
                                scoreData: res.scores,
                                callback: () => {
                                    this.enterGameLoadData();
                                }
                            });
                    } else {
                        //赋值完毕进入游戏
                        this.enterGameLoadData();
                    }
                } else {
                }
            },
            (err) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
            }
        );
    }

    /**
     * 登录游戏加载数据
     */
    enterGameLoadData() {
        this.loadingTs.updateLoad(true);
        GameData.instance.saveData();

        //更新在线挂机收益
        GameData.instance.updateOnlineMoney();
        //更新每次点击所获得的金币数量
        GameData.instance.updateClickMoneyData();
    }
}
