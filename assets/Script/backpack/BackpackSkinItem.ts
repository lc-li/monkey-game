import GameData from "../tool/GameData";
import GameEvent from "../tool/GameEvent";
import GameUI from "../tool/GameUI";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import Backpack from "./Backpack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BackpackSkinItem extends cc.Component {
    @property(cc.Sprite)
    bgKuang: cc.Sprite = null;

    @property(cc.Sprite)
    skinSp: cc.Sprite = null;

    @property(cc.Node)
    nameNode: cc.Node = null;

    @property(cc.Label)
    nickName: cc.Label = null;

    @property(cc.Node)
    priceLayout: cc.Node = null;

    @property(cc.Node)
    useIcon: cc.Node = null;

    @property(cc.Node)
    selectKuang: cc.Node = null;

    baseLayer: Backpack = null;
    data: any;

    init(base, data) {
        this.baseLayer = base;
        this.data = data;
        //加载背景框
        GameUI.instance.loadSpriteFrame(this.bgKuang, `ui/backpack/${data.Monkey_base[0]}`, this.name);
        if (-1 == data.Skin_id) {
            this.skinSp.node.active = false;
            this.useIcon.active = false;
        } else {
            //加载皮肤图片
            GameUI.instance.loadSpriteFrame(this.skinSp, `ui/backpack/${data.Monkey_png}`, this.name);
            this.skinSp.node.active = true;
            this.useIcon.active = GameData.instance.curWearSkinId == data.Skin_id;
            if (3 == data.Skin_id) {//悟空
                this.skinSp.node.x = -15;
            } else {
                this.skinSp.node.x = -0;
            }
        }

        //判断是否已解锁
        if (data.isUnlock) {
            this.nameNode.active = false;
        } else {
            //加载底框
            GameUI.instance.loadSpriteFrame(this.nameNode.getComponent(cc.Sprite), `ui/backpack/${data.Monkey_base[1]}`, this.name, {
                callback: () => {
                    if (!cc.isValid(this.node)) return;
                    this.nameNode.active = true;
                    //显示获取途径
                    this.nickName.string = this.getTipStr(data);
                }
            });
        }
    }

    onLoad() {
        GameEvent.instance.addListener(GameEvent.ITEM_SELECTED, this.onItemSelected, this);
    }
    onDestroy() {
        GameEvent.instance.removeListener(GameEvent.ITEM_SELECTED, this.onItemSelected, this);
    }

    onBtnClick() {
        if (this.selectKuang.active) return;
        if (-1 == this.data.Skin_id) {
            GameUI.instance.showTiShi('tishi/label2');
            return;
        }
        GameEvent.instance.dispatchEvent(GameEvent.ITEM_SELECTED, this.data.Skin_id);
    }

    onItemSelected(selectId) {
        this.selectKuang.active = this.data.Skin_id == selectId;
    }

    /**
     * 得到文本描述
     * @param skinData 
     * @returns 
     */
    getTipStr(skinData) {
        if (!skinData) return '';
        switch (skinData.Skin_type) {
            case -1://
                return '???';
            case 1://默认

                break;
            case 2://段位皮肤
                return `Lv.${skinData.Unlock}`;
            case 3://Ton币付费

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
