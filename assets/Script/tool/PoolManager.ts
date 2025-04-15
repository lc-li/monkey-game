import GameUtils,{ LOG_LEVEL } from "./GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export class PoolManager extends cc.Component {
    public static instance: PoolManager;

    /**建立对象池的预制体 */
    @property(cc.Prefab)
    public prefab: cc.Prefab[] = [];
    public prefabMap: { [key: string]: number; } = {};
    public poolMap: { [key: string]: cc.NodePool; } = {};

    onLoad() {
        PoolManager.instance = this;

        // 初始化预制体name到map中存为索引值，new预制体数量的NodePool 
        for (let i = 0; i < this.prefab.length; i++) {
            this.prefabMap[this.prefab[i].name] = i;
            this.poolMap[this.prefab[i].name + "Pool"] = new cc.NodePool();
        }
    }

    /**
     * 从对象池取出
     * @param prefabName 预制件名称
     * @returns 对象池中对象
     */
    public get(prefabName: string): cc.Node {
        let i: number = this.prefabMap[prefabName];
        if (i == undefined) {
            // GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, "预制体不存在或未加载");
            return;
        }
        let getNode = this.poolMap[prefabName + "Pool"].get();
        if (this.poolMap[prefabName + "Pool"].size() > 0) {
            getNode.active = true;
        }
        else {
            getNode = cc.instantiate(this.prefab[i]);
            getNode.active = true;
        }
        // GameUtils.instance.log('caoyang', LOG_LEVEL.DEBUG, "取出成功");
        return getNode;
    }

    /**放回对象池 
     * @param putNode 放回节点
    */
    public put(putNode: cc.Node) {
        putNode.active = false;
        this.poolMap[putNode.name + "Pool"].put(putNode);
        // GameUtils.instance.log('caoyang', LOG_LEVEL.DEBUG, "放回成功");
    }

    /**清理对象池的单个对象
     * @param putNode 放回节点
    */
    public ClearPool(putNode: cc.Node) {
        this.poolMap[putNode.name + "Pool"].clear();
    }

    //清理对象池所有对象
    public ClearPoolAll() {
        for (const key in this.poolMap) {
            this.poolMap[key].clear();
        }
    }
}
