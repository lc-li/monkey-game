/**
 * @file 游戏临时保存数据处--常用于切换场景时传递数据
 * @author CaoYang 2024/8/12
 */
export default class GamePublic {
    private static _instance: GamePublic;

    /** 是否有空投出现*/
    private _isHavaAirBox: boolean = false;

    /** 是否是踢到登录界面的*/
    private _isKickToLogin: boolean = false;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new GamePublic();
        return this._instance;
    }

    static cleanAll() {
        this._instance = new GamePublic();
    }

    get isHavaAirBox() {
        return this._isHavaAirBox;
    }

    set isHavaAirBox(value: boolean) {
        this._isHavaAirBox = value;
    }

    get isKickToLogin() {
        return this._isKickToLogin;
    }

    set isKickToLogin(value: boolean) {
        this._isKickToLogin = value;
    }
}
