import BaseDialog from "../tool/BaseDialog";
import GameData from "../tool/GameData";
import GameUI from "../tool/GameUI";
import GameTable from "../Table/GameTable";
import { IF_TB_Skin } from "../Table/GameCfgInterface";
import GameUtils from "../tool/GameUtils";
import GameGlobal from "../tool/GameGlobal";
import GamePublic from "../tool/GamePublic";
const TB_Skin: IF_TB_Skin = GameTable.data.Skin;

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginLoading extends BaseDialog {

    @property(sp.Skeleton)
    bgSpine: sp.Skeleton = null;

    @property(cc.Sprite)
    shadowDog: cc.Sprite = null;

    @property(cc.Sprite)
    shadowMonkey: cc.Sprite = null;

    @property(sp.Skeleton)
    spineMonkey: sp.Skeleton = null;

    @property(cc.ProgressBar)
    loadProgress: cc.ProgressBar = null;

    @property(cc.Label)
    rate: cc.Label = null;

    @property(cc.Label)
    version: cc.Label = null;

    isLoad: boolean = false;
    isProldGame: boolean = false;
    sceneRate: number = 0;
    loadComplete: boolean = true;
    onLoad() {
        let rate = 0;
        this.loadProgress.progress = rate;
        this.rate.string = `${0}%`;
        this.version.string = GameGlobal.version;
    }

    update(dt) {
        if (!this.isLoad || GamePublic.instance.isKickToLogin) return;
        let nextRate = 0;
        if (!this.isProldGame) {
            nextRate = this.sceneRate;
            if (this.loadProgress.progress > nextRate) nextRate = this.loadProgress.progress;
        } else {
            nextRate = this.loadProgress.progress + dt;
        }
        this.loadProgress.progress = nextRate;

        if (this.loadProgress.progress >= 1) {
            this.loadProgress.progress = 1;
            this.isLoad = false;
            //先赋值一个假数据
            GameData.instance.serverTime = new Date().getTime();
            // 跳转
            GameUI.instance.loadScene('Main');
        }
        this.rate.string = Math.floor(this.loadProgress.progress * 100) + "%";
    }

    /**
     * 更新加载
     * @param isLoad 
     */
    updateLoad(isLoad: boolean) {
        this.isLoad = isLoad;
        //加载皮肤
        this.loadSkin();
    }

    /**
     * 加载皮肤
     */
    loadSkin() {
        //得到当前穿戴的皮肤
        let curSkin = GameData.instance.curWearSkinId;
        let skinData = TB_Skin[curSkin];
        if (!skinData) return;

        //加载主界面背景
        // if (this.bg.spriteFrame.name !== skinData.Bg) {
        //     GameUI.instance.loadSpriteFrame(this.bg, `ui/common/${skinData.Bg}`, this.name);
        // }
        if (!this.bgSpine.skeletonData || this.bgSpine.skeletonData.name !== skinData.Bg_spine) {
            GameUI.instance.loadSpine(this.bgSpine, `spine/ui/${skinData.Bg_spine}/`, skinData.Bg_spine, this.name, {
                callback: () => {
                    if (!this.bgSpine || !cc.isValid(this.bgSpine.node)) return;
                    this.bgSpine.setAnimation(0, 'loop_1', true);
                }
            });
        }

        //加载猴子和狗的spine资源
        GameUI.instance.loadSpine(this.spineMonkey, `spine/skin/${skinData.Monkey_spine}/`, skinData.Monkey_spine, this.name, {
            callback: () => {
                if (!this.spineMonkey || !cc.isValid(this.spineMonkey.node)) return;
                // let randomState = GameUtils.instance.getRndInteger(1, 4);
                let randomState = 1;
                this.spineMonkey.setAnimation(0, `start_${randomState}`, true);

                //更新影子
                if (3 == skinData.Skin_id) {//悟空
                    this.shadowDog.node.setPosition(cc.v2(-150, -180));
                    this.shadowDog.node.scaleX = -1;
                    this.shadowMonkey.node.setPosition(cc.v2(150, -180));
                    GameUI.instance.loadSpriteFrame(this.shadowDog, `ui/home/ui_home_bg12`, this.name);
                    GameUI.instance.loadSpriteFrame(this.shadowMonkey, `ui/home/ui_home_bg12`, this.name);
                } else {
                    this.shadowDog.node.setPosition(cc.v2(-125, -180));
                    this.shadowDog.node.scaleX = 1;
                    this.shadowMonkey.node.setPosition(cc.v2(120, -180));
                    GameUI.instance.loadSpriteFrame(this.shadowDog, `ui/home/ui_home_bg10`, this.name);
                    GameUI.instance.loadSpriteFrame(this.shadowMonkey, `ui/home/ui_home_bg10`, this.name);
                }
            }
        });
    }

    /**
    * 更新场景加载进度
    * @param {*} rate 
    */
    loadSceneRate(rate) {
        this.sceneRate = rate;
    }
}
