import BaseDialog from "../tool/BaseDialog";
import GameData from "../tool/GameData";
import GameEvent from "../tool/GameEvent";
import GameGlobal from "../tool/GameGlobal";
import GameHttp from "../tool/GameHttp";
import GameUI from "../tool/GameUI";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import GameWeb from "../tool/GameWeb";
import List from "../tool/List";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InviteLayout extends BaseDialog {
    @property(List)
    scrollList: List = null;

    @property(cc.Label)
    inviteNum: cc.Label = null;

    @property(cc.Node)
    btn_invite: cc.Node = null;

    @property(cc.Node)
    tips: cc.Node = null;

    inviteArr: any[] = [];//邀请好友数组
    inviteUrl: string = '';//邀请链接

    init(base, data) {
        super.init(base, data);

        this.inviteUrl = `https://t.me/${GameWeb.instance.nn.bot}/${GameWeb.instance.nn.webapp}?startapp=${GameData.instance.myInviteCode}`;
    }

    onLoad() {
        super.onLoad();
        //初始化适配
        this.initWidget();
        //请求邀请列表
        this.requestInvite();
        //播放邀请按钮动画
        this.playBtnAnim();
    }

    onDestroy() {
        super.onDestroy();
    }

    /**
     * 初始化适配
     */
    initWidget() {
        let winHeight = cc.view.getVisibleSize().height / 2;
        let topNode = cc.find('content/topLayout', this.node);
        let topLayout = topNode.getComponent(cc.Layout);
        let inviteNode = cc.find('inviteNode', topNode);
        this.scheduleOnce(() => {
            topLayout.paddingTop = winHeight <= 640 ? 20 : 30;
            topLayout.spacingY = winHeight <= 640 ? 0 : 18;
        }, 1 / 60);
        this.scheduleOnce(() => {
            let inviteHeight = topNode.y + inviteNode.y - this.btn_invite.y - this.btn_invite.height / 2 - 13;
            inviteNode.height = inviteHeight;
            this.scrollList.node.height = inviteHeight - 132;
            cc.find('view', this.scrollList.node).height = inviteHeight - 132;

            // this.tips.setScale(isWindow ? 0.6 : 1);
            this.tips.setScale(winHeight <= 640 ? 0.6 : 1);
            this.tips.y = -inviteHeight / 2 - 25;
        }, 0.1);
    }

    /**
     *  请求邀请列表接口
     */
    requestInvite() {
        let url = GameGlobal.httpPort.inviteList;
        GameHttp.instance.post(url, null,
            (res) => {
                res = JSON.parse(res);
                if (!res || 200 !== res.ret_code || !cc.isValid(this.node)) return;
                this.inviteArr = res.data;
                this.tips.active = (0 == this.inviteArr.length);
                this.scrollList.numItems = this.inviteArr.length;
                this.inviteNum.string = `${this.inviteArr.length}`;
            },
            (err) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
                this.inviteNum.string = `0`;
                this.tips.active = true;
            }
        );
    }

    onListRenderEvent(item, idx) {
        let itemTs = item.getComponent('InviteItem');
        let data = this.inviteArr[idx];

        itemTs.init(this, data);
    }

    //复制邀请链接
    onBtnCopy() {
        GameUI.instance.copyToClipboard(this.inviteUrl);
    }

    //邀请
    onBtnInvate() {
        const _text = GameWeb.instance.shareTxtConfig.text1;
        const _link = `https://t.me/share/url?url=${this.inviteUrl}&text=${encodeURIComponent(_text)}`;
        GameWeb.instance.openLink(_link);
    }

    //关闭
    onBtnClose() {
        this.node.destroy();
        GameEvent.instance.dispatchEvent(GameEvent.UPDATE_TOGGLE_PAGE);
    }

    playBtnAnim() {
        // 放大倍数和动画持续时间
        let scaleTo = 1.05;
        let scaleDuration = 0.6;

        // 创建放大和缩小的 tween 动作
        let scaleUp = cc.tween().to(scaleDuration, { scale: scaleTo }, { easing: 'linear' });
        let scaleDown = cc.tween().to(scaleDuration, { scale: 1 }, { easing: 'linear' });

        // 创建一个循环的序列动作
        cc.tween(this.btn_invite)
            .repeatForever(
                cc.tween()
                    .sequence(scaleUp, scaleDown)
            )
            .start();
    }
}
