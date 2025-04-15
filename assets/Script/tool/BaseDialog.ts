
import GameUI from "./GameUI";
import GameUtils, { LOG_LEVEL } from "./GameUtils";

/**
 * @file 各类弹窗管理
 * @author caoyang 2021/9/28
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseDialog extends cc.Component {
  /** 弹窗脚本名 */
  private _tsName: string = '';

  /** 获取弹窗脚本名 */
  get tsName() { return this._tsName; }
  /** 设置弹窗脚本名 */
  set tsName(name: string) { this._tsName = name; }

  preload() {
    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `${this.name}`);
  }

  onLoad() {
    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `onLoad${this.name}`);
  }

  // 已经存在刷新界面函数
  resInitUI() {
    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `${this.name}`);
  }

  start() {
    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `start${this.name}`);
  }

  init(base, data) {
    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `init${this.name}`);
  }

  onDestroy() {
    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `onDestroy${this.name}`);
    GameUI.instance.releaseAssetBySys(this.name);
  }

  /**
   * 用来隐藏需要缓存的弹窗
   */
  hide() {
    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `${this.name}`);
    GameUI.instance.releaseAssetBySys(this.name);
    this.node.parent = null;
    this.node.active = false;
  }

  /**
   * 用来显示隐藏的弹窗
   */
  show(baseLayer, data) {
    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `${this.name}`);
    this.node.active = true;
  }
}
