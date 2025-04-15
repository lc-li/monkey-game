import GameEvent from "./GameEvent";
import GameGlobal from "./GameGlobal";
import GameHttp from "./GameHttp";
import GameStore from "./GameStore";
import GameUtils, { LOG_LEVEL } from "./GameUtils";
import GameTable from "../Table/GameTable";
import { IF_TB_Leaderboard, IF_TB_MonkeyExp, IF_TB_Onlinepoints, IF_TB_TapPoints } from "../Table/GameCfgInterface";
import GamePublic from "./GamePublic";
import GameWeb from "./GameWeb";
const TB_MonkeyExp: IF_TB_MonkeyExp = GameTable.data.MonkeyExp;
const TB_Onlinepoints: IF_TB_Onlinepoints = GameTable.data.Onlinepoints;
const TB_TapPoints: IF_TB_TapPoints = GameTable.data.TapPoints;
const TB_Leaderboard: IF_TB_Leaderboard = GameTable.data.Leaderboard;

/** 金币获取途径 */
export const MONEY_GET_CHANNEL = {
    /** 点击或者在线收益 */
    CLICK_ONLINE: 1,
    /** 离线收益 */
    OFFLINE: 2,
    /** 任务 */
    TASK: 3,
    /** 绑定钱包 */
    BIND_WALLET: 8,
    /** 邀请好友 */
    INVITE_FRIEND: 12,
    /** GM增加 */
    GM: 13,
};

/**
 * @file 游戏共有数据管理模块
 * @author CaoYang 2024/8/12
 */
export default class GameData {
    private static _instance = new GameData();
    static get instance() {
        return this._instance;
    }

    /** token值*/
    accessToken: string = '';
    /** 用户id*/
    userId: string = '';
    /** 用户头像*/
    photoUrl: string = '';
    /** tg用户的openId*/
    openId: string = '';
    /** 用户昵称*/
    nickName: string = '';
    /** 邀请码*/
    myInviteCode: string = '';
    /** 钱包地址*/
    tonAddress: string = '';

    /** 服务器时间戳 (毫秒值)*/
    serverTime: number = 0;
    /**
     * 金币数据
     */
    moneyData: any = {
        /** 服务端记录所有总金币数(消耗金币不影响此数量)*/
        serverTotal: 0,
        /** 服务端记录当前总金币数(消耗金币会影响此数量)*/
        serverNum: 0,
        /** 用户普通点击次数*/
        normalClick: 0,
        /** 用户暴击点击次数*/
        criticalClick: 0,
        /** 在线时间 s*/
        onlineTime: 0,
        /** 单次点击应该增加的金币数*/
        clickNum: 1,
        /** 在线每秒收益金币数*/
        onlineNum: 1,
    };

    /** 怒气数据 */
    angerData: any = {
        /** 怒气总数*/
        totalNum: 2000,
        /** 当前怒气值*/
        curNum: 2000,
        /** 每秒恢复怒气值*/
        recoverNum: 4,
        /** 每次点击消耗的怒气值*/
        consumeNum: 4,
        /** 怒气值刷新的时间戳*/
        refreshTime: 0,
    };

    /** 质押数据*/
    pledgeData: any = {
        goldNum: 0,//金积分
        pledgeNum: 0,//质押数量
    };

    /** 是否显示质押规则*/
    isShowPledgeRule: boolean = true;

    /** 离线时间 (时间戳 毫秒值)*/
    offlineTime: number = 0;

    /** 当前穿戴的皮肤*/
    curWearSkinId: number = 1;

    /** 空投数据*/
    airBoxData: any = null;

    /** 是否打开过金积分加速弹窗*/
    isOpenAccelerate: boolean = false;

    //----------------------------------------------------------------------------------------------------------------------------------------------------------
    /**
     * 加载数据
     */
    load() {
        let playerData = GameStore.instance.get(GameStore.instance.STORE_TYPE.GAME_PLAYER_DATA);
        GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'load ----------------- ', playerData);
        if (!playerData) return;
        for (let key in playerData) {
            this[key] = playerData[key];
        }
    }

    /**
     * 保存数据
     */
    saveData() {
        //需要保存的数据在这里写入
        let data = {
            accessToken: this.accessToken,
            userId: this.userId,
            offlineTime: this.offlineTime,
            isOpenAccelerate: this.isOpenAccelerate,
            tonAddress: this.tonAddress,
            isShowPledgeRule: this.isShowPledgeRule,
        };
        GameStore.instance.put(GameStore.instance.STORE_TYPE.GAME_PLAYER_DATA, data);
    }

    static cleanAll() {
        GameStore.instance.removeAll();
        GameData._instance = new GameData();
        GamePublic.cleanAll();
    }

    /**
     * 更新当前游戏的默认数据
     * @param {any} equipedArr 服务端数据 
     */
    updateDefaultData(equipedArr: any) {
        if (!equipedArr || 0 >= equipedArr.length) return;
        for (let i = 0; i < equipedArr.length; i++) {
            let type = equipedArr[i].type;
            switch (type) {
                case 1://默认皮肤
                    this.curWearSkinId = equipedArr[i].id;
                    break;
                case 2://道具

                    break;

                default:
                    break;
            }
        }
        //穿戴皮肤更新
        GameEvent.instance.dispatchEvent(GameEvent.UPDATE_WEAR_SKIN);
    }

    /**
     * 更新金币数量
     * @param {any} data 
     * {点击 -- type:1,isCritical:是否暴击}
     * {在线挂机收益 -- type: 2,onlineTime:在线时间}
     * {离线收益 -- type: 3,offlineTime:离线时间}
     */
    updateMoneyData(data: any) {
        if (!data || !data.type) return;
        switch (data.type) {
            case 1://点击
                if (data.isCritical) {
                    this.moneyData.criticalClick++;
                } else {
                    this.moneyData.normalClick++;
                }
                break;
            case 2://在线挂机收益
                this.moneyData.onlineTime += data.onlineTime;
                break;
            case 3://离线收益
                //请求服务端数据
                this.requestMoneyData(MONEY_GET_CHANNEL.OFFLINE, data.offlineTime);
                break;

            default:
                break;
        }
        GameEvent.instance.dispatchEvent(GameEvent.UPDATE_MONEY_DATA);
    }

    /**
     * 更新每次点击获得金币的数量
     */
    updateClickMoneyData() {
        let curLevel = this.getCurLevel();
        let tapPointTab = TB_TapPoints[curLevel];
        if (!tapPointTab) return;
        this.moneyData.clickNum = tapPointTab.Tap_points;
    }

    /**
     * 获取每次点击的金币数量
     */
    getClickMoney(isCritical: boolean = false) {
        return this.moneyData.clickNum * (isCritical ? 2 : 1);
    }

    /**
     * 得到当前的总金币数量
     */
    getTotalMoneyNum() {
        let moneyData = this.moneyData;
        //计算正常点击数量
        let normalNum = moneyData.normalClick * this.getClickMoney(false);
        //计算暴击点击数量
        let criticalNum = moneyData.criticalClick * this.getClickMoney(true);
        //计算在线数量
        let onlineTimeNum = moneyData.onlineTime * moneyData.onlineNum;

        return moneyData.serverNum + normalNum + criticalNum + onlineTimeNum;
    }

    /**
     * 同步服务端金币数量
     * @param {number} type 1--点击和在线收益 3--离线收益 
     * @param {number} offlineTime 离线时间(只有类型3的时候才需要)
     */
    requestMoneyData(type: number = 1, offlineTime?: number) {
        //记录临时的点击次数和在线时间
        let tempNormalClick = this.moneyData.normalClick;
        let tempCriticalClick = this.moneyData.criticalClick;
        let tempOnlineTime = this.moneyData.onlineTime;
        //请求数据
        let url = GameGlobal.httpPort.scoreA;
        let sendData = {
            type: type,
            powers: this.angerData.curNum,//怒气值
            powersRefreshTime: this.angerData.refreshTime,//怒气值刷新时间
        };
        switch (type) {
            case MONEY_GET_CHANNEL.CLICK_ONLINE://点击和在线收益
                sendData['normalClick'] = tempNormalClick;
                sendData['criticalClick'] = tempCriticalClick;
                sendData['onlineTime'] = tempOnlineTime;
                break;
            case MONEY_GET_CHANNEL.OFFLINE://离线收益
                sendData['offlineTime'] = offlineTime;
                break;
            default:
                break;
        }

        GameHttp.instance.post(url, sendData,
            (res) => {
                res = JSON.parse(res);
                if (!res || 200 !== res.ret_code) return;
                let oldScoreSum = GameUtils.instance.clone(this.moneyData.serverTotal);
                //服务端数据赋值
                this.moneyData.serverTotal = res.data.scoreSum;
                this.moneyData.serverNum = res.data.score;
                switch (type) {
                    case MONEY_GET_CHANNEL.CLICK_ONLINE://点击和在线收益
                        //计算点击次数和在线时间
                        this.moneyData.normalClick = Math.max(0, this.moneyData.normalClick - tempNormalClick);
                        this.moneyData.criticalClick = Math.max(0, this.moneyData.criticalClick - tempCriticalClick);
                        this.moneyData.onlineTime = Math.max(0, this.moneyData.onlineTime - tempOnlineTime);
                        break;
                    case MONEY_GET_CHANNEL.OFFLINE://离线收益
                        break;
                    default:
                        break;
                }

                //通知更新金币数据
                GameEvent.instance.dispatchEvent(GameEvent.UPDATE_MONEY_DATA);
                //检测是否升级
                this.checkIsLevelUp(oldScoreSum, res.data.equiped);
                //检测是否需要空投
                this.checkAirDrop(res.data);
            },
            (err) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
            }
        );
    }

    /**
     * 更新怒气值
     * @param {boolean} isAdd 是否增加怒气值
     * @param {number} addNum 可选参数,增加数量
     */
    updateAngerData(isAdd: boolean, addNum?: number) {
        if (isAdd) {//增加
            let refreshTime = this.angerData.refreshTime;
            let curTime = this.serverTime;
            //计算差值
            let diffTime = Math.floor((curTime - refreshTime) / 1000);

            this.angerData.curNum += addNum ? addNum : diffTime * this.angerData.recoverNum;
            this.angerData.curNum = Math.min(this.angerData.totalNum, this.angerData.curNum);
        } else {//减少
            this.angerData.curNum -= this.angerData.consumeNum;
            this.angerData.curNum = Math.max(0, this.angerData.curNum);
        }
        //更新时间
        this.angerData.refreshTime = this.serverTime;
        GameEvent.instance.dispatchEvent(GameEvent.UPDATE_ANGER_DATA);
    }

    /**
     * 更新离线时间
     */
    updateOfflineTime() {
        this.offlineTime = this.serverTime;
        this.saveData();
    }

    /**
     * 得到离线时间
     * @param {number} type 时间格式 0--毫秒 1--秒 2--分 3--小时 4--天 
     */
    getOfflineTime(type: number = 0) {
        let diffTime = this.serverTime - this.offlineTime;
        if (diffTime <= 0) return 0;
        let second = diffTime / 1000;
        switch (type) {
            case 0://毫秒
                return diffTime;
            case 1://秒
                return Math.floor(second);
            case 2://分
                return Math.floor(second / 60);
            case 3://小时
                return Math.floor(second / 60 / 60);
            case 4://天
                return Math.floor(second / 60 / 60 / 24);
        }
    }

    /**
     * 检测是否升级
     * @param {number} oldMoney 上次记录的服务端金币数量
     */
    checkIsLevelUp(oldMoney: number, equiped: any) {
        let oldLevel = this.getCurLevel(oldMoney);
        let newLevel = this.getCurLevel();
        if (newLevel <= oldLevel) return;

        //升级
        GameEvent.instance.dispatchEvent(GameEvent.LEVEL_UP);
        //更新每秒在线收益
        this.updateOnlineMoney();
        //更新每次点击所获得的金币数量
        this.updateClickMoneyData();
        //更新默认皮肤
        this.updateDefaultData(equiped);
    }

    /**
     * 得到当前等级
     * @param {number} serverNum 服务端总金币数 
     */
    getCurLevel(serverNum?: number) {
        let curMoney = serverNum ? serverNum : this.moneyData.serverTotal;
        let curLevel = 1;
        for (const key in TB_MonkeyExp) {
            let data = TB_MonkeyExp[key];
            if (-1 == data.Up_points || data.Up_points >= curMoney) {
                curLevel = data.Exp_id;
                break;
            }
        }
        return curLevel;
    }

    /**
     * 得到最大等级
     */
    getMaxLevel() {
        let objectArr = Object.keys(TB_MonkeyExp);
        return +objectArr[objectArr.length - 1];
    }

    /**
     * 得到升级需要的金币数量
     */
    getUpLvMoney() {
        let curLevel = this.getCurLevel();
        // let maxLevel = this.getMaxLevel();
        // let nextLevel = Math.min(curLevel + 1, maxLevel);
        // let needMoney = TB_MonkeyExp[nextLevel].Up_points;
        let needMoney = TB_MonkeyExp[curLevel].Up_points;
        if (needMoney < 0) needMoney = this.moneyData.serverTotal;
        return needMoney;
    }

    /**
     * 更新每秒在线收益的金币数
     */
    updateOnlineMoney() {
        let curLevel = this.getCurLevel();
        let onlineTab = TB_Onlinepoints[curLevel];
        if (!onlineTab) return;
        this.moneyData.onlineNum = onlineTab.Onlinepoints;
    }

    /**
     * 检测是否有空投出现
     * @param {any} moneyData 金币数据 
     */
    checkAirDrop(moneyData: any) {
        if (!moneyData || !moneyData.airbox || GamePublic.instance.isHavaAirBox) return;
        let airBoxData = moneyData.airbox;
        if (0 !== airBoxData.state) return;
        this.airBoxData = airBoxData;
        //发送消息通知空投出现
        GameEvent.instance.dispatchEvent(GameEvent.AIR_BOX_APPEAR, airBoxData);
    }

    /**
     * 得到当前段位
     * @param {number} serverNum 服务端总金币数 
     */
    getCurRankData(serverNum?: number) {
        //得到当前等级
        let curLevel = this.getCurLevel(serverNum);
        let curRankData = null;
        for (const key in TB_Leaderboard) {
            let data = TB_Leaderboard[key];
            if (data.Goal >= curLevel) {
                curRankData = data;
                break;
            }
        }
        if (!curRankData) {
            let rankArr = Object.keys(TB_Leaderboard);
            let finalIdx = rankArr.length - 1;
            curRankData = TB_Leaderboard[rankArr[finalIdx]];
        }
        return curRankData;
    }


    /**
     * 请求质押数据
     * @param {number} assetType 资产类型 1--全部 3--金积分 4--质押数据 
     * @param {Function} callback 请求完成回调 
     */
    async requestPledgeData(assetType: number, callback?: Function) {
        //检测是否链接钱包
        if (!GameWeb.instance.checkConnected()) {
            this.pledgeData.goldNum = 0;
            this.pledgeData.pledgeNum = 0;
            if (callback) callback();
            return;
        }
        await GameWeb.instance.requestLoginN(async () => {
            const data = await GameWeb.instance.getAccount();
            data.token = GameWeb.instance.nn.access_token_N;
            let url: string;
            if (1 == assetType) {//请求全部数据
                url = GameGlobal.httpPort.assetList;
                GameHttp.instance.post(url, data,
                    (res: any) => {
                        res = JSON.parse(res);
                        if (!res || 200 !== res.ret_code) return;
                        //初始化金积分
                        let assetArr = res.data.data;
                        if (!assetArr || 0 >= assetArr.length) return;
                        for (let i = 0; i < assetArr.length; i++) {
                            let assetData = assetArr[i];
                            switch (assetData.assetType) {
                                case 3://金积分
                                    this.pledgeData.goldNum = assetData.quantity;
                                    break;
                                case 4://质押数据
                                    this.pledgeData.pledgeNum = assetData.quantity;
                                    break;
                                default:
                                    break;
                            }
                        }
                        if (callback) callback();
                    },
                    (err: any) => {
                        GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
                    }
                );
            } else {
                url = GameGlobal.httpPort.getAsset;
                data.assetType = assetType;
                GameHttp.instance.post(url, data,
                    (res: any) => {
                        res = JSON.parse(res);
                        if (!res || 200 !== res.ret_code) return;
                        // 初始化金积分
                        this.pledgeData.goldNum = res.data.quantity ? res.data.quantity : 0;
                        if (callback) callback();
                    },
                    (err: any) => {
                        GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
                    }
                );
            }
        });
    }

}
