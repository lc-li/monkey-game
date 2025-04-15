import BaseDialog from "../tool/BaseDialog";
import GameEvent from "../tool/GameEvent";
import GameGlobal from "../tool/GameGlobal";
import GameHttp from "../tool/GameHttp";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import List from "../tool/List";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Task extends BaseDialog {

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.ScrollView)
    taskList: cc.ScrollView = null;

    @property(cc.Node)
    dailyTitle: cc.Node = null;

    @property(cc.Node)
    basicTitle: cc.Node = null;

    @property(cc.Prefab)
    taskItem: cc.Prefab = null;

    /** 日常任务*/
    taskDailyTask: any[] = [];
    /** 基础任务*/
    taskBaiseData: any[] = [];

    /** 层次节点数组*/
    zIndexNodeArr: cc.Node[] = [];

    init(base, data) {
        super.init(base, data);
    }

    onLoad() {
        super.onLoad();
        //初始化适配
        this.initWidget();
        //请求任务
        this.requestTask();
    }

    onDestroy() {
        super.onDestroy();
    }

    /**
     * 初始化适配
     */
    initWidget() {
        let winHeight = cc.winSize.height / 2;
        this.scheduleOnce(() => {
            let taskListHeight = this.taskList.node.y + winHeight - 165;
            this.taskList.node.height = taskListHeight;
            cc.find('view', this.taskList.node).height = taskListHeight;
        }, 0.1);
    }

    /**
     * 请求任务
     */
    requestTask() {
        this.taskDailyTask = [];
        this.taskBaiseData = [];
        let url = GameGlobal.httpPort.getTasks;
        GameHttp.instance.post(url, {},
            (res: any) => {
                res = JSON.parse(res);
                if (!res || 200 !== res.ret_code || !cc.isValid(this.node)) return;
                let taskListData = res.data.taskList;
                for (let i = 0; i < taskListData.length; i++) {
                    let taskListItem = taskListData[i];
                    if (1 == taskListItem.taskType) {
                        this.taskDailyTask.push(taskListItem);
                    } else {
                        this.taskBaiseData.push(taskListItem);
                    }
                }
                //数组排序
                this.taskSortData();
                //更新基础任务
                this.updateTaskUI();
            },
            (err: any) => {
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
            }
        );
    }

    /**
     * 任务数组排序
     */
    taskSortData() {
        if (this.taskDailyTask && 0 < this.taskDailyTask.length) {
            this.taskDailyTask.sort(function (x, y) {
                if (x.state == 1 || y.state == 1) {
                    return x.state - y.state;
                } else {
                    return x.sortNumber - y.sortNumber;
                }
            });
        }

        if (this.taskBaiseData && 0 < this.taskBaiseData.length) {
            this.taskBaiseData.sort(function (x, y) {
                if (x.state == 1 || y.state == 1) {
                    return x.state - y.state;
                } else {
                    return x.sortNumber - y.sortNumber;
                }
            });
        }
    }

    /**
     * 更新任务ui
     */
    updateTaskUI() {
        //分帧加载
        let createNum = 0;
        //先将日常任务标题添加进去
        this.zIndexNodeArr = [this.dailyTitle];
        let createCall = () => {
            if (createNum > (this.taskDailyTask.length + this.taskBaiseData.length - 1)) {
                // 在第六次执行回调时取消这个计时器
                this.unschedule(createCall);
                //更新层级关系
                this.updateItemZIndex();
                return;
            }

            let taskData = null, taskIdx = 0;
            if (createNum > this.taskDailyTask.length - 1) {
                if (createNum == this.taskDailyTask.length) {
                    this.zIndexNodeArr.push(this.basicTitle);
                }
                taskData = this.taskBaiseData;
                taskIdx = createNum - this.taskDailyTask.length;
            } else {
                taskData = this.taskDailyTask;
                taskIdx = createNum;
            }
            let taskDailyItem = cc.instantiate(this.taskItem);
            taskDailyItem.parent = this.taskList.content;
            this.zIndexNodeArr.push(taskDailyItem);
            taskDailyItem.getComponent('TaskBasicItem').init(this, taskData[taskIdx]);

            createNum++;
        }
        this.schedule(createCall, 1 / 60);
    }

    /**
     * 更新层级关系
     */
    updateItemZIndex() {
        if (0 >= this.zIndexNodeArr.length) return;
        this.basicTitle.active = true;
        //更新层级关系
        for (let i = 0; i < this.zIndexNodeArr.length; i++) {
            this.zIndexNodeArr[i].zIndex = i;
        }
    }

    onBtnClose() {
        this.node.destroy();
        GameEvent.instance.dispatchEvent(GameEvent.UPDATE_TOGGLE_PAGE);
    }
}
