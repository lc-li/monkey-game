/**
 * @file 游戏公共管理模块
 * @author CaoYang 2024/8/12
 */
export default class GameGlobal {
    /** 版本号 */
    static version = '0.1.0.41';
    /** 是否是debug模式 ---!!!正式服需要改为 false */
    static DEBUG = true;
    /** 当前的日志等级，比这个等级高的日志才会输出 */
    static curLogLevel = 1;
    /**当前语言类型 1--中文 2--英文 3--繁体 */
    static lauguageType = 2;
    /**
     * @param 0:本机测试 
     * @param 1:内网测试 
     * @param 2:外网测试
     * @param 3:正式
     */
    static PUBLISH_CHANNEL = 0;
    static HTTP_URL = 'http://localhost:1380/';//默认地址
    static BASE_URL = 'https://test.memepet.io/';//

    private static _instance = new GameGlobal();
    static get instance() {
        return this._instance;
    }

    constructor() {
        switch (GameGlobal.PUBLISH_CHANNEL) {
            case 1:
                GameGlobal.HTTP_URL = 'http://192.168.31.139:1380/';
                break;
            case 2:
                GameGlobal.HTTP_URL = 'https://test.memepet.io/1380/';
                GameGlobal.BASE_URL = 'https://test.memepet.io/';
                break;
            case 3:
                GameGlobal.HTTP_URL = 'https://www.uptongame.xyz/1380/';
                GameGlobal.BASE_URL = 'https://www.uptongame.xyz/';
                break;
            default:
                break;
        }
    }

    /**
     * http请求接口
     */
    static httpPort = {
        default: GameGlobal.HTTP_URL + '',
        timer: GameGlobal.HTTP_URL + 'timer',//时间戳
        login: GameGlobal.HTTP_URL + 'login',//登录
        scoreA: GameGlobal.HTTP_URL + 'scoreA',//同步金币
        inviteList: GameGlobal.HTTP_URL + 'inviteList',//邀请列表
        playersU: GameGlobal.HTTP_URL + 'playersU',//更新玩家信息
        ranking: GameGlobal.HTTP_URL + 'ranking',//段位排行榜
        getRankingData: GameGlobal.HTTP_URL + 'getRankingData',//新版排行榜数据
        getAirBox: GameGlobal.HTTP_URL + 'getAirBox',//领取空投
        getBagData: GameGlobal.HTTP_URL + 'getBagData',//获取背包
        getTasks: GameGlobal.HTTP_URL + 'getTasks',//获取任务
        obtainTask: GameGlobal.HTTP_URL + 'obtainTask',//领取任务

        loginN: GameGlobal.HTTP_URL + 'loginN',//登录N处理
        loginT: GameGlobal.HTTP_URL + 'loginT',//登录T处理
        bindT: GameGlobal.HTTP_URL + 'bindT',//绑定T钱包
        accountT: GameGlobal.HTTP_URL + 'accountT',//钱包码
        assetList: GameGlobal.HTTP_URL + 'assetList',//获取所有资产
        getAsset: GameGlobal.HTTP_URL + 'getAsset',//获取资产

        checkWallet: GameGlobal.HTTP_URL + 'checkWallet',//检查钱包是否绑定
    };
}

