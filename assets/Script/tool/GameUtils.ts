/**
 * @file 游戏工具类管理模块
 * @author CaoYang 2024/8/12
 */

import GameAudio from "./GameAudio";
import GameGlobal from "./GameGlobal";
import GameData from "./GameData";
import GameWeb from "./GameWeb";

/** 日志等级的枚举值 */
export const enum LOG_LEVEL {
    /** debug日志，最低等级 */
    DEBUG = 1,
    /** 信息 */
    INFO,
    /** 警告 */
    WARNING,
    /** 正式版日志 */
    RELEASE,
    /** 错误日志 */
    ERROR,
    /** 最高等级，用于必须打印的日志 */
    TOP = 99999,
}

export default class GameUtils {
    private static _instance = new GameUtils();
    private static _keyStrBase64: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    private static _showUnit: string[] = ['K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y', 'S'];
    private static _showUnit1: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    static get instance() {
        return this._instance;
    }

    /**
     * 是否刘海屏
     * @returns
     */
    isFringe() {
        if (cc.view.getViewportRect().width / cc.view.getViewportRect().height >= 2) return true;
        return false;
    }

    S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    guid() {
        return (this.S4() + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + this.S4() + this.S4());
    }

    /**
     * 判断是否为手机号
     * @param {any} phone 传入的待检测的字符串
     * @returns {boolean} 布尔值
     */
    isPhone(phone: any) {
        var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (!myreg.test(phone)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 是否为数字
     * @param {any} val 传入的待检测的字符
     * @returns {boolean} 布尔值
     */
    isNumber(val: any) {
        var regPos = /^\d+(\.\d+)?$/; //非负浮点数
        var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
        if (regPos.test(val) || regNeg.test(val)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 数值保留指定位数
     * @param num 
     * @param precision 
     * @param separator 
     * @returns 字符串 or NaN
     */
    formatNumber(num, precision = 2, separator = ',') {
        let parts;
        // 判断是否为数字
        if (!isNaN(parseFloat(num)) && isFinite(num)) {
            // 把类似 .5, 5. 之类的数据转化成0.5, 5, 为数据精度处理做准, 至于为什么
            // 不在判断中直接写 if (!isNaN(num = parseFloat(num)) && isFinite(num))
            // 是因为parseFloat有一个奇怪的精度问题, 比如 parseFloat(12312312.1234567119)
            // 的值变成了 12312312.123456713
            num = +(num);
            // 处理小数点位数
            num = ('undefined' !== typeof precision ? (Math.floor(num * 100) / 100).toFixed(precision) : num).toString();
            // 分离数字的小数部分和整数部分
            parts = num.split('.');
            // 整数部分加[separator]分隔, 借用一个著名的正则表达式
            parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + (separator || ','));

            return parts.join('.');
        }
        return NaN;
    }

    /**
     * 当有小数部分时，保留指定位数，没小数部分时，则整数显示
     * @param precision 可选，保留的小数位数，默认2位
     */
    toFixedOnlyHasPoint(num: number, precision = 2) {
        let str = num.toString();
        // 若有小数，则保留1位小数
        if (-1 !== str.indexOf('.')) {
            return num.toFixed(precision);
        } else {
            return str;
        }
    }

    /**
     * 获取带单位的展示金钱
     * @param {number} num 数字
     * @param {number} precision 小数点
     */
    getShowDiamond(num, precision = 2) {
        // 判断是否为数字
        if (!isNaN(parseFloat(num)) && isFinite(num)) {
            num = +(num);

            // 十万以下不转换单位
            let w = Math.pow(10, 5); // 十万
            if (num < w) {
                return num;
            }

            let precisionNum = Math.pow(10, precision);
            let k = Math.pow(10, 3); // 千
            let m = Math.pow(10, 6); // 百万
            let b = Math.pow(10, 9); // 十亿
            let ab = Math.pow(10, 18); // 亿万亿
            let aa = Math.pow(10, 15); // 千万亿
            let t = Math.pow(10, 12); // 万亿
            let numStr = '';
            if (num >= ab) {
                num = Math.round(num * precisionNum / ab) / precisionNum;
                numStr = '' + num + 'ab';
            } else if (num >= aa) {
                num = Math.round(num * precisionNum / aa) / precisionNum;
                numStr = '' + num + 'aa';
            } else if (num >= t) {
                num = Math.round(num * precisionNum / t) / precisionNum;
                numStr = '' + num + 'T';
            } else if (num >= b) {
                num = Math.round(num * precisionNum / b) / precisionNum;
                numStr = '' + num + 'B';
            } else if (num >= m) {
                num = Math.round(num * precisionNum / m) / precisionNum;
                numStr = '' + num + 'M';
            } else if (num >= k) {
                num = Math.round(num * precisionNum / k) / precisionNum;
                numStr = '' + num + 'K';
            }

            return numStr;
        }
        return NaN;
    }

    /**
     * 获取平台信息
     */
    getPaltformType() {
        let paltformType = 0;
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
            paltformType = 1;
        } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
            paltformType = 2;
        }
        return paltformType;
    }

    csvToMap(csv, columnDelimiter = '\t') {
        let arrs = [];
        let arrTable = this.csvToArray(csv, columnDelimiter);
        for (let i = 0; i < arrTable.length; i++) {
            let table = arrTable[i];
            if (!table[0]) continue;
            let arrRow = table[0].split(',');
            for (let j = 0; j < arrRow.length; j++) {
                if (!arrs[j]) arrs[j] = [];
                arrs[j].push(parseInt(arrRow[j]));
            }
        }
        return arrs;
    }

    cvsToObj(csv, columnDelimiter = '\t') {
        let obj = {};
        let arrTable = this.csvToArray(csv, columnDelimiter);
        let keys = arrTable[1];
        let types = arrTable[2];
        for (let i = 4; i < arrTable.length; i++) {
            let table = arrTable[i];
            if (!table[1] || '' === table[1]) continue;
            obj[table[1]] = { ID: +(table[1]) };
            for (let j = 2; j < table.length; j++) {
                if (!table[j] || '' == table[j]) continue;
                if ('int' === types[j] || 'float' === types[j] || 'double' === types[j]) obj[table[1]][keys[j]] = +(table[j]);
                else obj[table[1]][keys[j]] = table[j];
            }
        }
        return obj;
    }

    csvToArray(csv, columnDelimiter = '\t') {
        const table = csv.replace(/\r\n?/g, '\n');
        let quoteCounter = 0;
        let lastDelimiterIndex = 0;
        let arrTable = [[]];
        let anchorRow = arrTable[arrTable.length - 1];
        for (let i = 0; i < table.length; i++) {
            const char = table[i];
            if ("'" === char && '\\' !== table[i - 1]) {
                quoteCounter = quoteCounter ? 0 : 1;
                if (quoteCounter) {
                    lastDelimiterIndex = i + 1;
                }
            } else if (
                !quoteCounter &&
                (char === columnDelimiter || '\n' === char || i === table.length - 1)
            ) {
                const startPos = lastDelimiterIndex;
                let col = startPos >= i ? '' : table.slice(startPos, i).trim();
                if ("'" === col[col.length - 1]) {
                    col = col.slice(0, col.length - 1);
                }
                anchorRow.push(col);
                lastDelimiterIndex = i + 1;
                if ('\n' === char) {
                    anchorRow = arrTable[arrTable.push([]) - 1];
                }
            }
        }
        return arrTable;
    }

    parseCSV(data, spSign) {
        var lines = data.split('\n');
        var objs = {};
        var keys = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.replace(/\r/g, '');
            var values = line.split(spSign);
            var obj: any = {};
            for (var j = 0; j < values.length; j++) {
                if (0 === i) {
                    keys.push(values[j]);
                } else {
                    let str = values[j];
                    if (/^[0-9]+$/.test(str)) str = new Number(str);
                    else if (/^[0-9]+\.?[0-9]+?$/.test(str)) str = new Number(str);
                    obj[keys[j]] = str;
                }
            }
            if (i != 0) objs[obj.id] = obj;
        }
        return objs;
    }

    /**
     * 格式化日期：年/月/日
     * @param date 
     */
    formatDate(date: Date) {
        let month = (date.getMonth() + 1);
        let day = date.getDate();
        let mStr = month < 10 ? '0' + month : month.toString();
        let dStr = day < 10 ? '0' + day : day.toString();

        return date.getFullYear() + '/' + mStr + '/' + dStr;
    }

    /**
     * 格式化日期：月/日
     * @param date 
     */
    formatMonthDate(date: Date) {
        let month = (date.getMonth() + 1);
        let day = date.getDate();
        let mStr = month.toString();
        let dStr = day < 10 ? '0' + day : day.toString();

        return mStr + '/' + dStr;
    }

    /**
     * 格式化日期：日/月/年
     * @param date 
     */
    formatDatePlus(date: Date) {
        let month = (date.getMonth() + 1);
        let day = date.getDate();
        let mStr = month < 10 ? '0' + month : month.toString();
        let dStr = day < 10 ? '0' + day : day.toString();

        return dStr + '/' + mStr + '/' + date.getFullYear();
    }

    /**
     * 格式化日期：年-月-日 时:分:秒
     * @param date 
     */
    formatDateTime(date: Date) {
        let month = (date.getMonth() + 1);
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();

        let mStr = month < 10 ? '0' + month : month.toString();
        let dStr = day < 10 ? '0' + day : day.toString();
        let hStr = hour < 10 ? '0' + hour : hour.toString();
        let minStr = minute < 10 ? '0' + minute : minute.toString();
        let sStr = second < 10 ? '0' + second : second.toString();

        return date.getFullYear() + '-' + mStr + '-' + dStr + ' '
            + hStr + ':' + minStr + ':' + sStr;
    }

    /**
     * 格式化秒数:天
     */
    getDay(second: number) {
        let d = 0;
        if (second > 0) {
            d = Math.floor(second / (3600 * 24));
        }

        let dStr = d < 10 ? '0' + d : d.toString();
        return dStr + '天';
    }

    /**
     * 格式化秒数：时:分:秒
     * @param second 
     */
    getHourAndMinAndSec(second: number) {
        let h = 0, m = 0, s = 0;
        if (second > 0) {
            h = Math.floor(second / 3600);
            m = Math.floor(second / 60) % 60;
            s = second % 60;
        }

        let hStr = h < 10 ? '0' + h : h.toString();
        let mStr = m < 10 ? '0' + m : m.toString();
        let sStr = s < 10 ? '0' + s : s.toString();

        return hStr + ':' + mStr + ':' + sStr;
    }

    /**
     * 格式化秒数：分:秒
     * @param second 
     * @returns 
     */
    getMinAndSec(second: number) {
        let m = 0, s = 0;
        if (second > 0) {
            let r1 = second % 3600;//余数
            m = Math.floor(r1 / 60);
            s = second % 60;
        }

        let mStr = m < 10 ? '0' + m : m.toString();
        let sStr = s < 10 ? '0' + s : s.toString();

        return mStr + ':' + sStr;
    }

    /**
     * 格式化秒数：时:分
     * @param second 
     */
    getHourAndMin(second: number) {
        let h = 0, m = 0, s = 0;
        if (second > 0) {
            h = Math.floor(second / 3600);
            m = Math.floor(second / 60) % 60;
            s = second % 60;
        }

        let hStr = h < 10 ? '0' + h : h.toString();
        let mStr = m < 10 ? '0' + m : m.toString();
        let sStr = s < 10 ? '0' + s : s.toString();

        return hStr + '时' + mStr + '分';
    }

    /**
     * 格式化秒数：X天X小时
     * @param second 
     * @returns 
     */
    getDayAndHour(second: number) {
        let h = 0, m = 0, s = 0, d = 0;
        if (second > 0) {
            d = Math.floor(second / (3600 * 24));
            second = second % (3600 * 24)
            h = Math.ceil(second / 3600);
            second = second % 3600
            m = Math.ceil(second / 60) % 60;
            s = second % 60;
        }

        let dStr = d < 10 ? '0' + d : d.toString();
        let hStr = h < 10 ? '0' + h : h.toString();
        let mStr = m < 10 ? '0' + m : m.toString();
        let sStr = s < 10 ? '0' + s : s.toString();
        if (d == 0) {
            return hStr + "小时";
        } else {
            return dStr + '天' + hStr + "小时";
        }
    }

    /**
     * 格式化秒数：X天X小时X分
     * @param second 
     * @returns 
     */
    getDayAndHourAndMin(second: number) {
        let h = 0, m = 0, s = 0, d = 0;
        if (second > 0) {
            d = Math.floor(second / (3600 * 24));
            second = second % (3600 * 24)
            h = Math.floor(second / 3600);
            second = second % 3600
            m = Math.ceil(second / 60) % 60;
            s = second % 60;
        }

        let dStr = d < 10 ? '0' + d : d.toString();
        let hStr = h < 10 ? '0' + h : h.toString();
        let mStr = m < 10 ? '0' + m : m.toString();
        let sStr = s < 10 ? '0' + s : s.toString();
        if (d == 0 && h == 0) {
            return mStr + "分";
        } else if (d == 0) {
            return hStr + "小时" + mStr + "分";
        } else {
            return dStr + '天' + hStr + "小时" + mStr + "分";
        }
    }

    /**
     * 
     * 获取下周X的日期
     */
    getNexWeek(nexday, addTime) {
        // addTime = 4 * 60 * 60;
        // nexday = 3;
        let curTimeData = GameData.instance.serverTime;
        var curTime = new Date(curTimeData);
        var stamp;
        stamp = new Date(curTimeData);
        var num = - stamp.getDay() + nexday;
        stamp.setDate(stamp.getDate() + num);
        var year = stamp.getFullYear();
        var month = stamp.getMonth() + 1;
        var mvar = month + "";
        var day = stamp.getDate();
        var dvar = day + ""
        var getTime = new Date(year + "-" + mvar + "-" + dvar + " 00:00:00").getTime();
        if (getTime + addTime < curTime) {
            num = 7 - stamp.getDay() + nexday;
            stamp.setDate(stamp.getDate() + num);
            year = stamp.getFullYear();
            month = stamp.getMonth() + 1;
            day = stamp.getDate();
            getTime = new Date(year + "-" + month + "-" + day + " 00:00:00").getTime();
            return getTime;
        } else {
            return getTime;
        }
    }

    /**
     * 
     * 获取下个初X的日期
     * (暂时没有判断2月 29 小月31的情况)     
     * */
    getNexMonth(nexday, addTime) {
        // addTime = 4 * 60 * 60;
        // nexday = 3;
        let curTimeData = GameData.instance.serverTime;
        var curTime = new Date(curTimeData);
        var stamp = new Date(curTimeData);
        var y = stamp.getFullYear();
        var m = stamp.getMonth();
        var getTime = new Date(y, m, nexday).getTime();
        if (getTime + addTime < curTime) {
            y = stamp.getFullYear();
            m = stamp.getMonth() + 1;
            getTime = new Date(y, m, nexday).getTime();
            return getTime;
        } else {
            return getTime;
        }
    }

    /**
     * 检测是否跨天了
     * @param {number} timestamp 时间戳，毫秒数
     */
    checkIsDayChange(timestamp, curTime) {
        let curDate = !!curTime ? new Date(curTime) : new Date();
        let oldDate = new Date(timestamp);
        return curDate.getFullYear() !== oldDate.getFullYear()
            || curDate.getMonth() !== oldDate.getMonth()
            || curDate.getDay() !== oldDate.getDay();
    }

    supportsVibrate() {//判断手机是否支持
        return 'vibrate' in navigator;
    }

    startVibrate(duration = 1) {
        // if (navigator.vibrate) {
        //     //vibrate 1 second
        //     navigator.vibrate(duration);
        // } else if (navigator.webkitVibrate) {
        //     navigator.webkitVibrate(duration);
        // }
    }

    encodeBase64(e) {
        var t = '';
        var n, r, i, s, o, u, a;
        var f = 0;
        e = this._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + GameUtils._keyStrBase64.charAt(s) + GameUtils._keyStrBase64.charAt(o) + GameUtils._keyStrBase64.charAt(u) + GameUtils._keyStrBase64.charAt(a)
        }
        return t
    }

    decodeBase64(e) {
        var t = '';
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9+/=]/g, '');
        while (f < e.length) {
            s = GameUtils._keyStrBase64.indexOf(e.charAt(f++));
            o = GameUtils._keyStrBase64.indexOf(e.charAt(f++));
            u = GameUtils._keyStrBase64.indexOf(e.charAt(f++));
            a = GameUtils._keyStrBase64.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r)
            }
            if (a != 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = this._utf8_decode(t);
        return t
    }

    _utf8_encode(e) {
        e = e.replace(/rn/g, 'n');
        var t = '';
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    }

    _utf8_decode(e) {
        let t = '';
        let n = 0;
        let r = 0, c1 = 0, c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c1 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c1 & 63);
                n += 2
            } else {
                c1 = e.charCodeAt(n + 1);
                c2 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c1 & 63) << 6 | c2 & 63);
                n += 3
            }
        }
        return t
    }

    str_repeat(i, m) {
        for (var o = []; m > 0; o[--m] = i);
        return o.join('');
    }

    sprintf() {
        var i = 0, a, f = arguments[i++], o = [], m, p, c, x, s = '';
        while (f) {
            if (m = /^[^\x25]+/.exec(f)) {
                o.push(m[0]);
            } else if (m = /^\x25{2}/.exec(f)) {
                o.push('%');
            } else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
                if (((a = arguments[m[1] || null === i++])) || (undefined === typeof a)) {
                    throw ('Too few arguments.');
                }
                if (/[^s]/.test(m[7]) && ('number' !== typeof (a))) {
                    throw ('Expecting number but found ' + typeof (a));
                }
                switch (m[7]) {
                    case 'b':
                        a = a.toString(2);
                        break;
                    case 'c':
                        a = String.fromCharCode(a);
                        break;
                    case 'd':
                        a = parseInt(a);
                        break;
                    case 'e':
                        a = m[6] ? a.toExponential(m[6]) : a.toExponential();
                        break;
                    case 'f':
                        a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a);
                        break;
                    case 'o':
                        a = a.toString(8);
                        break;
                    case 's':
                        a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a);
                        break;
                    case 'u':
                        a = Math.abs(a);
                        break;
                    case 'x':
                        a = a.toString(16);
                        break;
                    case 'X':
                        a = a.toString(16).toUpperCase();
                        break;
                }
                a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+' + a : a);
                c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
                x = m[5] - String(a).length - s.length;
                p = m[5] ? this.str_repeat(c, x) : '';
                o.push(s + (m[4] ? a + p : p + a));
            } else {
                throw ('Huh ?!');
            }
            f = f.substring(m[0].length);
        }
        return o.join('');
    }

    scientificNotationToString(param) {
        let strParam = String(param);
        let flag = /e/.test(strParam);
        if (!flag) return strParam;

        // 指数符号 true: 正，false: 负
        let sysbol = true;
        if (/e-/.test(strParam)) {
            sysbol = false;
        }
        // 指数
        let index = +(strParam.match(/\d+$/)[0]);
        // 基数
        let basis = strParam.match(/^[\d\.]+/)[0].replace(/\./, '');

        if (sysbol) {
            return basis.padEnd(index + 1, '0');
        } else {
            return basis.padStart(index + basis.length, '0').replace(/^0/, '0.');
        }
    }

    getFormattedData(value) {
        value = Math.floor(value);
        value = this.scientificNotationToString(value);
        if (value.length < 4) {
            return value;
        } else {
            let result = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + ',');
            let arrays = result.split(',');
            let size = arrays.length;
            if (size > 2) {
                let unitIdx = size - 2 - 1;
                let unit;
                let unitNext;
                let tCount = GameUtils._showUnit.length;
                if (unitIdx < tCount) {
                    unit = GameUtils._showUnit[unitIdx];
                } else {
                    unitIdx = unitIdx - tCount;
                    unit = GameUtils._showUnit1[Math.floor(unitIdx / 26)];
                    unit += GameUtils._showUnit1[unitIdx % 26];
                }

                if (unitIdx + 1 < tCount) {
                    unitNext = GameUtils._showUnit[unitIdx + 1]
                } else {
                    unitIdx = unitIdx - tCount;
                    unitNext = GameUtils._showUnit1[Math.floor((unitIdx + 1) / 26)];
                    unitNext += GameUtils._showUnit1[(unitIdx + 1) % 26];
                }

                result = arrays[0] + ',' + arrays[1];
                if (7 === result.length) {
                    result = arrays[0];
                    result += unitNext;
                } else {
                    result += unit;
                }

            } else {
                result = arrays[0] + ',' + arrays[1];
                if (7 === result.length) {
                    result = arrays[0];
                    result += 'K';
                }
            }


            return result;
        }
    }

    mutiCal(base, per, times) {
        for (let i = 0; i < times; i++) {
            base *= per;
        }
        base = Math.floor(base);
        return base;
    }

    setGrey(node, gray) {
        let s = node.getComponentsInChildren(cc.Sprite);
        for (let i = 0; i < s.length; i++) {
            let material = cc.MaterialVariant.createWithBuiltin(gray ? '2d-gray-sprite' : '2d-sprite', s[i]);
            s[i].setMaterial(0, material);
            if (!gray) material.define('USE_TEXTURE', true);
        }
    }

    vibrate(t) {
        if (!cc.sys.isNative && cc.sys.os != 'iOS' && GameAudio.instance.isEnableVerb()) {
            if (cc.sys.platform != cc.sys.WECHAT_GAME) {
                navigator.vibrate(t);
            } else {
                // wx.vibrateShort();
            }
        }
    }

    checkBangs() {
        let frameSize = cc.view.getFrameSize();
        // iPhone X、iPhone XS
        if ('iOS' == cc.sys.os && 812 === frameSize.height && 375 === frameSize.width) {
            return true;
        }
        // iPhone XS Max、iPhone XR
        if ('iOS' == cc.sys.os && 896 === frameSize.height && 414 === frameSize.width) {
            return true;
        }
        return false;
    }

    /**
     * 范围随机
     * @param {*} min 最小数（包含)
     * @param {*} max 最大数 (包含)
     * @returns {number} [min,max]范围内的一个随机数
     */
    getRndInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 深拷贝
     * @param {*} obj 需要拷贝的对象
     */
    clone(obj) {
        var o;
        if ('object' == typeof obj) {
            if (null === obj) {
                o = null;
            } else {
                if (obj instanceof Array) {
                    o = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        o.push(this.clone(obj[i]));
                    }
                } else {
                    o = {};
                    for (var j in obj) {
                        o[j] = this.clone(obj[j]);
                    }
                }
            }
        } else {
            o = obj;
        }
        return o;
    }

    /**
     * 获取堆栈打印
     */
    getStack() {
        return new Error().stack;
    }

    /* 权重分配 */
    randomByWeight(arr) {
        let length = arr.length;
        let sum = 0;
        for (let i = 0; i < length; i++) {
            sum += arr[i];
        }

        let randVal = Math.floor(Math.random() * sum);
        let grade = 0;
        for (let i = 0; i < length; i++) {
            if (randVal <= arr[i]) {
                grade = i;
                break;
            }
            randVal -= arr[i];
        }
        return grade;
    }

    /* 打乱数组顺序 */
    randArr(arr) {
        var len = arr.length;
        //首先从最大的数开始遍历，之后递减
        for (var i = len - 1; i >= 0; i--) {
            //随机索引值randomIndex是从0-arr.length中随机抽取的
            var randomIndex = Math.floor(Math.random() * (i + 1));
            //下面三句相当于把从数组中随机抽取到的值与当前遍历的值互换位置
            var itemIndex = arr[randomIndex];
            arr[randomIndex] = arr[i];
            arr[i] = itemIndex;
        }
        //每一次的遍历都相当于把从数组中随机抽取（不重复）的一个元素放到数组的最后面（索引顺序为：len-1,len-2,len-3......0）
        return arr;
    }

    /**
    * 判断两个数组是否相同--不管数组顺序，只管值<不能传空数组>
    * @param {*} arr1 数组1
    * @param {*} arr2 数组2
    */
    judgeArrIsEqually(arr1, arr2) {
        if (arr1.length != arr2.length || 0 === arr1.length || 0 === arr2.length) return false;
        //拷贝两个数组
        let copyArr1 = this.clone(arr1);
        let copyArr2 = this.clone(arr2);
        //将数组进行排序
        copyArr1.sort(function (x, y) { return x - y });
        copyArr2.sort(function (x, y) { return x - y });
        let isEqually = true;
        for (let i = 0; i < copyArr1.length; i++) {
            if (copyArr1[i] !== copyArr2[i]) {
                isEqually = false;
                break;
            }
        }
        return isEqually;
    }

    /**
     * 从指定数组中随机获取指定个数的元素
     * @param arr 
     * @param num 需要的个数
     * @param canRepeat 默认false不能重复
     */
    getRandomNumFromArr(arr: any[], num: number, canRepeat: boolean = false) {
        if (!arr || arr.length <= 0 || num <= 0) return [];

        let max = arr.length;
        let result = [];
        if (canRepeat) {
            for (let i = 0; i < num; i++) {
                let index = Math.floor(Math.random() * max);
                result.push(arr[index]);
            }
        } else {
            for (let i = 0; i < num; i++) {
                let index = Math.floor(Math.random() * max);
                result.push(arr[index]);
                arr.splice(index, 1);
                max--;
            }
        }

        return result;
    }

    /**
     * @description 打印日志
     * @param author 作者
     * @param level 日志等级，LOG_LEVEL的枚举值，越高越不会被屏蔽
     * @param params 日志要输出的内容
     * @example GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `role item data: `, data);
     * GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, data);
     */
    log(author: string, level: LOG_LEVEL, ...params: any[]) {
        if (!GameGlobal.DEBUG || level < GameGlobal.curLogLevel) return;

        let stack = this.getStack();
        let arr1 = stack.split('\n');
        let arr2 = arr1[3].split(' ');
        if (!arr2[5]) return;
        let arr3 = arr2[5].split('.');

        let prefix = 'eval' == arr3[0] ? `---- ${author}: \n` : `---- ${author} ${arr3[0]}.js ${arr3[1]}: \n`;
        if ('string' === typeof params[0]) {
            params[0] = prefix + params[0];
        } else {
            params.unshift(prefix);
        }

        if (level === LOG_LEVEL.ERROR || level === LOG_LEVEL.TOP) {
            console.log.apply(undefined, [`%c ${params}`, 'color:red']);
        } else if (level === LOG_LEVEL.WARNING) {
            console.log.apply(undefined, [`%c ${params}`, 'color:#994500']);
        } else {
            console.log.apply(undefined, params);
        }
        // let colorStr = '';
        // switch (level) {
        //     case LOG_LEVEL.DEBUG://debug调试
        //     case LOG_LEVEL.INFO://信息
        //         colorStr = 'color:block';
        //         break;
        //     case LOG_LEVEL.WARNING://警告
        //         colorStr = 'color:#FFD700';
        //         break;
        //     case LOG_LEVEL.RELEASE://正式版日志
        //         colorStr = 'color:#32CD32';
        //         break;
        //     case LOG_LEVEL.ERROR://错误日志
        //         colorStr = 'color:red';
        //         break;

        //     default:
        //         break;
        // }
        // console.log.apply(undefined, [`%c ${params}`, colorStr]);
    }

    /**
     * 字符数组转数字
     * @param {any[]} strArr 字符数组 
     */
    convertToStrToNum(strArr: any[]) {
        if (!strArr || 0 === strArr.length) return [];
        for (let i = 0; i < strArr.length; i++) {
            //数字字符
            if (!isNaN(strArr[i])) strArr[i] = +strArr[i];
        }
        return strArr;
    }

    /**
     * 判断是否是一维数组
     */
    toTwoArr(items) {
        if (this.isNull(items) || items[0] === null) {
            items = null;
        } else {
            if (typeof items[0] === 'number') {
                items = [items]
            } else if (typeof items[0] === 'string') {
                items = [items]
            }
        }
        return items
    }

    /**
     * 判断是否为空
     */
    isNull(obj) {
        let isnull = false;
        if (obj === null || obj === undefined || obj === "undefined") {
            isnull = true;
        }
        return isnull;
    }

    getFileSize(size) {
        let fileSize = '';
        const num = 1024.0;
        if (size > Math.pow(num, 3)) {
            fileSize = (size / Math.pow(num, 3)).toFixed(2) + "G";
        }
        else if (size > Math.pow(num, 2)) {
            fileSize = (size / Math.pow(num, 2)).toFixed(2) + "M";
        } else if (size > num) {
            fileSize = (size / num).toFixed(2) + "K";
        } else {
            fileSize = size + "B";
        }
        return fileSize;
    }

    /**
    * 计算角度
    * @param {*} startPos 起始坐标
    * @param {*} endPos 终点坐标
    */
    getAngle(startPos, endPos) {
        //计算出与x轴的弧度
        let vector = Math.atan2((endPos.y - startPos.y), (endPos.x - startPos.x));
        let angle = vector * 180 / Math.PI - 90;
        return angle;
    }

    /**
     * 判断两个数是否近似相等
     * 因为浮点数精度问题，所以会有0.79999999 和0.8不相等的情况
     * @param num1 
     * @param num2 
     * @param fixCnt 小数点后的位数
     */
    numSubequal(num1: number, num2: number, fixCnt: number) {
        let str1 = num1.toFixed(fixCnt);
        let str2 = num2.toFixed(fixCnt);

        return str1 === str2;
    }

    /**
     * 判断两个数，num1是否大于等于num2
     * 因为浮点数精度问题，所以会有0.79999999 和0.8不相等的情况，主要解决这种近似相等的大于等于
     * @param num1 
     * @param num2 
     * @param fixCnt 
     * @returns 
     */
    numBiggerEqual(num1: number, num2: number, fixCnt: number) {
        if (num1 > num2) return true;

        return this.numSubequal(num1, num2, fixCnt);
    }

    /**
     * 暂停本节点和它的子树上所有节点的节点系统事件，需要注意的是节点系统事件包含触摸和鼠标事件。
     */
    pauseSystemEvents() {
        cc.director.getScene().pauseSystemEvents(true)
    }
    /**
     * 恢复本节点和它的子树上所有节点的节点系统事件，需要注意的是节点系统事件包含触摸和鼠标事件。
     */
    resumeSystemEvents() {
        cc.director.getScene().resumeSystemEvents(true)
    }

    //计算距离
    getDistance(lastPos, fontPos) {
        //计算距离
        let dx = lastPos.x - fontPos.x;
        let dy = lastPos.y - fontPos.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance;
    }

    /**
     * 保留n位小数
     * @param {number} num 值
     * @param {number} value 保留位数
     * @returns 
     */
    retainDecimalPlaces(num: number, value: number) {
        var strNum = (num || 0).toString();
        let str = strNum.split('.');
        if (!str[1] || str[1].length <= value) {
            return num;
        }
        let result = str[0] + '.';
        for (let i = 0; i < value; i++) {
            result += str[1][i];
        }

        return Number(result);
    }

    //判断节点是否为空
    isNodeNull(node) {
        let isNull = true;
        if (node && cc.isValid(node)) {
            isNull = false;
        }
        return isNull;
    }

    /**
     * 判断数组是否是一维数组
     * @param arr 待检测数组
     * @returns 
     */
    isArrayOneDimensional(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) {
                return false; // 如果元素是数组，则不是一维数组
            }
        }
        return true; // 如果所有元素都不是数组，则是一维数组
    }

    /**
     * 图片二进制格式转base64
     * @param bytes 二进制格式
     * @description let bytesData = texture.readPixels();//texture类型cc.RenderTexture
     */
    ImageToBase64(bytes) {
        let base64 = '';
        let encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let byteLength = bytes.byteLength;
        let byteRemainder = byteLength % 3;
        let mainLength = byteLength - byteRemainder;
        var a, b, c, d;
        var chunk;
        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
            d = chunk & 63; // 63 = 2^6 - 1
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }
        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength];
            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2;
            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4; // 3 = 2^2 - 1;
            base64 += encodings[a] + encodings[b] + '==';
        } else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
            a = (chunk & 16128) >> 8; // 16128 = (2^6 - 1) << 8;
            b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4;
            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2; // 15 = 2^4 - 1;
            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }
        return base64; // 'data:image/png;base64,' +
    }

    /**
     * 处理正常文本打字机效果
     * @param content 当前this
     * @param _cur_animal_label 打字机的label 
     * @param _cur_story 打字机播放的字
     * @param speed 打字机速度
     * @param _callback 打字机回调
     */
    handleNormalQuickTalk(content, _cur_animal_label, _cur_story, speed, _callback) {
        let animLab = _cur_animal_label;
        animLab.string = '';
        animLab.node.removeAllChildren();
        animLab.string = _cur_story;
        animLab.node.opacity = 0
        if (animLab._labelSegments) {
            content.scheduleOnce(() => {
                let _labelSegments = animLab._labelSegments;
                let delay = 0;
                let tweenAnim = [];
                for (let i = 0; i < _labelSegments.length; i++) {
                    const element = _labelSegments[i];
                    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, element.getComponent(cc.Label).string + ' x:' + element.x + ' y:' + element.y);
                    const maskNode = new cc.Node();
                    maskNode.addComponent(cc.Mask);
                    maskNode.name = `mask_${element._lineCount}`
                    maskNode.anchorX = element.anchorX;
                    maskNode.anchorY = element.anchorY;
                    maskNode.x = element.x + animLab.node.width / 2;
                    maskNode.y = element.y - animLab.node.height / 2;
                    maskNode.setContentSize(element.getContentSize());

                    element.parent = maskNode;
                    element.x = 0;
                    element.y = 0;
                    element.anchorX = 0.5;
                    element.anchorY = 0.5;
                    element.active = true;
                    animLab.node.addChild(maskNode);
                    let width = maskNode.width;
                    let dur = width / speed;
                    tweenAnim.push({ node: maskNode, delay: delay, dur: dur, width: width });
                    delay += dur;
                }
                animLab.string = '';
                animLab.node.opacity = 255;
                let parentY = animLab.node.y;
                animLab.node.y = 2600;
                content.scheduleOnce(() => {
                    for (let i = 0; i < tweenAnim.length; i++) {
                        const element = tweenAnim[i];
                        element.node.width = 0;
                        // if (i < tweenAnim.length - 1) {
                        //     cc.tween(element.node).delay(element.delay).to(element.dur, { width: element.width }).call(() => {
                        //     }).start();
                        // } else {
                        //     cc.tween(element.node).delay(element.delay).to(element.dur, { width: element.width }).call(() => {
                        //         if (_callback) {
                        //             _callback();
                        //         }
                        //     }).start();
                        // }

                        cc.tween(element.node).delay(element.delay).to(element.dur, { width: element.width }).call(() => {
                            if (i === (tweenAnim.length - 1) && _callback) {
                                _callback();
                            }
                        }).start();
                    }
                    animLab.node.y = parentY;
                }, 0.1);
            }, 0);
        } else {
            animLab.node.opacity = 255;
            if (_callback) {
                _callback();
            }
        }
    }

    /**
     * 处理黑幕文本对话效果
     * @param content 当前this
     * @param _cur_animal_label 打字机的label 
     * @param _cur_story 打字机播放的字
     * @param speed 打字机速度(x秒出现一行)
     * @param _callback 打字机回调
     */
    handleBlackScreenTalk(content, _cur_animal_label, _cur_story, speed, _callback) {
        let animLab = _cur_animal_label;
        animLab.string = '';
        animLab.node.removeAllChildren();
        animLab.string = _cur_story;
        animLab.node.opacity = 0;
        if (animLab._labelSegments) {
            content.scheduleOnce(() => {
                let _labelSegments = animLab._labelSegments;
                let delay = 0;
                let tweenAnim = [];
                let lineCount = 1;
                for (let i = 0; i < _labelSegments.length; i++) {
                    const element = _labelSegments[i];

                    if (lineCount !== element._lineCount) {
                        lineCount = element._lineCount;
                        delay += speed;
                    }
                    tweenAnim.push({ node: element, delay: delay, dur: speed });
                }
                animLab.node.opacity = 255;
                let parentY = animLab.node.y;
                animLab.node.y = 2600;
                content.scheduleOnce(() => {
                    for (let i = 0; i < tweenAnim.length; i++) {
                        const element = tweenAnim[i];
                        element.node.opacity = 0;
                        cc.tween(element.node).delay(element.delay).to(element.dur, { opacity: 255 }).call(() => {
                            if (i === (tweenAnim.length - 1) && _callback) {
                                _callback();
                            }
                        }).start();
                    }
                    animLab.node.y = parentY;
                }, 0);
            }, 0);
        } else {
            animLab.node.opacity = 255;
            if (_callback) {
                _callback();
            }
        }
    }

    /**
     * 获取是长宽比大于2的手机
     */
    getWidthPhone() {
        let isPhone = false;
        let designSize = cc.view.getFrameSize();
        if (designSize.width / designSize.height >= 2) {
            isPhone = true;
        } else {
            isPhone = false;
        }

        return isPhone;
    }

    /**
     * 判断是否是今天
     */
    isToDay(time: string | number | Date) {
        // 创建一个表示当前时间的 Date 对象
        const currentDate = new Date();

        // 获取当前时间的年、月、日信息
        var currentYear = currentDate.getFullYear(); // 获取当前年份
        var currentMonth = currentDate.getMonth() + 1; // 获取当前月份（注意月份从0开始计数）
        var currentDay = currentDate.getDate(); // 获取当前日期

        // 创建一个表示要判断的时间的 Date 对象
        const targetDate = new Date(time); // 这里假设要判断的时间是 2023 年 2 月 25 日

        // 获取要判断的时间的年份、月份、日期
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth() + 1;
        const targetDay = targetDate.getDate();

        // 判断年份、月份、日期是否都相等
        if (currentYear === targetYear && currentMonth === targetMonth && currentDay === targetDay) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 获取玩家昵称
     */
    getPlayNickName(nickName: string, num = 4) {
        if (!nickName) return '';
        if (nickName.length <= num * 2) return nickName;
        //得到昵称前四位
        let firstFour = nickName.substring(0, num);
        let lastFour = nickName.substring(nickName.length - num, nickName.length);
        return `${firstFour}...${lastFour}`;
    }

    /**
     * 获取校验数字分割位
     */
    getNumberSplit(num: any) {
        let numStr = this.clone(num).toString();
        if (numStr.length <= 3) return numStr;
        let resultNum = '';
        for (let i = 0; i < numStr.length; i++) {
            let index = numStr.length - i - 1;
            resultNum += numStr[i];
            if (index % 3 === 0 && index >= 3) {
                resultNum += ',';
            }
        }
        return resultNum;
    }

    /**
     * 是否是电脑端
     * @returns 
     */
    getIsWindows() {
        if (cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_ANDROID) {
            return false;
        }
        return true;
    }

    /**
     * 得到随机暴击(15%概率)
     */
    getRandomCritical() {
        let randomNum = this.getRndInteger(1, 100);
        return randomNum <= 8;
    }
}


