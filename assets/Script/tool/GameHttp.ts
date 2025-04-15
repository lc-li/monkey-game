/**
 * @file 游戏服务器Http连接模块
 * @author CaoYang 2024/8/12
 */
const { ccclass } = cc._decorator;

import GameEvent from './GameEvent';
import GameUI from './GameUI';
import GameGlobal from './GameGlobal';
import GameUtils, { LOG_LEVEL } from './GameUtils';
import GameData from './GameData';

@ccclass
export default class GameHttp {

    private static urls = {};           // 当前请求地址集合

    private static _instance = new GameHttp();

    static get instance() {
        return this._instance;
    }

    get(url, completeCallback, errorCallback) {
        this._sendRequest(url, null, false, completeCallback, errorCallback)
    }

    getByArraybuffer(url, completeCallback, errorCallback) {
        this._sendRequest(url, null, false, completeCallback, errorCallback, 'arraybuffer');
    }

    getWithParams(url, params, completeCallback, errorCallback) {
        this._sendRequest(url, params, false, completeCallback, errorCallback)
    }

    getWithParamsByArraybuffer(url, params, completeCallback, errorCallback) {
        this._sendRequest(url, params, false, completeCallback, errorCallback, 'arraybuffer');
    }

    post(url, params, completeCallback, errorCallback, responseType = null, canRepeat = false) {
        this._sendRequest(url, params, true, completeCallback, errorCallback, responseType, canRepeat);
    }

    _getParamString(params) {
        let result = "";
        for (let name in params) {
            result += name + "=" + params[name] + "&";
        }
        return result.substr(0, result.length - 1);
    }

    _sendRequest(url, params, isPost, completeCallback, errorCallback, responseType = null, canRepeat = false) {
        if (url === null || url === '') return;

        let newUrl;
        if (params) {
            newUrl = url + "?" + this._getParamString(params);
        }
        else {
            newUrl = url;
        }

        GameUtils.instance.log('John', LOG_LEVEL.INFO, "_sendRequest newUrl:" + newUrl);
        if (!canRepeat && GameHttp.urls[newUrl]) {
            GameUtils.instance.log('John', LOG_LEVEL.INFO, "_sendRequest error+" + url);
            return;
        }

        // 防重复请求功能
        GameHttp.urls[newUrl] = true;

        let xhr = new XMLHttpRequest();
        if (isPost) {
            xhr.open("POST", url);
        }
        else {
            xhr.open("GET", newUrl);
        }

        if (responseType === 'arraybuffer') {
            xhr.responseType = responseType;
        }

        // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        let token = 'eyJhbGciOiJSUzI1NiJ9.eyJkYXRhIjoie1widXNlcklkXCI6MTM2ODYwNTYzMTE5NTM4MTc2fSIsImp0aSI6Ik5XRXlZVGszTlRndFlXUTROeTAwTXpBMUxXRTNZMk10WWpJME9UUTRORFV3WldRNSIsImV4cCI6MTYxMDc2NzU5N30.fUOkXLJcz-OzcQMvGfCnHZ9JVxs4PIT8ImTEsfxs0SZq2upavJxy2M1I7zK9UF4Fkv5Zk-QVvvE-MJvoNSgCcAQcplaeXEuhiRwliFRBj4TOjUJVabdAp1MfTxYWauDRqKMcn31RCKAe2rDAhln_92ygxIZnVbSwV8Wk_5lD1zoCp4qk9_zEoZ5bW9TgWkIv9PCtvVnb2eVXlHWWqadfO2Qjw9YQ40z_g02x_Bq-z0obVk96oLmahW3u7yrBtIt7QshXqThKi5tgcakovu6ZK0nsOIkBpZwOq_LkcRe76q2UeolwEAr6vT_AavdEqDTIh-9i9hPtYDHoN_TEPLhE4g","accessTokenExpiresIn":1800,"refreshToken":"eyJhbGciOiJSUzI1NiJ9.eyJkYXRhIjoie1widXNlcklkXCI6MTM2ODYwNTYzMTE5NTM4MTc2fSIsImp0aSI6Ill6Qm1PVFk0TldNdFlXRXlOUzAwWVdSaUxUbGhNV1l0TXpNMVpUaGlZV1U0WW1ZMCIsImV4cCI6MTYxMDc3Mjk5N30.aap_KKTXiH5kCW35z_fkPPQcZDd7dHhi7Eetr3m8aQWqdVnzrUdu-tS99O5R-Bz07XthzX0ITX1Mt6hoMR5cJXcFv7J8u9aU2nqC-GVwt2M-MEmOZBC5Wij74D1yaTdFLFC4QPdbr5mfanmQK-9KJJ97WByaspoyL9w6wGv0PLGf_CSXCE4393-NbKsyfRfD60N8xlYA7_5zjNAUnxhnaZtuaGOB5N-AShIBgzPt3VokkjnhplEz08mwlNpwwXpK8PmJnPkFG4fhwdjGIgkJW1vJXZGc7uXkj7m_WWiTILb1xnAT6q0-sbH83p9ZhGDQhXBPJOzFRxLwVY2T_Cnr9w';

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("encoding", "simple");
        xhr.setRequestHeader("authorization", GameData.instance.accessToken);
        //版本号
        xhr.setRequestHeader("version",GameGlobal.version);
        // xhr.setRequestHeader("Authorization", game.player.accessToken);

        // xhr.setRequestHeader("Content-type","application/json;charset=utf-8");

        xhr.onerror = function () {
            delete GameHttp.urls[newUrl];
            if (!errorCallback) return;
            if (xhr.readyState === 1 && xhr.status === 0) {
                errorCallback("NO_NETWORK");               // 断网
            }
            else {
                errorCallback("UNKNOWN_ERROR");            // 未知错误
            }
        };

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            delete GameHttp.urls[newUrl];
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (completeCallback) {
                    if (responseType === 'arraybuffer') {
                        // xhr.responseType = responseType;
                        completeCallback(xhr.response); // 加载非文本格式
                        GameUtils.instance.log('Caoyang', LOG_LEVEL.INFO, "response:", JSON.parse(xhr.response));
                    } else {
                        completeCallback(xhr.responseText);// 加载文本格式
                        GameUtils.instance.log('Caoyang', LOG_LEVEL.INFO, "responseText:", JSON.parse(xhr.responseText));
                    }
                }
            } else {
                if (errorCallback) errorCallback(xhr.status);
                if (xhr.status === 401) { // 登录验证失败
                    GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'Login authentication failure');
                    //直接给你踢到登录界面
                    GameUI.instance.loadScene('Login', () => {
                        GameUI.instance.showDialog('ui/login/LoginOffline', 'LoginOffline', this, false, { type: 2 });
                    });
                } else if (xhr.status === 402) { // 在其他设备已登录
                    GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'You have logged in to another device');
                    //直接给你踢到登录界面
                    GameUI.instance.loadScene('Login', () => {
                        GameUI.instance.showDialog('ui/login/LoginOffline', 'LoginOffline', this, false, { type: 1 });
                    });
                }
            }
        };

        if (params === null || params === "") {
            xhr.send();
        }
        else {
            xhr.send(JSON.stringify(params));
            // xhr.send(params);
        }
    }
}