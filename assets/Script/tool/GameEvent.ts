/**
 * @file 游戏事件派发管理模块
 * @author CaoYang 2024/8/12
 */
const { ccclass } = cc._decorator;

class callFunc {
    callback = null;
    target = null;
    once = false;
}

class globalEvent {
    eventName = '';
    callbacks = [];
};

@ccclass
export default class GameEvent {
    _listenerMap = {};
    _eventList = [];

    /** 网络连接错误 */
    static UI_NETWORK_ERROR = 'UI_NETWORK_ERROR';

    /** 0.5s计时器*/
    static TIMER_HALF_S_UPDATE = 'TIMER_HALF_S_UPDATE';
    /** 每秒钟计时器*/
    static TIMER_S_UPDATE = 'TIMER_S_UPDATE';
    /** 每分钟计时器*/
    static TIMER_M_UPDATE = 'TIMER_M_UPDATE';

    /** 新手引导完成*/
    static MAIN_GUIDE_COMPLETE = 'MAIN_GUIDE_COMPLETE';

    /** 金币更新 */
    static UPDATE_MONEY_DATA = 'UPDATE_MONEY_DATA';
    /** 怒气值更新*/
    static UPDATE_ANGER_DATA = 'UPDATE_ANGER_DATA';
    /** 穿戴的皮肤更新*/
    static UPDATE_WEAR_SKIN = 'UPDATE_WEAR_SKIN';

    /** 计算离线收益*/
    static GAME_OFFLINE_EARNINGS = 'GAME_OFFLINE_EARNINGS';

    /** 等级提升*/
    static LEVEL_UP = 'LEVEL_UP';

    /** 切换toggle分页*/
    static UPDATE_TOGGLE_PAGE = 'UPDATE_TOGGLE_PAGE';

    /** item选中*/
    static ITEM_SELECTED = 'ITEM_SELECTED';

    /** 空投出现*/
    static AIR_BOX_APPEAR = 'AIR_BOX_APPEAR';
    /** 主界面空投按钮显示*/
    static MAIN_AIR_BOX_ACTIVE = 'MAIN_AIR_BOX_ACTIVE';

    /** 钱包绑定成功*/
    static BIND_WALLET_SUCCESS = 'BIND_WALLET_SUCCESS';

    private static _instance = new GameEvent();
    static get instance() {
        return this._instance;
    }

    /**
     * 添加监听器
     * @param eventName 事件名
     * @param callback  回调函数
     * @param target    目标对象
     * @param once      是否是一次性的事件
     * @private
     */
    _listener = function (eventName, callback, target, once) {
        //新建一个事件回调对象保存回调函数和目标对象
        let call = new callFunc();
        //回调函数是否是函数对象
        callback instanceof Function ? call.callback = callback : cc.error('event callback not a function');
        //目标对象存不存在
        target ? call.target = target : cc.error('global event is not have target');
        //是否是一次性事件
        call.once = once;

        //如果事件列表不为空，则查找是否已有和将要添加的事件相同事件名的事件
        if (this._eventList.length > 0) {
            //遍历事件列表
            for (let i = 0; i < this._eventList.length; i++) {
                //如果已有相同事件
                if (this._eventList[i].eventName === eventName) {
                    //则只增加事件回调
                    this._eventList[i].callbacks.push(call);
                    //不再查找
                    return;
                    //如果没有找到相同的事件
                } else if (i === this._eventList.length - 1) {
                    //新建全局事件
                    let event = new globalEvent();
                    //事件名是否存在 
                    if (typeof eventName !== 'undefined') {
                        event.eventName = eventName;
                    } else {
                        cc.error('event name is null');
                    }
                    //把创建好的事件回调添加到此次事件
                    event.callbacks.push(call);
                    //把此次事件添加到事件列表
                    this._eventList.push(event);
                    return;
                }
            }
            //如果事件列表为空，则添加一个全局事件
        } else {
            let event = new globalEvent();
            if (typeof eventName !== 'undefined') {
                event.eventName = eventName;
            } else {
                cc.error('event name is null');
            }
            event.callbacks.push(call);
            this._eventList.push(event);
        }
    }

    /**
     *添加事件监听
     * @param event String
     * @param callback function
     * @param target
     */
    addListener = function (event, callback, target) {
        this._listener(event, callback, target, false);
    }

    addOnceListener = function (event, callback, target) {
        this._listener(event, callback, target, true);
    }

    /**
     * 移除事件
     * @param event
     * @param callback
     * @param target
     */
    removeListener = function (event, callback, target) {
        for (let i = 0; i < this._eventList.length; i++) {
            //找到事件
            if (this._eventList[i].eventName === event) {
                for (let j = 0; j < this._eventList[i].callbacks.length; j++) {
                    //找到事件回调
                    if (this._eventList[i].callbacks[j].target === target) {
                        //移除回调对象上的监听器
                        this._eventList[i].callbacks.splice(j, 1);
                    }
                }

            }
        }
    }

    /**
     * 移除所有事件
     * @param event 
     */
    removeAllListener = function (event) {
        for (let i = 0; i < this._eventList.length; i++) {
            if (this._eventList[i].eventName === event) {
                this._eventList.splice(i, 1);
            }
        }
    }

    /**
     * 触发事件
     * @param event String
     * @param data
     */
    dispatchEvent = function (event, data = null) {
        //遍历事件列表
        for (let i = 0; i < this._eventList.length; i++) {
            //如果事件列表里有此次事件（任意一个对象添加了监听器，都会把事件存放在事件列表）
            if (this._eventList[i].eventName === event) {
                //根据自定义的层级顺序发送事件
                for (let j = this._eventList[i].callbacks.length - 1; j >= 0; j--) {
                    let callback = this._eventList[i].callbacks[j].callback;
                    let target = this._eventList[i].callbacks[j].target;
                    callback.call(target, data);

                    if (!this._eventList[i].callbacks[j]) {
                        continue;
                    }
                    if (this._eventList[i].callbacks[j].once) {
                        this._eventList[i].callbacks.splice(j, 1);
                    }
                }

                //找到事件并触发完成后，不再继续查找
                return;
            }
        }
    }
}