import GameData from "./GameData";
import GameEvent from "./GameEvent";
import GameGlobal from "./GameGlobal";
import GameHttp from "./GameHttp";
import GameUI from "./GameUI";
import GameUtils, { LOG_LEVEL } from "./GameUtils";

/**
 * @file 游戏外部链接类(Telegram)
 * @author CaoYang 2024/8/27
 */
export default class GameWeb {
    private static _instance: GameWeb;

    /** ton钱包连接数据*/
    tonConnectUI: any = null;

    /** google分析ID*/
    MEASUREMENT_ID = `G-4NRN3VTVC0`;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new GameWeb();
        return this._instance;
    }

    /**
     * N相关配置
     */
    nn = {
        /** tg机器人*/
        bot: GameGlobal.DEBUG ? 'john_monkey_bot' : 'uptonfi_bot',
        /** tg游戏名称*/
        webapp: GameGlobal.DEBUG ? 'john_monkey' : 'UpTonGames',
        /** tg频道群*/
        jointg: GameGlobal.DEBUG ? 'https://t.me/john_monkey_channel' : 'https://t.me/uptonfinance',
        network: GameGlobal.DEBUG ? "-3" : "-239", // CHAIN.TESTNET:"-3", CHAIN.MAINNET: "-239"
        /** 签到钱包的合约地址*/
        checkincontract: 'EQBuPvxtasFPQIs_3jfCM7aoMc1QLJykRkZqmtxrYdQil5o5',
        /** 购买钱包的合约地址*/
        buycontract: 'EQBuPvxtasFPQIs_3jfCM7aoMc1QLJykRkZqmtxrYdQil5o5',
        /** 钱包相关的token*/
        access_token_N: '',
    };

    /**
     * 分享文案
     */
    shareTxtConfig = {
        text1: `Hop on Upton with me! 🤜 Get wild and grab 🐵$BAYC at your fingertips!`,
    };

    /**
     * 初始化各种接口
     */
    init() {
        if (1 == GameGlobal.PUBLISH_CHANNEL) return;
        //初始化telegram
        this.initTelegram();
        //初始化钱包连接
        this.initTonConnect();
        // //初始化tg分析
        // this.initTgAnalytics();
        //初始化vsconsole
        this.initVsConsole();
        //初始化Google分析
        this.initGoogleAnalytics();
    }

    /**
     * 初始化Telegram数据
     */
    initTelegram() {
        GameUI.instance.loadScript(`${GameGlobal.BASE_URL}h5/telegram/js/telegram-web-app.js`, () => {
            //初始化Telegram数据
            //@ts-ignore
            window.Telegram.WebApp.ready();
            //@ts-ignore
            window.Telegram.WebApp.expand(); // full screen
            //Bot API 7.7+以上版本才有 disableVerticalSwipes 方法
            if (!this.checkTelegramVersion('7.7')) return;
            //@ts-ignore
            window.Telegram.WebApp.disableVerticalSwipes();
        });
    }

    /**
     * 初始化TonConnect
     */
    initTonConnect() {
        GameUI.instance.loadScript('https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js', async () => {
            //初始化钱包数据
            //@ts-ignore
            const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
                manifestUrl: `${GameGlobal.BASE_URL}h5/monkey/tonconnect-manifest.json`
                // manifestUrl: 'https://memepet.io/h5/monkey/tonconnect-manifest.json'
            });


            GameEvent.instance.addListener('ton-connect-ui-transaction-sent-for-signature', (event) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'Transaction init', event.detail);
            }, this);

            const unsubscribe = tonConnectUI.onModalStateChange(
                (walletInfo: any) => {
                    GameUtils.instance.log('caoyang', LOG_LEVEL.RELEASE, 'Connection status:', walletInfo);
                    GameUtils.instance.log('caoyang', LOG_LEVEL.RELEASE, 'tonConnectUI.account:', tonConnectUI.account);
                    GameUtils.instance.log('caoyang', LOG_LEVEL.RELEASE, 'tonConnectUI.connected:', tonConnectUI.connected);

                    GameEvent.instance.dispatchEvent(GameEvent.BIND_WALLET_SUCCESS, {
                        walletInfo: walletInfo,
                        tonConnectUI: tonConnectUI,
                    });
                }
            );

            //tonConnectUI.openModal();
            this.tonConnectUI = tonConnectUI;

            // //解绑钱包
            // setTimeout(() => {
            //     this.disconnect();
            // }, 100);
        });
    }

    /**
     * 初始化tg分析
     */
    initTgAnalytics() {
        GameUI.instance.loadScript('https://tganalytics.xyz/index.js', () => {
            // telegramAnalytics
            //@ts-ignore
            window.telegramAnalytics.init({
                token: 'eyJhcHBfbmFtZSI6ImpvaG5fdGVzdDAxIiwiYXBwX3VybCI6Imh0dHBzOi8vdC5tZS9ib3RmYXRoZXIiLCJhcHBfZG9tYWluIjoiaHR0cHM6Ly90ZXN0Lm1lbWVwZXQuaW8ifQ==!K2uPk60vmHztC/TsfyYyPSaHOU0TVhQNk/QfU7rY1Wg=',
                appName: 'john_monkey',
            });
        });
    }

    /**
     * 初始化vsconsole
     */
    initVsConsole() {
        GameUI.instance.loadScript('https://unpkg.com/vconsole@latest/dist/vconsole.min.js', () => {
            //@ts-ignore
            if (GameGlobal.DEBUG) window.vConsole = new VConsole();
        });
    }

    /**
     * 初始化google分析
     */
    initGoogleAnalytics() {
        // GameUI.instance.loadScript(`https://www.googletagmanager.com/gtag/js?id=${this.MEASUREMENT_ID}`, () => {
        //     //@ts-ignore
        //     window.dataLayer = window.dataLayer || [];
        //     //@ts-ignore
        //     function gtag() { dataLayer.push(arguments); }
        //     //@ts-ignore
        //     gtag('js', new Date());
        //     //@ts-ignore
        //     gtag('config', this.MEASUREMENT_ID);

        //发送userId
        try {
            //@ts-ignore
            gtag('config', this.MEASUREMENT_ID, {
                'user_id': GameData.instance.userId,
            });
        } catch (error) {
            GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, error);
        }
        // });
    }

    /**
     * 获取Telegram数据
     * @returns 
     */
    getTelegramData() {
        //@ts-ignore
        if (!window.Telegram) return null;
        //@ts-ignore
        return window.Telegram.WebApp;
    }

    /**
     * 跳转链接
     * @param {string} url 链接 
     */
    openLink(url: string) {
        let telegramData = this.getTelegramData();
        if (telegramData && -1 !== url.indexOf('t.me')) {
            telegramData.openTelegramLink(url);
        } else {
            (window)?.open(url);
        }
    }

    /**
     * 打开钱包
     * @returns 
     */
    async openModal() {
        if (!this.tonConnectUI) return;
        await this.tonConnectUI.openModal();
    }

    /**
     * 检测钱包是否连接
     */
    async connec() {
        if (!this.tonConnectUI) return;
        const connectedWallet = await this.tonConnectUI.connectWallet();
        // Do something with connectedWallet if needed
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, connectedWallet);
    }

    // /**
    //  * 登录请求
    //  * @param {Function} callback 登录回调 
    //  */
    // async requestLoginN(callback?: Function) {
    //     const account = await this.getAccount();
    //     if (account) {
    //         GameHttp.instance.post(GameGlobal.httpPort.loginN, account,
    //             (res: any) => {
    //                 // {"ret_code":200,"data":{},"access_token_N":"eyJhbGciOiJIUzUxMiJ9.eyJpZCI6IjEyNTI5MDcxOTkwMDEyNjQxMjgiLCJwcm9qZWN0SWQiOiIxMjUwNDc0NzIwMzE1MzEwMDgwIiwibm9uY2UiOi0xMzg5NDg1MjY3LCJ0aW1lc3RhbXAiOjE3MTg5Mzk1MDUyMjB9.sDHizvNwWfTMB-_sHei_-R5EXxS2zj9oTaC9YRVcABHsusIlViOzwjrdOkQkgtnj_YC7cVOeNHVw0UZJL_Hk_g"}
    //                 res = JSON.parse(res);
    //                 this.nn.access_token_N = res.access_token_N;
    //                 if (callback) callback();
    //             },
    //             (err: any) => {
    //                 GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
    //             }
    //         );
    //     }
    // }

    /**
     * 登录请求
     * @param {Function} callback 登录回调 
     */
    async requestLoginN(callback?: Function) {
        let telegramData = this.getTelegramData();
        if (!telegramData) return;
        GameHttp.instance.post(GameGlobal.httpPort.loginT, { telegramData: telegramData },
            (res: any) => {
                // {"ret_code":200,"data":{},"access_token_N":"eyJhbGciOiJIUzUxMiJ9.eyJpZCI6IjEyNTI5MDcxOTkwMDEyNjQxMjgiLCJwcm9qZWN0SWQiOiIxMjUwNDc0NzIwMzE1MzEwMDgwIiwibm9uY2UiOi0xMzg5NDg1MjY3LCJ0aW1lc3RhbXAiOjE3MTg5Mzk1MDUyMjB9.sDHizvNwWfTMB-_sHei_-R5EXxS2zj9oTaC9YRVcABHsusIlViOzwjrdOkQkgtnj_YC7cVOeNHVw0UZJL_Hk_g"}
                res = JSON.parse(res);
                this.nn.access_token_N = res.access_token_N;
                if (callback) callback();
            },
            (err: any) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
            }
        );

    }

    /**
     * 绑定web3钱包
     * @returns 
     */
    async requestBindT(callback = null) {
        if (!this.nn.access_token_N) return;
        const account = await this.getAccount();
        account.token = this.nn.access_token_N;
        GameHttp.instance.post(GameGlobal.httpPort.bindT, account,
            (res: any) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'bindT', res);
                if (callback) callback(true);
            },
            (err: any) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
                if (callback) callback(false);
            }
        );
    }

    /**
     * 获取钱包码信息
     * @returns 
     */
    async requestAccout(callback = null) {
        if (!this.nn.access_token_N) return;
        GameHttp.instance.post(GameGlobal.httpPort.accountT, {
            token: this.nn.access_token_N,
        },
            (res: any) => {
                res = JSON.parse(res);
                if (res.ret_code != 200) return;
                let tonData = res.data;
                GameData.instance.tonAddress = tonData.tonAddress;
                GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'accountT', res);
                GameData.instance.saveData();
                if (callback) callback(true);
            },
            (err: any) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
                if (callback) callback(false);
            }
        );
    }

    /**
     * 检测钱包绑定状态
     */
    async checkWalletBindStatus(callback = null) {
        if (!this.nn.access_token_N) return;
        let account = await this.getAccount();
        GameHttp.instance.post(GameGlobal.httpPort.checkWallet, {
            token: this.nn.access_token_N,
            address: account.address,
        },
            (res: any) => {
                res = JSON.parse(res);
                if (res.ret_code != 200) return;

                //true是已经绑定过的不能再绑定，false才是可以绑定
                let resData = res.data;
                if (callback) callback(resData.data);
            },
            (err: any) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
                if (callback) callback(true);
            }
        );
    }

    /**
     * 登出
     */
    disconnect() {
        if (!this.tonConnectUI) return;
        if (!this.checkConnected()) return;
        this.tonConnectUI.disconnect();
    }

    /**
     * 是否已连接
     */
    checkConnected() {
        if (!this.tonConnectUI) return;
        return this.tonConnectUI.connected;
    }

    /**
     * 获取 account信息，登录完成后需要发给服务端
     */
    async getAccount() {
        if (!this.tonConnectUI) return;
        if (!this.checkConnected()) {
            await this.tonConnectUI.openModal();
            return;
        }
        return this.tonConnectUI.account;
    }

    /**
    * 签到
    */
    async checkIn() {
        if (!this.tonConnectUI) return;
        if (!this.checkConnected()) {
            await this.tonConnectUI.openModal();
            return;
        }
        // payload = 'te6cckEBAQEADgAAGP/MPRQAAAAAAAAAALQmXIo=';
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'payload:', payload);
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'stateInit:', this.tonConnectUI.account.walletStateInit);
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            network: this.nn.network,
            messages: [
                {
                    address: this.nn.checkincontract, // destination address
                    amount: '10000000', //Toncoin in nanotons
                    stateInit: this.tonConnectUI.account.walletStateInit,
                    // payload: 'te6cckEBAQEADgAAGP/MPRQAAAAAAAAAALQmXIo='
                }
            ]
        }
        // const transaction = {
        //     validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        //     messages: [
        //         {
        //             address: "EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
        //             amount: "1",
        //          // stateInit: "base64bocblahblahblah==" // just for instance. Replace with your transaction initState or remove
        //         },
        //         {
        //             address: "EQDmnxDMhId6v1Ofg_h5KR5coWlFG6e86Ro3pc7Tq4CA0-Jn",
        //             amount: "1",
        //          // payload: "base64bocblahblahblah==" // just for instance. Replace with your transaction payload or remove
        //         }
        //     ]
        // }
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'transaction:', transaction);
        try {
            const res = await this.tonConnectUI.sendTransaction(transaction, { skipRedirectToWallet: 'never' });
            // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'res:', res);
            return res;
        } catch (error) {
            // GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'error:', error);
        }
    }

    /**
     * 购买
     */
    async buy(amount = '8000000') {
        if (!this.tonConnectUI) return;
        if (!this.checkConnected()) {
            await this.tonConnectUI.openModal();
            return;
        }
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            network: this.nn.network,
            messages: [
                {
                    address: this.nn.buycontract, // destination address
                    amount: amount, //Toncoin in nanotons
                    stateInit: this.tonConnectUI.account.walletStateInit,
                    // payload: 'te6cckEBAQEADgAAGP/MPRQAAAAAAAAAALQmXIo='
                }
            ]
        }
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'transaction:', transaction);
        try {
            const res = await this.tonConnectUI.sendTransaction(transaction, { skipRedirectToWallet: 'never' });
            // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'res:', res);
            return res;
        } catch (error) {
            // GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'error:', error);
        }
    }

    /**
     * 检查tg版本要求
     * @param {string} version 版本号 
     * @returns 
     */
    checkTelegramVersion(version: string) {
        //@ts-ignore
        var invoiceSupported = window.Telegram.WebApp.isVersionAtLeast(version); // 判断 tg 最低版本需求
        return invoiceSupported;
    }

    /**
     * 触觉反馈
     */
    hapticFeedback(type?: number) {
        let telegramData = this.getTelegramData();
        if (!telegramData) return;
        if (!this.checkTelegramVersion('6.1')) return;
        let typeArr = ['light', 'medium', 'heavy', 'rigid', 'soft'];
        let randomIdx = type ? type : Math.floor(Math.random() * typeArr.length);
        telegramData.HapticFeedback.impactOccurred(typeArr[randomIdx]);
    }

    getInviteCode() {
        // GameUtils.instance.log('caoyang',LOG_LEVEL.INFO,'window.location.href:', window.location.href);
        return this.getURLParameter('tgWebAppStartParam');
    }

    getURLParameter(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        // GameUtils.instance.log('caoyang',LOG_LEVEL.INFO,'location.search:', location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}
