/**
 * @file 游戏UI弹窗管理模块
 * @author CaoYang 2024/8/12
 */
import PopLoading from '../PopLoading';
import BaseDialog from './BaseDialog';
import ButtonEx from './ButtonEx';
import GameGlobal from './GameGlobal';
import GameUtils, { LOG_LEVEL } from './GameUtils';
import GameTable from '../Table/GameTable';
const TB_LanguageText: IF_TB_I18n_LanguageText = GameTable.data.LanguageText;
import { PoolManager } from './PoolManager';
import { IF_TB_I18n_LanguageText } from '../Table/GameCfgInterface';
import GameWeb from './GameWeb';
import GameAudio from './GameAudio';
import GamePublic from './GamePublic';

/** 弹窗的层级 */
export const DIALOG_Z_INDEX = {
    /** 默认，999 */
    DEFAULT: 999,
    /**引导层级 */
    GUIDE: cc.macro.MAX_ZINDEX - 1,
    /**引导弹框 */
    GUID_DIALOG: cc.macro.MAX_ZINDEX,
    /** 横幅提示，9999 */
    TI_SHI: cc.macro.MAX_ZINDEX,
};

/** 预加载资源类型 */
export const enum PRELOAD_TYPE {
    /** 图片资源 */
    SPRITE_FRAME = 1,
    /** spine动画资源 */
    SPINE,
    /** 弹窗 */
    DIALOG,
    /** AnimationClip */
    CLIP,
    /** Prefab */
    PREFAB,
    /** cc.AudioClip */
    AUDIO,
}

/**
 * @description 加载SpriteFrame的可选参数
 * @param anim 加载完是否播放动画
 * @param callback 加载完成回调
 * @param width 图片宽度
 */
export interface SpriteFrameParam {
    height?: number;
    /** 加载完是否播放动画 */
    anim?: boolean,
    /** 加载完成回调 */
    callback?: Function,
    /** 图片宽度 */
    width?: number,
}

/**
 * @description 加载Spine的可选参数
 * @param cacheMode spine的缓存模式 
 * @param anim 加载完成后播放的动画名
 * @param isLoop 是否循环播放动画
 * @param callback 加载完成回调
 */
export interface SpineParam {
    /** spine的缓存模式 
     *  @param REALTIME 实时运算，支持 Spine 所有的功能。
     *  @param SHARED_CACHE 将骨骼动画及贴图数据进行缓存并共享，相当于预烘焙骨骼动画
     *  @param PRIVATE_CACHE 与 SHARED_CACHE 类似，但不共享动画及贴图数据，且会占用额外的内存
     */
    cacheMode?: number,
    /** 加载完是否播放动画 */
    anim?: string,
    /** 是否循环播放动画 */
    isLoop?: boolean,
    /** 加载完成回调 */
    callback?: Function,
}

/**
 * @description 加载Prefab的可选参数
 * @param data 初始化时的数据
 * @param zIndex 层级，不传则默认999
 * @param scale 缩放，不传则默认1
 * @param callback 加载完成回调
 */
export interface PrefabParam {
    /** 初始化时的数据 */
    data: any,
    /** 层级，不传则默认999 */
    zIndex?: number,
    /** 缩放，不传则默认1 */
    scale?: number,
    /** 加载完成回调 */
    callback?: Function,
}

interface AssetInfo {
    sysArr: string[],
}

// caoyang TODO 删除测试代码
let assetManager: any = cc.assetManager;
assetManager.saveCurMap = function () {
    assetManager.assetsBackup = new Map<string, any>();
    assetManager.assets.forEach((value, key) => {
        assetManager.assetsBackup.set(key, value);
    });

    return assetManager.assetsBackup.size;
}

// caoyang TODO 删除测试代码
assetManager.logMapDiff = function () {
    let assets = assetManager.assets;
    let assetsBackup: Map<string, any> = assetManager.assetsBackup;
    let diffArr: string[] = [];
    assets.forEach((value, key) => {
        if (!assetsBackup.has(key)) {
            diffArr.push(key);
        }
    });

    let map = new Map<string, any>();
    for (let i = 0; i < diffArr.length; i++) {
        const key = diffArr[i];
        map.set(key, assets.get(key));
    }
    GameUtils.instance.log('caoyang', LOG_LEVEL.DEBUG, 'diffArr map:', map);
}

/**
 * 倍速播放tween
 * @param speed 倍速
 */
let property: any = cc.Tween.prototype;
property.speed = function (speed: number) {
    if (speed < 0 || !this._finalAction) return;

    this._finalAction._speedMethod = true;
    this._finalAction._speed = speed;
}

export default class GameUI {
    private static _instance: GameUI = new GameUI();

    /** 缓存的对话框资源 */
    private _dialogMap = new Map<string, cc.Node>();
    /** 缓存的 AnimationClip 资源 */
    private _clipMap = new Map<string, cc.AnimationClip>();
    /** 缓存的 Prefab 资源，只存储uuid，要用时去cc.assetManager.assets里获取 */
    private _prefabMap = new Map<string, string>();
    private _audioMap = new Map<string, cc.AudioClip>();


    /** 动态加载的资源的uuid-map */
    private _assetMap = new Map<string, AssetInfo>();

    private _zIndex = 0;

    private _curParent: cc.Node = null;

    public maxProceNum: Number = 6;

    /** 加载界面*/
    public loadingToast: PopLoading = null;

    static get instance() {
        return this._instance;
    }

    static clean() {
        GameUI._instance._dialogMap.clear();
        GameUI._instance._clipMap.clear();
        GameUI._instance._prefabMap.clear();
        GameUI._instance._audioMap.clear();
    }

    /**
     * 
     * @param node 事件节点 
     * @param target 脚本所在节点
     * @param component 脚本  
     * @param handler 脚本方法 
     * @param data 数据
     */
    addClickEvent(node: cc.Node, target: cc.Node, component, handler, data?) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = target;
        clickEventHandler.component = component;
        clickEventHandler.handler = handler;
        if (data) {
            clickEventHandler.customEventData = data.toString();
        }
        //将事件添加到button中
        let button = node.getComponent("ButtonEx");
        if (button) {
            button.clickEvents.push(clickEventHandler);
        } else {
            GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, `节点:${node.name}缺少ButtonEx组件`);
        }
    }

    removeClickEvent(node) {
        //将事件添加到button中
        let button = node.getComponent("ButtonEx");
        if (button) {
            button.clickEvents = [];
        } else {
            GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, `节点:${node.name}缺少ButtonEx组件`);
        }
    }

    /**
     * 资源添加到动态缓存管理中
     * @param asset 资源 cc.Asset
     * @param sys 资源所属的系统
     */
    addAssetRef(asset: any, sys: string) {
        return;
        if (!asset || !sys || asset.name.indexOf('builtin') >= 0) return;

        const uuid = asset._uuid;
        let info = this._assetMap.get(uuid);
        if (!info) {
            if (asset instanceof cc.Prefab) {
                this.addPrefabRef(asset, sys);
            } else if (asset instanceof cc.TiledMapAsset) {
                this.addTiledMapRef(asset, sys);
            } else {
                // if (asset instanceof cc.Texture2D && asset.packable) return;
                // asset.addRef();
                // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "asset.addRef", asset.name, ":", asset._ref);
            }
            this._assetMap.set(uuid, {
                sysArr: [sys],
            });
        } else {
            if (info.sysArr.indexOf(sys) < 0) {
                if (asset instanceof cc.Prefab) {
                    this.addPrefabRef(asset, sys);
                } else if (asset instanceof cc.TiledMapAsset) {
                    this.addTiledMapRef(asset, sys);
                } else {
                    // if (asset instanceof cc.Texture2D && asset.packable) return;
                    // asset.addRef();
                    // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "asset.addRef", asset.name, ":", asset._ref);
                }
                info.sysArr.push(sys);
            }
        }
    }

    /**
     * 移除指定系统的资源缓存
     * @param sys 
     */
    releaseAssetBySys(sys: string) {
        // caoyang TODO 删除测试代码
        return;
        if (!sys) return;

        let entries = this._assetMap.entries();
        let iter = entries.next();
        let assets: any = cc.assetManager.assets;
        // GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, `cur sys: ${sys}, cur assets num: ${assets.count}`);
        while (!!iter.value) {
            let [uuid, assetInfo] = iter.value as [string, AssetInfo];
            let sysInfo = assetInfo.sysArr;
            let idx = sysInfo.indexOf(sys);
            if (idx >= 0) {
                sysInfo.splice(idx, 1);
                let asset = assets.get(uuid);
                // GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, `has asset? ${!!asset}` + !!asset ? `uuid: ${uuid}, ref: ${asset.refCount}` : '');
                if (!!asset) {
                    if (asset instanceof cc.Prefab) {
                        // this.releasePrefab(asset);
                    } else if (asset instanceof cc.TiledMapAsset) {
                        this.releaseTiledMap(asset, sys);
                    } else {
                        if (asset instanceof cc.Texture2D && asset.packable) continue;
                        // asset.decRef();
                        // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "asset.decRef", asset.name, ":", asset._ref);
                    }
                }

                if (sysInfo.length <= 0) {
                    this._assetMap.delete(uuid);
                }
            }

            iter = entries.next();
        }
        // GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, `release over, cur assets num: ${assets.count}`);
    }

    /**
     * 添加预制体的资源依赖引用
     * @param prefab cc.Prefab
     * @param sys 资源所属的系统
     */
    private addPrefabRef(prefab: any, sys: string) {
        if (!prefab) return;

        let uuid: string = prefab._uuid;
        let depArr = cc.assetManager.dependUtil.getDepsRecursively(uuid);
        for (let i = 0; i < depArr.length; i++) {
            const uuid = depArr[i];
            const asset = cc.assetManager.assets.get(uuid);
            this.addAssetRef(asset, sys);
        }

        // prefab.addRef();
        // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "prefab.addRef", prefab.name, ":", prefab._ref);
    }

    /**
     * 释放预制体的资源依赖引用
     * @param prefab cc.Prefab
     */
    private releasePrefab(prefab: any) {
        if (!prefab) return;

        let uuid: string = prefab._uuid;
        let deps = cc.assetManager.dependUtil.getDepsRecursively(uuid);
        for (let i = 0; i < deps.length; i++) {
            const uuid = deps[i];
            const asset: any = cc.assetManager.assets.get(uuid);
            if (!asset || !asset.decRef) continue;

            if (asset instanceof cc.Texture2D && asset.packable) continue;
            // asset.decRef();
            // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "asset.decRef", asset.name, ":", asset._ref);
        }

        // prefab.decRef();
        // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "prefab.decRef", prefab.name, ":", prefab._ref);
    }

    /**
     * 场景的资源添加到动态缓存管理中
     * @param sceneName 场景名称
     * @param resSysName 资源动态缓存的名称
     */
    addSceneRef(sceneName: string, resSysName: string) {
        let scene = cc.director.getScene();
        if (!scene || !scene.uuid || scene.name != sceneName) return;

        let depArr = cc.assetManager.dependUtil.getDepsRecursively(scene.uuid);
        if (!depArr || depArr.length <= 0) return;

        for (let i = 0; i < depArr.length; i++) {
            const uuid = depArr[i];
            const asset = cc.assetManager.assets.get(uuid);
            this.addAssetRef(asset, resSysName);
        }
    }

    /**
     * 添加tiledMap的资源依赖引用
     * @param tiledMap  cc.TiledMapAsset
     */
    private addTiledMapRef(tiledMap: any, sys: string) {
        // return;
        if (!tiledMap) return;

        let uuid: string = tiledMap._uuid;
        let deps = cc.assetManager.dependUtil.getDepsRecursively(uuid);
        for (let i = 0; i < deps.length; i++) {
            const uuid = deps[i];
            const asset = cc.assetManager.assets.get(uuid);
            this.addAssetRef(asset, sys);
        }

        // tiledMap.addRef();      
        // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "tiledMap.addRef", tiledMap.name, ":", tiledMap._ref);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    }

    /**
     * 释放tiledMap的资源依赖引用
     * @param tiledMap  cc.TiledMapAsset
     */
    public releaseTiledMap(tiledMap: any, sys?: string) {
        // return;
        if (!tiledMap) return;

        let uuid: string = tiledMap._uuid;
        let deps = cc.assetManager.dependUtil.getDepsRecursively(uuid);
        for (let i = 0; i < deps.length; i++) {
            const uuid = deps[i];
            const asset: any = cc.assetManager.assets.get(uuid);
            if (!asset || !asset.decRef) continue;
            if (asset instanceof cc.Texture2D && asset.packable) continue;

            // asset.decRef();
            // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "asset.decRef", asset.name, ":", asset._ref);
        }

        // tiledMap.decRef();
        // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "tiledMap.decRef", tiledMap.name, ":", tiledMap._ref);
    }

    /**
     * 预加载多个资源
     * @param list 资源路径列表
     * @param dialogName 资源所属的弹窗，传空值则不自动释放资源
     * @param cb 可选，回调
     */
    preload(list, dialogName: string, cb?: Function) {
        let total = list.length;
        let _t = 0;
        let type = undefined;
        let url = "";
        for (let i = 0; i < list.length; i++) {
            url = list[i][0];
            type = list[i][1];
            this.preloadRes(url, type, dialogName, function (err, res) {
                _t++;
                if (_t === total) return cb(true, 100);
                !!cb && cb(false, 100 * (_t / total));
            })
        }
    }

    /**
     * 预加载资源
     * @param path 资源完整路径
     * @param typeIndex 加载资源类型, PRELOAD_TYPE的枚举值
     * @param dialogName 资源所属的弹窗名，传空值表示不自动释放资源
     * @param callback 可选参数，预加载完成后的回调函数
     * @param tsName 可选参数，预加载资源为弹窗时，传入脚本文件名，会执行脚本的preload函数
     * 
     * @example
     * GameUI.instance.preloadRes('prefab/battle/BattleScene', PRELOAD_TYPE.DIALOG, () => {
            GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, `preloadRes BattleScene test`);
        }, 'BattleScene');
     */
    preloadRes(path: string, typeIndex: PRELOAD_TYPE,
        dialogName: string,
        callback?: Function, tsName?: string,
    ) {
        // 官方的预加载接口，预加载完成后还需要调用cc.resources.load完成资源的解析和初始化
        // 详见：http://docs.cocos.com/creator/manual/zh/asset-manager/preload-load.html
        // cc.resources.preload('images/background', cc.SpriteFrame);
        let map: Map<string, any> = undefined;
        let type = undefined;
        switch (typeIndex) {
            case PRELOAD_TYPE.SPRITE_FRAME:
                type = cc.SpriteFrame;
                break;
            case PRELOAD_TYPE.SPINE:
                type = sp.SkeletonData;
                break;
            case PRELOAD_TYPE.DIALOG:
                map = this._dialogMap;
                type = cc.Prefab;
                break;
            case PRELOAD_TYPE.CLIP:
                map = this._clipMap;
                type = cc.AnimationClip;
                break;
            case PRELOAD_TYPE.PREFAB:
                map = this._prefabMap;
                type = cc.Prefab;
                break;
            case PRELOAD_TYPE.AUDIO:
                map = this._audioMap;
                type = cc.AudioClip;
                break;
        }

        if (!!map && !!map.get(path)) {
            !!callback && callback();
            return;
        }
        //asset: cc.SpriteFrame | sp.SkeletonData | cc.Prefab | cc.AnimationClip
        this.loadResource(path, type, (err: Error, asset: any) => {
            if (!!err) {
                GameUtils.instance.log('caoyang GameUI preloadRes', LOG_LEVEL.ERROR, `preload res error! path: ${path}, error: `, err);
                if (!!asset) {
                    if (asset instanceof cc.Prefab) {
                        // this.releasePrefab(asset);
                    } else {
                        // 注释：报错之时 ref计数 没有加1 只有减1 
                        // asset.decRef();
                        // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "asset.decRef", asset.name, ":", asset._ref);
                    }
                }
                return;
            }

            this.addAssetRef(asset, dialogName);

            // 预加载弹窗时的特殊处理
            if (typeIndex == PRELOAD_TYPE.DIALOG && asset instanceof cc.Prefab) {
                let dialog = cc.instantiate(asset);
                !!map && map.set(path, dialog);

                // 有脚本名，执行弹窗的预加载函数
                if (!!tsName) {
                    let ts: BaseDialog = dialog.getComponent(tsName);
                    !!ts && !!ts.preload && ts.preload();
                }
            } else if (typeIndex === PRELOAD_TYPE.PREFAB) {
                !!map && map.set(path, asset._uuid);
                // } else if (typeIndex === PRELOAD_TYPE.AUDIO) {
                //     if (asset.length) {
                //       for (let ik = 0; ik < asset.length; ik++) {
                //         const element = asset[ik];
                //         !!map && map.set(path + element.name, element);
                //       }
                //     } else {
                //       !!map && map.set(path + asset.name, asset);
                //     }
            } else {
                !!map && map.set(path, asset);
            }

            !!callback && callback();
        });
    }

    /**
     * 弹窗提示
     * @param {string} text 纯文本内容
     * @param {number} initY 初始高度
     */
    showTiShi(text: string, initY: number = 60) {
        let data = { text: text, initY: initY };
        this.showDialog('public/PopTiShi', 'PopTiShi', this, false, data, DIALOG_Z_INDEX.TI_SHI);
    }

    /**
     * 添加一个弹窗
     * @param {string} name 弹窗路径
     * @param {any} tsName 脚本名称
     * @param {any} baseLayer 调用弹窗的脚本
     * @param {boolean} isCache 是否进行缓存，默认false不缓存
     * @param {any} data 弹窗需要的数据
     * @param {number} zIndex 该弹窗的层级，默认层级999
     * @param {true} useExist 是否使用已经存在的同名节点
     * @param {true} useAddIndex 是否增加层级
     * @example
     * GameUI.instance.showDialog('battle/BattleScene', 'BattleScene',
                    this, true,
                    {
                        fightId: 1001, sceneType: BATTLE_SCENE_TYPE.STORY, callback: (type) => {
                            GameUtils.instance.log(`caoyang`, LOG_LEVEL.DEBUG, `Test No BattleScene, result: ${type}`);
                        }
                    },
                    DIALOG_Z_INDEX.BATTLE
                );
     */
    showDialog(path: string, tsName: string,
        baseLayer: any = null, isCache: boolean = false,
        data: any = null,
        zIndex: number = DIALOG_Z_INDEX.DEFAULT, useExist = true, useAddIndex = true
    ) {

        if (this.getScenseName() == 'login') return;
        let key = 'prefab/' + path;
        let dialog = this._dialogMap.get(key);
        if (!!dialog && dialog.isValid) {
            this.showCacheDialog(dialog, tsName, baseLayer, data, zIndex, useExist, useAddIndex);
            //资源加载完成回调
            if (data && data.loadCall) data.loadCall();
        } else {
            this.loadDialog(key, tsName, baseLayer, isCache, data, zIndex, useExist, useAddIndex);
        }
    }
    /**
     * 获取当前场景名称
     */
    getScenseName() {
        if (cc.director.getScene()) {
            return cc.director.getScene().name;
        }
    }

    /**
     * 隐藏弹窗。若是缓存的弹窗，隐藏；否则直接销毁
     * @param path 弹窗路径
     * @param tsName 脚本名称
     * 
     * @example
     * GameUI.instance.hideDialog('battle/BattleScene', 'BattleScene');
     */
    hideDialog(path: string, tsName: string) {
        let key = 'prefab/' + path;
        let dialog = this._dialogMap.get(key);

        if (!!dialog && dialog.isValid) { // 是缓存的弹窗
            let ts: BaseDialog = dialog.getComponent(tsName);
            if (ts && ts.hide && ts.node.active) {
                ts.hide();
            } else {
                dialog.parent = null;
                dialog.active = false;
            }
        } else { // 未缓存的弹窗
            let uiLayer = cc.find('uiLayer', cc.director.getScene().getChildByName('Canvas'));
            if (!uiLayer) uiLayer = cc.director.getScene().getChildByName('Canvas');
            if (!uiLayer) return;

            let pathArr = path.split('/');
            let findName = pathArr[pathArr.length - 1];
            let popuDialog = cc.find(findName, uiLayer);
            if (!popuDialog) return;

            popuDialog.parent = null;
            popuDialog.destroy();
        }
    }

    /**
     * 加载并展示弹窗
     * @param path 弹窗资源路径
     * @param tsName 脚本名称
     * @param baseLayer 调用弹窗的脚本
     * @param isCache 是否进行缓存
     * @param data 弹窗需要的数据
     * @param zIndex 该弹窗的层级
     * @param useExist 
     * @param useAddIndex 
     */
    private loadDialog(path: string, tsName: string,
        baseLayer: any, isCache: boolean,
        data: any, zIndex: number, useExist = true, useAddIndex = true
    ) {
        // GameUtils.instance.log('caoyang GameUI loadDialog', LOG_LEVEL.INFO, `path: ${path} tsName: ${tsName}`);
        //显示加载界面
        this.showLoading(true, path);
        this.loadResource(path, cc.Prefab, (err, prefab: cc.Prefab) => {
            if (err) {
                GameUtils.instance.log('caoyang GameUI loadDialog', LOG_LEVEL.ERROR, `load dialog prefab error! path: ${path}, error: `, err);
                // this.releasePrefab(prefab);
                //隐藏加载界面
                this.showLoading(false, path);
                return;
            }

            let dialog = cc.instantiate(prefab);
            let dialogName = this.showCacheDialog(dialog, tsName, baseLayer, data, zIndex, useExist, useAddIndex);

            if (isCache) {
                this._dialogMap.set(path, dialog);
                // } else {
                //     this._dialogMap.delete(path);
            } else {
                if (!!dialogName) {
                    // this.addAssetRef(prefab, dialogName);
                }
            }
            //隐藏加载界面
            this.showLoading(false, path);
            //资源加载完成回调
            if (data && data.loadCall) data.loadCall();
        });
    }

    /**
     * 打开缓存对话框
     * @param dialog 弹窗
     * @param tsName 脚本名称
     * @param baseLayer 调用弹窗的脚本
     * @param data 对话框数据
     * @param zIndex 对话框层级
     * @param useExist 是否使用已经存在的同名节点
     * @param useAddIndex 
     */
    private showCacheDialog(dialog: cc.Node, tsName: string,
        baseLayer: any, data: any,
        zIndex: number, useExist: boolean = true, useAddIndex: boolean = true
    ) {
        // 可能会因为切换场景，导致父界面丢失，
        // 因此必须清空上一次的父节点，重新绑定父节点
        dialog.parent = null;

        let dialogName = '';
        let curScene = cc.director.getScene();
        if (!curScene) return;
        let canvas = cc.find('Canvas', curScene);
        let parentNode = null;
        if (data && data.childParent) {
            parentNode = data.childParent;
        } else {
            parentNode = cc.find('uiLayer', canvas);
        }
        if (!parentNode) parentNode = canvas;

        if (useExist && parentNode.getChildByName(dialog.name)) { // 已经存在了
            let dialogOld = parentNode.getChildByName(dialog.name);
            let ts: BaseDialog = dialogOld.getComponent(tsName);
            if (ts) {
                dialogName = ts.name;
                ts.tsName = tsName;
                !!ts.init && ts.init(baseLayer, data);
                !!ts.preload && ts.preload();
                !!ts.resInitUI && ts.resInitUI();
            }
            if (useAddIndex) {
                dialogOld.zIndex = zIndex;
            } else {
                dialogOld.zIndex = zIndex + this._zIndex;

                this._zIndex = this._zIndex + 1;
            }
            return dialogName;
        }

        let ts: BaseDialog = dialog.getComponent(tsName);
        if (ts) {
            dialogName = ts.name;
            ts.tsName = tsName;
            !!ts.init && ts.init(baseLayer, data);
            !!ts.preload && ts.preload();
        } else { // 对于没有脚本的情况，特殊处理
            return;
        }
        if (useAddIndex) {
            parentNode.addChild(dialog, zIndex)
        } else {
            parentNode.addChild(dialog, zIndex + this._zIndex)
            this._zIndex = this._zIndex + 1;
        }

        !!ts.show && ts.show(baseLayer, data);
        GameUtils.instance.log('caoyang', LOG_LEVEL.DEBUG, `dialog name: ${dialog.name}`);

        return dialogName;
    }

    /**
     * 添加Widget适配
     * @param node 适配节点
     */
    public static AdaptWidget(node: cc.Node) {
        let widget = node.getComponent(cc.Widget);
        if (!widget) {
            widget = node.addComponent(cc.Widget);
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.isAlignTop = true;
            widget.isAlignBottom = true;
            widget.top = 0;
            widget.bottom = 0;
            widget.left = 0;
            widget.bottom = 0;
            widget.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;
            // widget.isAlignOnce = false;
            widget.updateAlignment();
        }
    }

    /**
     * 动态加载Prefab
     * @param path 路径
     * @param tsName 脚本名称
     * @param dialogName 所属弹窗名，传空值则不自动释放资源
     * @param baseLayer 父节点的脚本文件
     * @param parantNode 父节点
     * @param params 可选，一些额外参数。PrefabParam接口
     */
    loadPrefab(path: string, tsName: string,
        dialogName: string,
        baseLayer: any, parantNode: any,
        params?: PrefabParam
    ) {
        const data = !!params && !!params.data ? params.data : null;
        const zIndex = !!params && !!params.zIndex ? params.zIndex : DIALOG_Z_INDEX.DEFAULT;
        const cb = !!params && params.callback;

        /** 加载完资源后处理实例化对象 */
        //prefab: cc.Prefab
        let loadOverFunc = (prefab: any) => {
            if (!dialogName) {
                this._prefabMap.set(path, prefab._uuid);
            } else {
                // this.addAssetRef(prefab, dialogName);
            }
            if (!parantNode || !parantNode.isValid || !parantNode.children) return; // 频繁切换闪退问题

            let p = cc.instantiate(prefab);
            if (!!params && 'undefined' !== typeof params.scale) {
                p.scale = params.scale;
            }

            let ts: BaseDialog = tsName ? p.getComponent(tsName) : null;
            !!ts && !!ts.init && ts.init(baseLayer, data);

            parantNode.addChild(p, zIndex);

            !!cb && cb();
        };

        path = 'prefab/' + path;
        let uuid = this._prefabMap.get(path);
        if (!!uuid) { // 有缓存
            let prefab = cc.assetManager.assets.get(uuid) as cc.Prefab;
            if (!!prefab) {
                loadOverFunc(prefab);
                return;
            }
        }
        //显示加载界面
        this.showLoading(true, path);
        this.loadResource(path, cc.Prefab, (err, prefab: cc.Prefab) => {
            if (err || !prefab) {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'load prefab error! error: ', err);
                //隐藏加载界面
                this.showLoading(false, path);
                // this.releasePrefab(prefab);
                !!cb && cb();
                return;
            }

            loadOverFunc(prefab);
            //隐藏加载界面
            this.showLoading(false, path);
        });
    }

    /**
      * 动态加载龙骨
      * @param  spSkeleton 龙骨节点
      * @param  path 龙骨资源路径
      * @param  spineName 需要加载的龙骨名称
      * @param  dialogName 所属的弹窗
      * @param  params 可选，一些额外的参数，SpineParam接口类型
      * @author caoyang 2022/06/30
      */
    loadSpine(spSkeleton: sp.Skeleton, path: string,
        spineName: string, dialogName: string,
        params?: SpineParam
    ) {
        const callback = !!params && params.callback;

        if (!spSkeleton || !spSkeleton.node
            || !spSkeleton.isValid || !spSkeleton.node.isValid
        ) {
            GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'spSkeleton 为空');
            !!callback && callback();
            return;
        }

        // GameUtils.instance.log('caoyang GameUI loadSpine', LOG_LEVEL.INFO, 'path: ', path, ' spineName:', spineName);
        /** 加载完资源后处理换肤 */
        // asset: sp.SkeletonData
        let loadOverFunc = (asset: any) => {
            if (!spSkeleton || !spSkeleton.node
                || !spSkeleton.isValid || !spSkeleton.node.isValid
            ) {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'spSkeleton 为空');
                // asset.decRef();
                // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "asset.decRef", asset.name, ":", asset._ref);
                !!callback && callback();
                return;
            }

            this.addAssetRef(asset, dialogName);

            spSkeleton.skeletonData = asset;
            spSkeleton.setSkin(asset.skeletonJson.skins[0].name);
            spSkeleton.premultipliedAlpha = false; // 取消贴图预乘
            //设置spine的缓存模式
            spSkeleton.setAnimationCacheMode(params.cacheMode ? params.cacheMode : sp.Skeleton.AnimationCacheMode.REALTIME);
            const anim = !!params && params.anim;
            const isLoop = !!params && params.isLoop;
            !!anim && spSkeleton.setAnimation(0, anim, isLoop);
            !!callback && callback(spSkeleton);

            // spine淡入显示
            spSkeleton.node.opacity = 0;
            cc.tween(spSkeleton.node).to(0.2, { opacity: 255 }).start();
        };

        // 加载过的资源会缓存在cc.assetManager.assets中，
        // 当dialogName为空时，不自动释放，这样就相当于做了缓存。
        // 相对的，当dialogName不为空时，会自动释放，每次重新打开弹窗时，都会重新加载资源。
        //asset: sp.SkeletonData
        this.loadResource(path + spineName, sp.SkeletonData, (err: Error, asset: any) => {
            if (err || !asset) {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'load spine error! error: ', err);
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'load spine error! asset: ', asset);

                // !!asset && asset.decRef();
                // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "asset.decRef", asset.name, ":", asset._ref);
                !!callback && callback();
                return;
            }

            loadOverFunc(asset);
        });
    }

    /**
     * 替换spriteFrame
     * @param spriteFrameNode 需要替换的spriteFrame
     * @param path 资源路径
     * @param dialogName 所属的弹窗名，为空则不自动释放
     * @param params 可选，一些额外参数
     */
    loadSpriteFrame(spriteFrameNode: cc.Sprite, path: string,
        dialogName: string, params?: SpriteFrameParam,
    ) {
        const callback = !!params && params.callback;

        if (!spriteFrameNode || !spriteFrameNode.isValid) {
            GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'spriteFrameNode 为空');
            !!callback && callback();
            return;
        }


        /** 加载完资源后处理替换 */
        //spriteFrame: cc.SpriteFrame
        let loadOverFunc = (spriteFrame: any) => {
            if (!spriteFrameNode.isValid) {
                // spriteFrame.decRef();
                // GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "spriteFrame.decRef", spriteFrame.name, ":", spriteFrame._ref);
                !!callback && callback(spriteFrame);
                return;
            }

            this.addAssetRef(spriteFrame, dialogName);
            spriteFrameNode.spriteFrame = null;
            spriteFrameNode.spriteFrame = spriteFrame;

            /**宽存在时，进行适配 */
            let width: number = 0;
            if (!!params && 'undefined' !== typeof params.width) width = params.width;
            if (width) {
                let height = Math.floor((width / spriteFrame.getRect().width) * spriteFrame.getRect().height);
                spriteFrameNode.node.width = width;
                spriteFrameNode.node.height = height;
                setTimeout(() => {//双重保证
                    if (spriteFrameNode.node) {//以防迟延出错
                        if (spriteFrameNode.node.width != width) spriteFrameNode.node.width = width;
                        if (spriteFrameNode.node.height != height) spriteFrameNode.node.height = height;
                    }
                }, 0);
            } else {
                let height: number = 0;
                if (!!params && 'undefined' !== typeof params.height) height = params.height;
                if (height) {
                    let width = Math.floor((height / spriteFrame.getRect().height) * spriteFrame.getRect().width);
                    spriteFrameNode.node.width = width;
                    spriteFrameNode.node.height = height;
                    setTimeout(() => {//双重保证
                        if (spriteFrameNode.node) {//以防迟延出错
                            if (spriteFrameNode.node.width != width) spriteFrameNode.node.width = width;
                            if (spriteFrameNode.node.height != height) spriteFrameNode.node.height = height;
                        }
                    }, 0);
                }
            }

            let anim: boolean = false;
            if (!!params && 'undefined' !== typeof params.anim) anim = params.anim;
            if (!!anim) {
                spriteFrameNode.node.opacity = 0;
                cc.tween(spriteFrameNode.node).to(0.2, { opacity: 255 }).start();
            }

            !!callback && callback(spriteFrame);
        };

        // 加载过的资源会缓存在cc.assetManager.assets中，
        // 当dialogName为空时，不自动释放，这样就相当于做了缓存。
        // 相对的，当dialogName不为空时，会自动释放，每次重新打开弹窗时，都会重新加载资源。
        // spriteFrame: cc.SpriteFrame
        this.loadResource(path, cc.SpriteFrame, (err: Error, spriteFrame: any) => {
            if (err || !spriteFrame) {
                GameUtils.instance.log('caoyang GameUI loadSpriteFrame', LOG_LEVEL.ERROR, 'load sprite error! error: ', err);
                GameUtils.instance.log('caoyang GameUI loadSpriteFrame', LOG_LEVEL.ERROR, 'load sprite error! spriteFrame: ', spriteFrame);

                // !!spriteFrame && spriteFrame.decRef();
                // if(spriteFrame){
                //     GameUtils.instance.log('hwl', LOG_LEVEL.INFO, "spriteFrame.decRef", spriteFrame.name, ":", spriteFrame._ref);
                // }
                !!callback && callback(spriteFrame);
                return;
            }

            loadOverFunc(spriteFrame);
        });
    }

    /**
      * 动态加载Prefab
      * @param {string} path 资源路径
      * @param {Function} callback 回调函数，可选
      * @author
      */
    getPrefab(path: string, callback?: Function) { //动态加载龙骨
        let cacheAsset = this._prefabMap.get(path);
        if (!cacheAsset) { // 没有缓存就动态加载
            //asset: cc.Prefab
            //显示加载界面
            this.showLoading(true, path);
            this.loadResource(path, cc.Prefab, (err: Error, asset: any) => {
                if (err || !asset) {
                    GameUtils.instance.log('caoyang GameUI getPrefab', LOG_LEVEL.ERROR, 'getPrefab error! error: ', err);
                    !!callback && callback(asset);
                    //隐藏加载界面
                    this.showLoading(false, path);
                    return;
                }
                this._prefabMap.set(path, asset);
                !!callback && callback(asset);
                //隐藏加载界面
                this.showLoading(false, path);
            });
        } else { // 有缓存就直接在缓存里面找
            !!callback && callback(cacheAsset);
        }
    }

    /**
     * 用外部图片局部换装
     * @param {sp.Skeleton} sk 骨骼动画
     * @param {string} slotName 需要替换的插槽名称
     * @param {string} textureUrl 外部图片地址
     * @param {Function} callback 替换完成回调
     */
    changeSlot(sk: sp.Skeleton, slotName: string[], textureUrl: string, callback?: Function) {
        let curSp: any = sp;
        //获取图片
        this.loadResource(textureUrl, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
            if (err || !spriteFrame) {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'load sprite error! error: ', err);
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'load sprite error! spriteFrame: ', spriteFrame);
                return;
            }
            let texture = spriteFrame.getTexture();

            for (let i = 0; i < slotName.length; i++) {
                //获取插槽
                let slot = sk.findSlot(slotName[i]);
                //获取挂件
                let att = slot.attachment;
                //创建region
                let skeletonTexture = new curSp.SkeletonTexture();
                skeletonTexture.setRealTexture(texture);
                let page = new sp.spine.TextureAtlasPage();
                page.name = texture.name;
                page.uWrap = sp.spine.TextureWrap.ClampToEdge;
                page.vWrap = sp.spine.TextureWrap.ClampToEdge;
                page.texture = skeletonTexture;
                page.texture.setWraps(page.uWrap, page.vWrap);
                page.width = texture.width;
                page.height = texture.height;

                let region = new sp.spine.TextureAtlasRegion();
                region.page = page;
                region.width = texture.width;
                region.height = texture.height;
                region.originalWidth = texture.width;
                region.originalHeight = texture.height;

                region.rotate = false;
                region.u = 0;
                region.v = 0;
                region.u2 = 1;
                region.v2 = 1;
                region.texture = skeletonTexture;
                //替换region
                att.region = region;
                att.width = texture.width;
                att.height = texture.height;
                att.setRegion(region);
                att.updateOffset();
            }

            if (callback) callback();
        });
    }
    /**
     * 用外部图片局部换装
     * @param slotName  需要替换的插槽名称
     * @param texture   外部图片
     */
    public changeSlot2(sk: sp.Skeleton, slotName: string, texture: cc.Texture2D) {
        if (!sk || !texture) return
        //获取插槽
        let slot = sk.findSlot(slotName)
        if (!slot) return
        //获取挂件
        let att = slot.attachment
        //创建region
        //@ts-ignore
        let skeletonTexture = new sp.SkeletonTexture()
        skeletonTexture.setRealTexture(texture)
        let page = new sp.spine.TextureAtlasPage()
        page.name = texture.name
        page.uWrap = sp.spine.TextureWrap.ClampToEdge
        page.vWrap = sp.spine.TextureWrap.ClampToEdge
        page.texture = skeletonTexture
        page.texture.setWraps(page.uWrap, page.vWrap)
        page.width = texture.width
        page.height = texture.height

        let region = new sp.spine.TextureAtlasRegion()
        region.page = page
        region.width = texture.width
        region.height = texture.height
        region.originalWidth = texture.width
        region.originalHeight = texture.height

        region.rotate = false
        region.u = 0
        region.v = 0
        region.u2 = 1
        region.v2 = 1
        region.texture = skeletonTexture
        //替换region
        att.region = region
        att.width = texture.width;
        att.height = texture.height;
        att.setRegion(region)
        att.updateOffset()
    }

    /**
     * 加载本地json文件
     * @param {string} path 路径
     * @param {string} fileName 文件名
     * @param {Function} callback 加载完成返回json数据、加载失败返回-1
     */
    loadJsonData(path: string, fileName: string, callback: Function) {
        if (!fileName) {
            callback(-1);
            return;
        }
        // let url = `minigame/music/${fileName}`;
        let url = `${path}${fileName}`;
        cc.resources.load(url, cc.JsonAsset, null, (err, asset: cc.JsonAsset) => {
            if (err) {
                callback(-1);
            } else {
                callback(asset.json);
            }
        });
    }

    /**
     * 动态创建按钮事件绑定
     * @param node 事件脚本所在的节点
     * @param component 脚本文件名称
     * @param handler 处理事件的函数名
     * @param param 事件传的参数
     * @returns 
     */
    public createEventHandler(node: cc.Node, component: string, handler: string, param?: any): cc.Component.EventHandler {
        if (!node.getComponent(cc.Button) && !node.getComponent(ButtonEx)) node.addComponent(cc.Button);
        let event: cc.Component.EventHandler = new cc.Component.EventHandler();
        event.target = node;
        event.component = component;
        event.handler = handler;
        if (param) event.customEventData = param;
        return event;
    }

    /**
     * 飞各种动画
     * @param {*} start 起始点 Node
     * @param {*} type  飞类型 1:金币  2:爱心  3:红宝  4：ton币
     * @param {cc.Node} destination 自定义目的地节点
     * @param {*} num 数量
     * @param {*} callback 动画结束后的回调
     */
    addFlyEffectEx(start, type, num, destination = null, callback = null, zIndex = DIALOG_Z_INDEX.TI_SHI) {

        let canvas = cc.director.getScene().getChildByName('Canvas');
        let currencyNode, coinNode;
        // 播放对应音效
        switch (type) {
            case 1: // 钱
                currencyNode = cc.find('topLayout/dianomdNode', canvas);
                if ('object' == typeof (destination) && cc.isValid(destination)) currencyNode = destination;
                coinNode = cc.find('icon', currencyNode);

                canvas.getComponent("Main").scheduleOnce(() => {//延迟等金币飞到指定的位置
                    GameAudio.instance.playEffect("fjb");
                }, 0.5);
                break;
            default:
                break;
        }

        let pos = start.parent.convertToWorldSpaceAR(start.position);
        type--;

        let flyEffectNode = cc.instantiate(canvas.getComponent("Main").flyEffect);
        canvas.addChild(flyEffectNode, zIndex);

        let flyEffect = flyEffectNode.getComponent('FlyEffect');

        flyEffect.onPlayConiAni(type, pos, coinNode, num, () => {
            if (cc.isValid(flyEffectNode)) flyEffectNode.destroy();
            // currencyNode.zIndex = currencyIdx;
            if (callback && callback instanceof Function) {
                callback();
            }
        });
    }

    /**
     * 屏幕抖动效果
     * @param {cc.Node} shakeNode 需要抖动的节点
     * @param {number} duration 抖动时间/秒
     * @param {Function} callback 抖动结束回调
     */
    playShakeAction(shakeNode: cc.Node, duration: number = 1, callback?: Function) {
        //记录原始坐标
        let initPos = shakeNode.getPosition();
        //执行循环抖动动作
        cc.tween(shakeNode)
            .repeatForever(
                cc.tween().by(0.02, { position: new cc.Vec3(5, 7) })
                    .by(0.02, { position: new cc.Vec3(-6, 7) })
                    .by(0.02, { position: new cc.Vec3(1, 3) })
                    .by(0.02, { position: new cc.Vec3(3, -6) })
                    .by(0.02, { position: new cc.Vec3(-5, 5) })
                    .by(0.02, { position: new cc.Vec3(2, -8) })
                    .by(0.02, { position: new cc.Vec3(-8, -10) })
                    .by(0.02, { position: new cc.Vec3(3, 10) })
                    .by(0.02, { position: new cc.Vec3(5, -8) }))
            .start()

        //延时停止抖动
        setTimeout(() => {
            if (!cc.isValid(shakeNode)) return;
            shakeNode.stopAllActions();
            shakeNode.setPosition(initPos);
            if (callback) callback();
        }, duration * 1000);
    }

    /**
     * 替换内置材质
     * @param {string} materialName 内置材质名称，无需带前缀"builtin-"
     * @param {cc.Sprite | cc.Label} sprite 
     */
    loadBuildinMaterial(materialName: string, sprite: cc.Sprite | cc.Label) {
        let material = cc.Material.getBuiltinMaterial(materialName);
        sprite.setMaterial(0, material);
    }

    /**
     * 加载资源
     * @param path 
     * @param callback 
     */
    loadResource(path, type, callback, progressCallback?) {
        if (type == cc.AudioClip) {
            cc.resources.load(path, cc.AudioClip,
                (finish: number, total: number, item: any) => {
                    if (!!progressCallback) progressCallback(finish, total, item);
                },
                (err, asset: cc.AudioClip) => {
                    callback(err, asset);
                });
            // cc.resources.loadDir(path, function (err, assets) {
            //   if (err) {
            //     callback(err, assets);
            //     return;
            //   }
            //   callback(false, assets);
            // });
        }
        else if (type === cc.TiledMapAsset) {//加载地图需要限制线程数量
            cc.assetManager.loadAny(
                { path: path, type: cc.TiledMapAsset, bundle: 'resources' },
                //maxConcurrency:下载的最大并发连接数
                //maxRequestsPerFrame:每帧发起的最大请求数
                { maxConcurrency: 6, maxRequestsPerFrame: this.maxProceNum },
                (finish: number, total: number, item: any) => {
                    if (!!progressCallback) progressCallback(finish, total, item);
                },
                (err: Error, asset: cc.TiledMapAsset) => {
                    callback(err, asset);
                }
            );
        }
        // else if (type == cc.SpriteFrame) {
        //   this._imageLoader.loadImg(path).then(r => {
        //     if (r) {
        //         cc.log(TAG, 'set the texture');
        //         callback(null, new cc.SpriteFrame(r));
        //     } else {
        //         cc.log(TAG, 'the texture is null');
        //     }
        //   }).catch((errmsg) => {
        //       cc.log(TAG, 'load error' + errmsg);
        //       callback(errmsg);
        //   });
        // }
        else {
            cc.resources.load(
                path,
                type,
                (finish: number, total: number, item: any) => {
                    if (!!progressCallback) progressCallback(finish, total, item);
                },
                (err, asset: cc.Prefab) => {
                    callback(err, asset);
                });
        }
    }

    /**
     * 加载场景
     */
    loadScene(path, callback?) {
        //设置被踢的标识
        if ('Login' == path) GamePublic.instance.isKickToLogin = true;
        cc.director.loadScene(path, callback);
    }

    /**
     * 预加载场景
     */
    preloadScene(path, callback?) {
        cc.director.preloadScene(path, callback);
    }

    /**
     * 显示隐藏加载界面
     * @param {boolean} isShow 是否显示 
     * @param {string} name 弹窗名称
     * @returns 
     */
    showLoading(isShow: boolean, name?: string) {
        let isRemove = this.getIsRemoveToast(name);
        if (isRemove) return;
        if (!this.loadingToast) return;
        if (isShow) {
            this.loadingToast.updateToast();
        } else {
            if (!this.loadingToast) return;
            this.loadingToast.closeToast();
        }
    }

    /**
     * 剔除不需要显示加载界面的弹窗
     * @param {string} name 弹窗名称 
     * @returns 
     */
    getIsRemoveToast(name: string) {
        const removeToast = ['prefab/public/PopLoading', 'prefab/public/PopTiShi', 'prefab/ui/login/LoginOffline'];
        let index = removeToast.indexOf(name);
        return -1 !== index;
    }

    /**
     * 复制到剪切板
     * @param {string} text 需要复制的文本 
     */
    async copyToClipboard(text: string) {
        // 只能在安全域下使用 安全域包括本地访问与开启TLS安全认证的地址，如 https 协议的地址、127.0.0.1 或 localhost
        // navigator clipboard 向剪贴板写文本
        navigator.clipboard
            .writeText(text)
            .then(() => {
                this.showTiShi('tishi/label1');
                // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'copyToClipboard success');
            })
            .catch((err) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'Failed to copy code:', err);
                // 创建text area
                let textArea: any = document.createElement("textarea");
                textArea.value = text;
                // 使text area不在viewport，同时设置不可见
                textArea.style.position = "absolute";
                textArea.style.opacity = 0;
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                return new Promise<void>((res, rej) => {
                    // 执行复制命令并移除文本框
                    document.execCommand("copy") ? res() : rej();
                    textArea.remove();
                }).then(() => {
                    this.showTiShi('tishi/label1');
                    // GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, 'copyToClipboard success');
                }).catch((err) => {
                    GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, 'Failed to copy code:', err);
                });
            });
    }

    /**
     * 创建一个数字动画
     * @param {cc.Node} parentNode 父节点
     * @param {any} numData {pos:坐标,num:数字}
     */
    careteNumAnim(parentNode: cc.Node, numData: any) {
        if (!cc.isValid(parentNode) || !numData) return;

        let numAnim = PoolManager.instance.get("NumAnim");

        numAnim.parent = parentNode;
        numAnim.getComponent('NumAnim').init(this, numData);
    }

    /**
     * 设置多语言文本内容
     * @param {any} label 文本或富文本组件
     * @param {string} textKey 多语言key 
     * @param {string} text 替换文本
     * @param {string} textSymbol 可选参数，替换符号 默认'XXX'
     * @param {Function} callback 可选参数，回调函数
     */
    setLocalizedLabelText(label: any, textKey: string, text: string, textSymbol: string = 'XXX', callback?: Function) {
        if (!label || !cc.isValid(label.node) || !textKey) return;

        let textTab = TB_LanguageText[textKey];
        if (!textTab) return;

        let labelText = GameUtils.instance.clone(textTab[`type_${GameGlobal.lauguageType}`]);
        if (!labelText) return;

        label.textKey = textKey;
        let index = labelText.indexOf(textSymbol);

        setTimeout(() => {
            if (index >= 0) {
                label.string = labelText.replace(textSymbol, text);
            } else {
                label.string = labelText;
            }
            if (callback) callback();
        }, 0);
    }

    /**
     * 加载tg头像
     * @param {cc.Sprite} head Sprite组件 
     * @param {string} headUrl 头像链接 
     * @returns 
     */
    loadTGHead(head: cc.Sprite, headUrl: string) {
        if (!head || !cc.isValid(head.node) || !headUrl || '' == headUrl) {
            this.loadDefaultHead(head);
            return;
        }
        head.node.opacity = 0;
        cc.loader.load({ url: headUrl, type: 'jpg' }, (err: any, texture: string | cc.Texture2D) => {
            if (err) {
                head.node.opacity = 255;
                this.loadDefaultHead(head);
                return;
            }
            if (head && cc.isValid(head.node)) head.spriteFrame = new cc.SpriteFrame(texture);
            head.node.opacity = 255;
        });
    }

    /**
     * 加载默认头像
     * @param {cc.Sprite} head Sprite组件 
     */
    loadDefaultHead(head: cc.Sprite) {
        if (!head) return;
        this.loadSpriteFrame(head, 'ui/common/ui_common_bg02', null, {
            callback: () => {
                if (!head || !cc.isValid(head.node)) return;
                head.node.opacity = 255;
            }
        })
    }

    /**
     * 加载脚本
     * @param {string} url 外部地址 
     * @param {Function} callback 回调 
     * @returns 
     */
    loadScript(url: string, callback?: Function) {
        if (!url || '' == url) return;
        // 在你的脚本中，使用 cc.loader.loadScript 来加载外部脚本
        cc.assetManager.loadScript(url, function (err) {
            if (err) {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, "Failed to load script:", err);
            } else {
                GameUtils.instance.log('caoyang', LOG_LEVEL.INFO, "Script loaded successfully", url);
                if (callback) callback();
            }
        });
    }

}

