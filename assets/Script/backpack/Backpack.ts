import BaseDialog from "../tool/BaseDialog";
import GameAudio from "../tool/GameAudio";
import GameGlobal from "../tool/GameGlobal";
import GameHttp from "../tool/GameHttp";
import GameUI from "../tool/GameUI";
import List from "../tool/List";
import GameData from "../tool/GameData";
import { IF_TB_Item, IF_TB_Skin } from "../Table/GameCfgInterface";
import GameTable from "../Table/GameTable";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import GameEvent from "../tool/GameEvent";
const TB_Skin: IF_TB_Skin = GameTable.data.Skin;
const TB_Item: IF_TB_Item = GameTable.data.Item;

const { ccclass, property } = cc._decorator;

@ccclass
export default class Backpack extends BaseDialog {

    @property(cc.Node)
    skinNode: cc.Node = null;//皮肤节点

    @property(sp.Skeleton)
    skinSpine: sp.Skeleton = null;

    @property(cc.Label)
    nickName: cc.Label = null;

    @property(cc.Label)
    skinDescribe: cc.Label = null;

    @property(cc.Node)
    useNode: cc.Node = null;

    @property(cc.Node)
    btn_use: cc.Node = null;

    @property(cc.Node)
    btn_ton: cc.Node = null;

    @property(cc.Label)
    unlockTips: cc.Label = null;

    @property(List)
    skinList: List = null;//皮肤列表

    @property(List)
    ticketList: List = null;//券

    @property(cc.Node)
    noDataTips: cc.Node = null;

    @property(cc.Node)
    bottomToggle: cc.Node = null;

    /** 背包的皮肤数据*/
    skinData: any[] = [];
    /** 已解锁的皮肤数据*/
    unlockSkinData: any[] = [];

    /** 已解锁的券数据*/
    ticketData: any[] = [];

    /** 当前选中的皮肤*/
    curSelectSkinId: number = 0;

    init(base, data) {
        super.init(base, data);
        //得到背包数据
        this.getBackpackData();
    }

    onLoad() {
        super.onLoad();
        this.addEvent();

        //更新适配
        this.initWidget();
        //请求背包数据
        this.requestBackpack();
    }

    onDestroy() {
        super.destroy();
        this.removeEvent();
    }

    addEvent() {
        GameEvent.instance.addListener(GameEvent.ITEM_SELECTED, this.updateSkinDetails, this);//更新选中皮肤详情
    }

    removeEvent() {
        GameEvent.instance.removeListener(GameEvent.ITEM_SELECTED, this.updateSkinDetails, this);//更新选中的皮肤详情
    }

    /**
     * 初始化适配
     */
    initWidget() {
        this.scheduleOnce(() => {
            let skinListHeight = -(this.bottomToggle.y + this.bottomToggle.height) - 31 + this.skinList.node.y;
            this.skinList.node.height = skinListHeight;
            cc.find('view', this.skinList.node).height = skinListHeight - 40;
        }, 1 / 60);
    }

    /**
     * 得到背包数据
     */
    getBackpackData() {
        this.skinData = [];
        for (const key in TB_Skin) {
            let skinTab = GameUtils.instance.clone(TB_Skin[key]);
            this.skinData.push(skinTab);
        }
        //增加一个敬请期待的皮肤数据
        let comeData = {
            Skin_id: -1,
            Skin_type: -1,
            isUnlock: false,
            Monkey_base: ['Monkey_base_5', 'Monkey_base_5_1'],
        };
        this.skinData.push(comeData);
    }

    /**
    * 得到券数据
    */
    getTicketData(stageProps) {
        this.ticketData = [];
        if (!stageProps || 0 >= stageProps.length) return;

        for (let i = 0; i < stageProps.length; i++) {
            let propData = stageProps[i];
            if (0 !== propData.state) continue;
            let ticketTab = TB_Item[propData.id];
            if (!ticketTab) continue;
            this.ticketData.push(ticketTab);
        }
    }

    /**
     * 请求背包
     */
    requestBackpack() {
        let url = GameGlobal.httpPort.getBagData;
        GameHttp.instance.post(url, null,
            (res) => {
                res = JSON.parse(res);
                if (!res || 200 !== res.ret_code || !cc.isValid(this.node)) return;
                //数据赋值
                this.unlockSkinData = res.data.skins;
                this.skinList.numItems = this.skinData.length;
                //默认选中一个皮肤
                GameEvent.instance.dispatchEvent(GameEvent.ITEM_SELECTED, GameData.instance.curWearSkinId);

                //得到券数据
                this.getTicketData(res.data.stageProps);
            },
            (err) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);

            }
        );
    }

    /**
     * 检测皮肤是否解锁
     * @param {number} skinId 待检测的皮肤id
     */
    checkSKinIsUnlock(skinId: number) {
        if (0 >= this.unlockSkinData.length) return false;
        let isUnlock = false;
        for (let i = 0; i < this.unlockSkinData.length; i++) {
            if (skinId == this.unlockSkinData[i].skinId) {
                isUnlock = true;
                break;
            }
        }
        return isUnlock;
    }

    /**
     * 更新选中的皮肤详情
     * @param {number} skinId 皮肤id 
     */
    updateSkinDetails(skinId: number) {
        let skinTab = TB_Skin[skinId];
        if (!skinTab) return;
        this.skinNode.active = true;
        this.curSelectSkinId = skinId;
        //名称
        this.nickName.string = skinTab.Skin_name;
        //描述
        this.skinDescribe.string = skinTab.Skin_description;
        //加载spine动画
        GameUI.instance.loadSpine(this.skinSpine, `spine/ui/pub_1-5/${skinTab.Backpack_spine}/`, skinTab.Backpack_spine, this.name, {
            callback: () => {
                if (!this.skinSpine || !cc.isValid(this.skinSpine.node)) return;
                this.skinSpine.setAnimation(0, 'loop_1', true);
            }
        });

        let isUnlock = this.checkSKinIsUnlock(skinId);
        if (GameData.instance.curWearSkinId == skinId) {
            this.useNode.active = true;
            this.btn_use.active = false;
            this.btn_ton.active = false;
            this.unlockTips.node.active = false;
        } else {
            this.useNode.active = false;

            if (isUnlock) {//已解锁
                this.btn_ton.active = false;
                this.unlockTips.node.active = false;
                this.btn_use.active = true;
            } else {//未解锁
                this.btn_use.active = false;
                switch (skinTab.Skin_type) {
                    case 2://段位皮肤
                        this.btn_ton.active = false;
                        GameUI.instance.setLocalizedLabelText(this.unlockTips, 'Backpack/SkinNode/unlockTips', skinTab.Unlock_description);
                        this.unlockTips.node.active = true;
                        break;
                    case 3://ton币支付
                        this.btn_ton.active = true;
                        this.unlockTips.node.active = false;
                        break;
                    case 4://星币支付

                        break;
                    case 5://空投皮肤

                        break;
                    default:
                        break;
                }
            }
        }
    }

    onSkinListRenderEvent(item, idx) {
        let itemTs = item.getComponent('BackpackSkinItem');
        let data = this.skinData[idx];
        data.isUnlock = this.checkSKinIsUnlock(data.Skin_id);

        itemTs.init(this, data);
    }

    onTicketListRenderEvent(item, idx) {
        let itemTs = item.getComponent('BackpackTicketItem');
        let data = this.ticketData[idx];

        itemTs.init(this, data);
    }

    /**
     * 点击事件
     * @param event 
     */
    onBtnClick(event) {
        let name = event.target.name;
        switch (name) {
            case 'btn_use'://使用
                this.requestUseSkin();
                break;
            case 'btn_ton'://ton购买

                break;

            default:
                break;
        }
    }

    /**
     * 请求替换穿戴的皮肤
     */
    requestUseSkin() {
        const url = GameGlobal.httpPort.playersU;
        let sendData = {
            type: 4,
            id: this.curSelectSkinId,
        };
        GameHttp.instance.post(url, sendData,
            (res) => {
                res = JSON.parse(res);
                if (!res || 200 !== res.ret_code || !res.data) return;
                let equipedData = res.data.equiped;
                if (!equipedData) return;
                //更新默认数据
                GameData.instance.updateDefaultData(equipedData);
                //默认选中一个皮肤
                this.skinList.updateAll();
                //默认选中一个皮肤
                GameEvent.instance.dispatchEvent(GameEvent.ITEM_SELECTED, this.curSelectSkinId);
            },
            (err) => {

            }
        );
    }

    /**
     * toggle点击事件
     * @param toggle 
     */
    onToggleEvent(toggle) {
        GameAudio.instance.playEffect('dianji');
        let name = toggle.node.name;
        this.skinNode.active = false;
        this.ticketList.node.active = false;
        this.noDataTips.active = false;
        switch (name) {
            case 'toggle1'://券
                this.ticketList.node.active = true;
                this.ticketList.numItems = this.ticketData.length;
                this.noDataTips.active = 0 == this.ticketData.length;
                break;
            case 'toggle2'://皮肤
                this.skinNode.active = true;
                break;
            default:
                break;
        }
    }

    /**
     * 点击未知按钮
     */
    onBtnToken() {
        GameUI.instance.showTiShi('tishi/label2');
    }

    onBtnClose() {
        this.node.destroy();
    }
}
