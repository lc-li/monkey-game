import BaseDialog from "../tool/BaseDialog";
import List from "../tool/List";
import GameGlobal from "../tool/GameGlobal";
import GameHttp from "../tool/GameHttp";
import GameAudio from "../tool/GameAudio";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
import GameData from "../tool/GameData";
import GameUI from "../tool/GameUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RankNew extends BaseDialog {

    @property(cc.Sprite)
    moneyIcon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    moneyIconArr: cc.SpriteFrame[] = [];

    @property(cc.Label)
    moneyNum: cc.Label = null;

    @property(List)
    rankList: List = null;

    @property(cc.Prefab)
    rankPageItem: cc.Prefab = null;

    @property(cc.Node)
    tips: cc.Node = null;

    @property(cc.Node)
    myRankItem: cc.Node = null;

    /** 段位分页索引*/
    rankLevel: number = 0;
    /** 当前请求的页数*/
    curPage: number = 1;
    /** 当前类型1: 周榜 2: 全部*/
    curListType: number = 2;
    /** 当前类型1：猴币 2：金积分*/
    curMoneyType: number = 1;

    /** 数据是否请求完毕*/
    requestEnd: boolean = true;

    /** 排行榜数据*/
    rankData: any = {
        list: [],//当前排行榜数组
        rank: -1,//当前自己的排名
        total: 0,//排行榜总条数
        page: 0,//排行榜当前页数
        per: 0,//每页排行榜的数据
    };

    init(base, data) {
        super.init(base, data);
    }

    onLoad() {
        super.onLoad();
        this.addEvent();
        //初始化适配
        this.initWidget();
        //更新money
        this.updateMoney();
        //请求排行榜数据
        this.requestRank(false);
    }

    onDestroy() {
        super.onDestroy();
        this.removeEvent();
    }

    addEvent() {
        this.rankList.node.on('scroll-to-bottom', this.scrollBottom, this);
    }

    removeEvent() {
        if (this.rankList && cc.isValid(this.rankList.node)) this.rankList.node.off('scroll-to-bottom', this.scrollBottom, this);
    }

    /**
     * 初始化适配
     */
    initWidget() {
        let bottomBg = cc.find('content/bottomBg', this.node);
        let winHeight = cc.view.getVisibleSize().height / 2;
        this.scheduleOnce(() => {
            let bottomHeight = bottomBg.y + winHeight;
            bottomBg.height = bottomHeight;
            this.rankList.node.height = bottomHeight - 290;
            cc.find('view', this.rankList.node).height = bottomHeight - 290;
            this.tips.y = -(bottomHeight - 290) / 2;
        }, 1 / 60);
    }

    /**
     * 更新money
     */
    updateMoney() {
        switch (this.curMoneyType) {
            case 1://猴币
                this.moneyIcon.spriteFrame = this.moneyIconArr[0];
                this.moneyNum.string = GameUtils.instance.getShowDiamond(GameData.instance.moneyData.serverTotal);
                this.moneyNum.node.color = new cc.Color().fromHEX('#FFB424');
                break;
            case 2://金积分
                this.moneyIcon.spriteFrame = this.moneyIconArr[1];
                this.moneyNum.string = GameUtils.instance.getShowDiamond(GameData.instance.pledgeData.goldNum);
                this.moneyNum.node.color = new cc.Color().fromHEX('#FFFFFF');
                break;
            default:
                break;
        }
    }

    /**
     * 列表滑动到底部监听
     * @param {cc.ScrollView} scrollView 列表 
     */
    scrollBottom(scrollView: cc.ScrollView) {
        if (!this.requestEnd) return;
        //计算排行榜总页数
        let totalPage = Math.ceil(this.rankData.total / this.rankData.per);
        //判断是否滑动到底部了
        this.curPage++;
        if (this.curPage > totalPage) {
            this.curPage = totalPage;
            return;
        }
        this.requestRank(true);
    }

    /**
     * 切换方式toggle
     * @param toggle 
     */
    onBottomToggleEvent(toggle: cc.Toggle) {
        GameAudio.instance.playEffect('dianji');
        if (!this.requestEnd) return;

        let name = toggle.node.name;
        switch (name) {
            case 'toggle1':
                this.curMoneyType = 1;
                break;
            case 'toggle2':
                this.curMoneyType = 2;
                break;
            default:
                break;
        }
        //重置当前请求的页数
        this.curPage = 1;
        this.requestRank(false);
        //更新money
        this.updateMoney();
    }

    onListRenderEvent(item, idx) {
        let itemTs = item.getComponent('RankListItem');
        let data = this.rankData.list[idx];
        data.curMoneyType = this.curMoneyType;

        itemTs.init(this, data);
    }

    /**
     *  请求排行榜接口
     */
    requestRank(isConcat = false) {
        GameUI.instance.showLoading(true);
        let url = GameGlobal.httpPort.getRankingData;
        // let sendData = {
        //     type: this.curListType,//周榜、全部
        //     way: this.curMoneyType,//猴币、金积分
        //     level: this.rankLevel + 1,//当前段位
        //     page: this.curPage,//当前分页
        // };
        let sendData = {
            type: this.curMoneyType,//猴币、金积分
            pageSize: 50,//每页数量
            page: this.curPage,//当前分页
        };
        this.requestEnd = false;
        let self = this;
        GameHttp.instance.post(url, sendData,
            (res: any) => {
                GameUI.instance.showLoading(false);
                this.requestEnd = true;
                res = JSON.parse(res);
                if (!res || 200 !== res.ret_code) return;
                let data = res.data;
                if (isConcat) {
                    Array.prototype.push.apply(self.rankData.list, data.list);
                } else {
                    if (!data || !self.rankData) return;
                    self.rankData.list = data.list;
                }

                self.rankData.rank = data.rank;
                self.rankData.total = data.total;
                self.rankData.page = data.page;
                self.rankData.per = data.per;
                if (!self || !cc.isValid(self.node) || !self.rankList) return;
                let len = self.rankData.list ? self.rankData.list.length : 0;
                self.rankList.numItems = len;
                self.tips.active = (0 == len);
                //更新自己的排名
                self.updateMyRank();
            },
            (err: any) => {
                GameUI.instance.showLoading(false);
                self.tips.active = true;
                self.requestEnd = true;
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
            }
        );
    }

    /**
     * 更新自己的排名
     */
    updateMyRank() {
        if (!this.rankData || !this.rankData.rank || !this.rankData.list) {
            this.myRankItem.active = false;
            return;
        }
        this.myRankItem.active = true;
        this.myRankItem.getComponent('RankListItem').init(this, {
            isMe: true,
            rank: this.rankData.rank,
            curMoneyType: this.curMoneyType,
        })
    }

    onBtnClose() {
        this.node.destroy();
    }

}
