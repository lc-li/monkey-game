import GameUtils, { LOG_LEVEL } from "./GameUtils";

/**
 * @file 游戏本地存储模块
 * @author CaoYang 2024/8/12
 */
export default class GameStore {
    private static _instance: GameStore;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new GameStore();
        return this._instance;
    }

    /**
     * 保存的数据类型枚举(PS：所有需要保存的数据都要在这里进行声明并备注)
     */
    STORE_TYPE: any = {
        /** 设备ID */
        DEVICE_ID: "DEVICE_ID",
        /** GameAudio脚本音乐缓存 */
        MUSIC: "MUSIC",
        /** 背景音乐音量 */
        MUSICE_VOLUME: "MUSICE_VOLUME",
        /** GameAudio脚本音频缓存 */
        VOICE: "VOICE",
        /** 音效音量 */
        EFFECTS_VOLUME: "EFFECTS_VOLUME",
        /** GameAudio脚本动效缓存 */
        VERB: "VERB",
        /** GamePlayer部分数据缓存*/
        GAME_PLAYER_DATA: "GAME_PLAYER_DATA",
    }

    /**
     * 清除枚举部分缓存
     */
    static cleanAll() {
        let gameStore = GameStore.instance;
        gameStore.remove(gameStore.STORE_TYPE.GAME_PLAYER_DATA);
    }

    /**
     * 写入并保存一条数据
     * @param {string} key 数据标识
     * @param {any} params 数据内容
     * @returns 
     */
    put(key: string, params: any) {
        if (null === params) {
            return;
        }
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'GameStore put:' + key);
        this.setItem(key, params);
    }

    /**
     * 得到已经写入的某一条数据
     * @param key 数据标识
     * @returns {any} 数据内容
     */
    get(key: string): any {
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'GameStore get:' + key);
        return this.getItem(key);
    }

    setItem(key: string, params: any) {
        if (null === params) {
            return;
        }
        let str = JSON.stringify(params);
        str = this.compileStr(str);
        cc.sys.localStorage.setItem(key, str);
    }

    getItem(key: string) {
        let str = cc.sys.localStorage.getItem(key);
        if (null === str) {
            return null;
        }
        try {
            str = this.uncompileStr(str);
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }

    remove(key: string) {
        cc.sys.localStorage.removeItem(key);
    }

    removeAll() {
        cc.sys.localStorage.clear();
    }

    /**
     * 对字符串进行加密
     * @param code 
     */
    compileStr(code: string) {
        var c = String.fromCharCode(code.charCodeAt(0) + code.length);
        for (var i = 1; i < code.length; i++) {
            c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
        }
        return escape(c);
    }

    /**
     * 字符串进行解密
     * @param code 
     */
    uncompileStr(code: string) {
        code = unescape(code);
        var c = String.fromCharCode(code.charCodeAt(0) - code.length);
        for (var i = 1; i < code.length; i++) {
            c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
        }
        return c;
    }
}

