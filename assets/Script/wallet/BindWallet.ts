import BaseDialog from "../tool/BaseDialog";
import GameEvent from "../tool/GameEvent";
import GameUI from "../tool/GameUI";
import GameWeb from "../tool/GameWeb";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BindWallet extends BaseDialog {

    bindData: any = null;

    init(base, data) {
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
     * 绑定钱包
     */
    async onBtnGo() {
        await GameWeb.instance.openModal();
    }

    /**
     * 钱包绑定成功回调
     * @param bindData 
     * @returns 
     */
    async requestBindCall(bindData) {
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
        //                     this.onBtnClose();

        //                 } else {//已经被绑定过了
        //                     //解绑钱包
        //                     GameWeb.instance.disconnect();
        //                     GameUI.instance.showTiShi('tishi/label6');
        //                     if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(false);
        //                     this.onBtnClose();
        //                 }
        //             });
        //         } else {
        //             //解绑钱包
        //             GameWeb.instance.disconnect();
        //             GameUI.instance.showTiShi('tishi/label6');
        //             if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(false);
        //             this.onBtnClose();
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
                                this.onBtnClose();
                            });
                        } else {//绑定失败
                            //绑定失败
                            GameUI.instance.showTiShi('tishi/label5');
                            if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(false);
                            this.onBtnClose();
                        }
                    });
                } else {//已经被绑定过了
                    //解绑钱包
                    GameWeb.instance.disconnect();
                    GameUI.instance.showTiShi('tishi/label6');
                    if (this.bindData && this.bindData.bindCall) this.bindData.bindCall(false);
                    this.onBtnClose();
                }
            });
        });
    }

    onBtnClose() {
        this.node.destroy();
    }
}
