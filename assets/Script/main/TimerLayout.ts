import GameData from "../tool/GameData";
import GameEvent from "../tool/GameEvent";
import GameGlobal from "../tool/GameGlobal";
import GameHttp from "../tool/GameHttp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TimerLayout extends cc.Component {
    /** 计时间隔 0.5s*/
    TIME_HALF_SECOND_GAP: number = 0.5;
    /** 计时间隔 s*/
    TIME_SECOND_GAP: number = 1;
    /** 计时间隔 minute*/
    TIME_MINUTE_GAP: number = 60;
    /** 0.5计时间隔*/
    timerHalfSecondTime: number = this.TIME_HALF_SECOND_GAP;
    /** 1s计时器间隔 */
    timerSecondTime: number = this.TIME_SECOND_GAP;
    /** 1min计时器间隔 */
    timerMinuteTime: number = this.TIME_MINUTE_GAP;

    onLoad() {
        cc.game.on(cc.game.EVENT_HIDE, this.changeHide, this);//切换到后台
        cc.game.on(cc.game.EVENT_SHOW, this.changeShow, this);//切换到后台

        //请求服务器时间
        this.requestTimer();
    }

    update(dt) {
        // this.timerHalfSecondTime -= dt;
        // if (this.timerHalfSecondTime <= 0) {
        //     this.timerHalfSecondTime = this.TIME_HALF_SECOND_GAP;
        //     //每0.5秒钟执行
        //     this.halfsecondUpdate();
        // }

        this.timerSecondTime -= dt;
        if (this.timerSecondTime <= 0) {
            this.timerSecondTime = this.TIME_SECOND_GAP;
            //每秒钟执行
            this.secondUpdate();

            this.timerMinuteTime--;
            if (this.timerMinuteTime <= 0) {
                this.timerMinuteTime = this.TIME_MINUTE_GAP;
                //每分钟执行
                this.minuteUpdate();
            }
        }
    }

    /**
     * 0.5s执行
     */
    halfsecondUpdate() {
        GameEvent.instance.dispatchEvent(GameEvent.TIMER_HALF_S_UPDATE);
    }

    /**
     * 每秒钟执行
     */
    secondUpdate() {
        GameData.instance.serverTime += 1000;
        //计算在线收益
        GameData.instance.updateMoneyData({ type: 2, onlineTime: 1 });
        GameEvent.instance.dispatchEvent(GameEvent.TIMER_S_UPDATE);
    }

    /**
     * 每分钟执行
     */
    minuteUpdate() {
        GameEvent.instance.dispatchEvent(GameEvent.TIMER_M_UPDATE);
        //更新离线时间
        GameData.instance.updateOfflineTime();
    }

    /**
     * 切换到后台
     */
    changeHide() {
        //更新离线时间
        GameData.instance.updateOfflineTime();
    }

    /**
     * 切换到前台
     */
    changeShow() {
        //请求服务器时间
        this.requestTimer();
    }

    /**
     * 请求服务器时间
     */
    requestTimer() {
        let url = GameGlobal.httpPort.timer;
        GameHttp.instance.get(url,
            (res) => {
                res = JSON.parse(res);
                if (res) {
                    GameData.instance.serverTime = res.data;
                } else {
                    GameData.instance.serverTime = new Date().getTime();
                }
                //计算离线收益
                GameEvent.instance.dispatchEvent(GameEvent.GAME_OFFLINE_EARNINGS);
                //更新离线时间
                GameData.instance.updateOfflineTime();
            },
            (err) => {
                GameData.instance.serverTime = new Date().getTime();
            }
        );
    }
}
