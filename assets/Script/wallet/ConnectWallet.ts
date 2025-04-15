import BaseDialog from "../tool/BaseDialog";
import GameEvent from "../tool/GameEvent";
import GameUI from "../tool/GameUI";
import GameWeb from "../tool/GameWeb";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ConnectWallet extends BaseDialog {

    bindData: any = null;

    init(base: any, data: any) {
        super.init(base, data);
        this.bindData = data;
    }

    onLoad() {
        super.onLoad();
        GameEvent.instance.addListener(GameEvent.BIND_WALLET_SUCCESS, this.requestBindCall, this);//钱包绑定成功回调
    }

    onDestroy() {
        super.onDestroy();
        GameEvent.instance.removeListener(GameEvent.BIND_WALLET_SUCCESS, this.requestBindCall, this);//钱包绑定成功回调
    }

    /**
     * 连接钱包
     */
    async onBtnConnect() {
        await GameWeb.instance.openModal();
    }

    /**
     * 钱包绑定成功回调
     * @param bindData 
     * @returns 
     */
    async requestBindCall(bindData: { walletInfo: { status: string; }; tonConnectUI: { connected: any; }; }) {
        if (!bindData || !bindData.walletInfo || !bindData.tonConnectUI) return;
        if (!bindData.tonConnectUI.connected) {
            if (bindData.walletInfo.status == 'opened') return;
            //绑定失败
            GameUI.instance.showTiShi('tishi/label5');
            if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(false);
            return;
        }

        // //得到钱包的地址码
        // await GameWeb.instance.requestLoginN(async () => {
        //     //获取钱包地址
        //     await GameWeb.instance.requestAccout(async (result: any) => {
        //         if (result) {
        //             //检测是否绑定钱包
        //             await GameWeb.instance.checkWalletBindStatus(async (result: boolean) => {
        //                 if (!result) {//可以继续绑定
        //                     await GameWeb.instance.requestBindT();
        //                     //绑定成功
        //                     GameUI.instance.showTiShi('tishi/label4');
        //                     if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(true);
        //                     this.close();
        //                 } else {//已经被绑定过了
        //                     //解绑钱包
        //                     GameWeb.instance.disconnect();
        //                     GameUI.instance.showTiShi('tishi/label6');
        //                     if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(false);
        //                     this.close();
        //                 }
        //             });
        //         } else {
        //             //解绑钱包
        //             GameWeb.instance.disconnect();
        //             GameUI.instance.showTiShi('tishi/label6');
        //             if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(false);
        //             this.close();
        //         }
        //     });
        // });

        //得到钱包的地址码
        await GameWeb.instance.requestLoginN(async () => {
            //检测是否绑定钱包
            await GameWeb.instance.checkWalletBindStatus(async (result: boolean) => {
                if (!result) {//可以继续绑定
                    await GameWeb.instance.requestBindT(async (result: any) => {
                        if (result) {//绑定成功
                            await GameWeb.instance.requestAccout((result: any) => {
                                if (!result) return;
                                //绑定成功
                                GameUI.instance.showTiShi('tishi/label4');
                                if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(true);
                                this.close();
                            });
                        } else {//绑定失败
                            //绑定失败
                            GameUI.instance.showTiShi('tishi/label5');
                            if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(false);
                            this.close();
                        }
                    });
                } else {//已经被绑定过了
                    //解绑钱包
                    GameWeb.instance.disconnect();
                    GameUI.instance.showTiShi('tishi/label6');
                    if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(false);
                    this.close();
                }
            });
        });
    }

    onBtnClose() {
        this.close();
        GameEvent.instance.dispatchEvent(GameEvent.UPDATE_TOGGLE_PAGE);
    }

    close() {
        this.node.destroy();
    }
}
