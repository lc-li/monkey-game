/**
 * @file 游戏所有button扩展模块
 * @author CaoYang 2024/8/12
 */
// import GameAudio from './GameAudio';

import GameAudio from "./GameAudio";

const { ccclass, property, inspector, executeInEditMode, menu, help } = cc._decorator;
@ccclass
@executeInEditMode
@menu('ButtonEx')
@inspector('packages://custom-component/button/inspector.js')
export default class ButtonEx extends cc.Button {
    @property()
    public clickSize: cc.Size = cc.rect(0, 0);

    @property(cc.Boolean)
    public turnOffSound: boolean = false;

    /** 是否检测防连点 */
    @property(cc.Boolean)
    public isCheckQuickClick: boolean = true;

    /** 连点的时间间隔，0.5秒 */
    private _quickClickDt: number = 0.5;
    /** 当前是否可连点，true表示可以 */
    private _isCanQuickClick: boolean = true;
    private _isCanQuickClickEnd: boolean = true;

    private btnPressed: boolean = false;

    private btnRect: cc.Rect = null;

    private isCreateClickNode: boolean = false;//是否已经创建过节点

    // 这里注意注册和移除监听事件不要放到 onLoad 和 onDestroy 里
    // 会导致现已经不显示的按钮, 拦截触摸事件, 导致层级低的按钮, 交互出现异常
    protected onEnable() {
        this.setClickSize();

        // caoyang TODO 重构并删除这里的冗余事件监听；另外看一下自定义点击区域是不是正常的
        // 下面的方法都不用重复注册，直接覆盖Button类的同名函数，进行自己的处理后
        // 再用super调用Button类的同名函数
        // this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        super.onEnable();

        this.btnPressed = false;
        this._isCanQuickClick = true;
        this._isCanQuickClickEnd = true;
    }

    protected onDisable() {
        // this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        super.onDisable();
    }

    // caoyang TODO 已废弃，待删除
    private onTouchStart(event: cc.Event.EventTouch) {
        if (!this.interactable || !this.enabledInHierarchy) { return; }
        this.btnPressed = true;
    }

    _onTouchBegan(event: cc.Event.EventTouch) {
        if (!this.interactable || !this.enabledInHierarchy) return;
        if (!this.checkQuickClickBegan()) return;

        this.btnPressed = true;
        //@ts-ignore
        super._onTouchBegan(event);
    }

    private onTouchCancel(event: cc.Event.EventTouch) {
        if (!this.interactable || !this.enabledInHierarchy) { return; }
        this.btnPressed = false;
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        if (!this.interactable || !this.enabledInHierarchy) { return; }
        this.btnRect = this.node.getBoundingBox();
        let pressed = true;
        const nodeVec = this.node.parent.convertToNodeSpaceAR(event.getLocation());
        if (!this.btnRect.contains(nodeVec)) {
            pressed = false;
        }
        this.btnPressed = pressed;
    }

    _onTouchEnded(event: cc.Event.EventTouch) {
        if (!this.interactable || !this.enabledInHierarchy) { return; }
        if (!this.checkQuickClickEnd()) return;
        if (!this.turnOffSound) {
            //播放点击音效---统一管理
            GameAudio.instance.playEffect('dianji');
        }
        this.btnPressed = false;
        //@ts-ignore
        super._onTouchEnded(event);
    }

    //设置按钮点击尺寸
    private setClickSize() {
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, this.clickSize, this.node.getContentSize())
        let clickSize = this.clickSize;
        let nodeSize = this.node.getContentSize();

        if (clickSize.width <= nodeSize.width || clickSize.height <= nodeSize.height) return;

        //创建一个节点并且保证只能有一个节点
        if (this.isCreateClickNode) return;
        if (!this.node.getComponent(cc.Sprite)) {
            //改变父节点尺寸
            this.node.width = clickSize.width;
            this.node.height = clickSize.height;
        } else {
            let clickNode = new cc.Node();
            clickNode.name = this.node.name;
            //改变子节点尺寸和父节点相同
            clickNode.width = nodeSize.width;
            clickNode.height = nodeSize.height;
            //改变子节点icon
            clickNode.addComponent(cc.Sprite);
            clickNode.getComponent(cc.Sprite).spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame;
            this.node.getComponent(cc.Sprite).enabled = false;
            //改变父节点尺寸
            this.node.width = clickSize.width;
            this.node.height = clickSize.height;
            this.node.addChild(clickNode);
        }
        this.isCreateClickNode = true;
        // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, this.node);
    }
    /**
     * 检测当前是否可以连点，如果可以，则重置连点间隔
     * @returns true 表示当前可以连点
     */
    private checkQuickClickBegan() {
        if (!this.isCheckQuickClick) { // 不检测防连点
            return true;
        } else { // 检测防连点
            if (this._isCanQuickClick) {
                this._isCanQuickClick = false;
                this.scheduleOnce(() => {
                    this._isCanQuickClick = true;
                }, this._quickClickDt);
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * 检测当前是否可以连点，如果可以，则重置连点间隔
     * @returns true 表示当前可以连点
     */
    private checkQuickClickEnd() {
        if (!this.isCheckQuickClick) { // 不检测防连点
            return true;
        } else { // 检测防连点
            if (this._isCanQuickClickEnd) {
                this._isCanQuickClickEnd = false;
                this.scheduleOnce(() => {
                    this._isCanQuickClickEnd = true;
                }, this._quickClickDt);
                return true;
            } else {
                return false;

            }
        }
    }
}