import BaseDialog from "../tool/BaseDialog";
import List from "../tool/List";
import GameTable from "../Table/GameTable";
import { IF_TB_Leaderboard } from "../Table/GameCfgInterface";
import GameData from "../tool/GameData";
import GameUI from "../tool/GameUI";
import GameGlobal from "../tool/GameGlobal";
import GameHttp from "../tool/GameHttp";
import GameAudio from "../tool/GameAudio";
import GameUtils, { LOG_LEVEL } from "../tool/GameUtils";
const TB_Leaderboard: IF_TB_Leaderboard = GameTable.data.Leaderboard;

const { ccclass, property } = cc._decorator;

@ccclass
export default class Rank extends BaseDialog {

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.PageView)
    rankPageView: cc.PageView = null;

    @property(sp.Skeleton)
    lightSpine: sp.Skeleton = null;

    @property(cc.Node)
    btn_left: cc.Node = null;

    @property(cc.Node)
    btn_right: cc.Node = null;

    @property(cc.Label)
    upTonNum: cc.Label = null;

    @property(List)
    rankList: List = null;

    @property(cc.Prefab)
    rankPageItem: cc.Prefab = null;

    @property(cc.Node)
    tips: cc.Node = null;

    @property(cc.Node)
    myRankItem: cc.Node = null;

    /** 排行榜分页数据*/
    rankPageData: any = [];
    /** 段位分页索引*/
    rankLevel: number = 0;
    /** 当前请求的页数*/
    curPage: number = 1;
    /** 当前类型1: 周榜 2: 全部*/
    curListType: number = 2;
    /** 当前类型1：猴币 2：upton*/
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
        //得到排行榜数据表
        this.getRankTableData();
    }

    onLoad() {
        super.onLoad();
        this.addEvent();
        //初始化适配
        this.initWidget();
        //更新upTon
        this.updateUpTon();
        //更新段位分页
        this.updateRankPageUI(true);
    }

    onDestroy() {
        super.onDestroy();
        this.removeEvent();
    }

    addEvent() {
        // this.rankPageView.node.on('scroll-began', this.pageScrollBegan, this);
        this.rankPageView.node.on('scroll-ended', this.pageScrollEnd, this);
        this.rankList.node.on('scroll-to-bottom', this.scrollBottom, this);
    }

    removeEvent() {
        if (this.rankPageView && cc.isValid(this.rankPageView.node)) {
            // this.rankPageView.node.on('scroll-began', this.pageScrollBegan, this);
            this.rankPageView.node.off('scroll-ended', this.pageScrollEnd, this);
        }
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
            this.rankList.node.height = bottomHeight - 370;
            cc.find('view', this.rankList.node).height = bottomHeight - 370;
            // this.tips.setScale(winHeight <= 640 ? 0.6 : 1);
            this.tips.y = -bottomHeight / 2 + 50;
        }, 1 / 60);
    }

    /**
     * 得到排行榜数据表
     */
    getRankTableData() {
        this.rankPageData = [];
        for (const key in TB_Leaderboard) {
            this.rankPageData.push(TB_Leaderboard[key]);
        }
    }

    /**
     * 更新upTon
     */
    updateUpTon() {
        this.upTonNum.string = GameUtils.instance.getShowDiamond(GameData.instance.pledgeData.goldNum);
    }

    /**
     * 更新段位分页
     * @param {boolean} isRemove 是否移除分页
     */
    updateRankPageUI(isRemove: boolean = true) {
        if (isRemove) {
            //先移除所有的分页
            if (this.rankPageView.content.childrenCount > 0) this.rankPageView.removeAllPages();
            for (let i = 1; i <= this.rankPageData.length; i++) {
                let page = cc.instantiate(this.rankPageItem);
                page.name = `rankPageItem_${i}`;
                page.getComponent('RankPageItem').init(this, this.rankPageData[i - 1]);
                this.rankPageView.addPage(page);
            }
        }

        //得到自己的段位
        let curRankData = GameData.instance.getCurRankData();
        //切换到对应的分页
        this.rankLevel = curRankData.Leaderboard_id - 1;
        this.scheduleOnce(() => {
            this.rankPageView.scrollToPage(this.rankLevel, 0.1);
        }, 1 / 60);
    }

    /**
     * pageView切换分页结束监听
     * @param {*} pageView 
     */
    pageScrollEnd(pageView) {
        let pageIdx = pageView.getCurrentPageIndex();
        this.rankLevel = pageIdx;
        //重置当前请求的页数
        this.curPage = 1;
        //更新背景
        this.updateUpBgUI();
        this.requestRank(false);
        this.updatePageBtnUI();
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
     * 更新背景ui
     */
    updateUpBgUI() {
        let rankData = this.rankPageData[this.rankLevel];
        GameUI.instance.loadSpriteFrame(this.bg, `ui/rank/${rankData.Phb_bg}`, this.name);
        //更换动画
        this.lightSpine.setSkin(`loop_${rankData.Leaderboard_id}`);
    }

    /**
     * 更新切换箭头分页UI
     */
    updatePageBtnUI() {
        if (this.rankLevel <= 0) {
            this.btn_left.active = false;
            this.btn_right.active = true;
        } else if (this.rankLevel >= this.rankPageData.length - 1) {
            this.btn_left.active = true;
            this.btn_right.active = false;
        } else {
            this.btn_left.active = true;
            this.btn_right.active = true;
        }
    }

    /**
     * 箭头切换分页
     * @param event 
     * @param customEventData 
     */
    onBtnChangePageView(event, customEventData) {
        if (!this.requestEnd) return;
        let name = event.target.name;
        switch (name) {
            case 'btn_left':
                this.rankLevel--;
                break;
            case 'btn_right':
                this.rankLevel++;
                break;
            default:
                break;
        }
        if (this.rankLevel > this.rankPageData.length - 1) this.rankLevel = 0;
        if (this.rankLevel < 0) this.rankLevel = this.rankPageData.length - 1;
        this.rankPageView.scrollToPage(this.rankLevel, 0.3);
    }

    /**
     * 切换周榜toggle
     * @param toggle 
     */
    onListToggleEvent(toggle: cc.Toggle) {
        GameAudio.instance.playEffect('dianji');
        if (!this.requestEnd) return;

        let name = toggle.node.name;
        switch (name) {
            case 'toggle1':
                this.curListType = 1;
                break;
            case 'toggle2':
                this.curListType = 2;
                break;
            default:
                break;
        }
        //重置当前请求的页数
        this.curPage = 1;
        this.requestRank(false);
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
    }

    onListRenderEvent(item, idx) {
        let itemTs = item.getComponent('RankListItem');
        let data = this.rankData.list[idx];

        itemTs.init(this, data);
    }

    /**
     *  请求排行榜接口
     */
    requestRank(isConcat = false) {
        let url = GameGlobal.httpPort.ranking;
        let sendData = {
            type: this.curListType,//周榜、全部
            way: this.curMoneyType,//猴币、upton
            level: this.rankLevel + 1,//当前段位
            page: this.curPage,//当前分页
        };
        this.requestEnd = false;
        GameHttp.instance.post(url, sendData,
            (res) => {
                this.requestEnd = true;
                res = JSON.parse(res);
                if (!res || 200 !== res.ret_code) return;
                let data = res.data;
                if (isConcat) {
                    Array.prototype.push.apply(this.rankData.list, data.list);
                } else {
                    if (!data || !this.rankData) return;
                    this.rankData.list = data.list;
                }

                this.rankData.list = [];

                this.rankData.rank = data.rank;
                this.rankData.total = data.total;
                this.rankData.page = data.page;
                this.rankData.per = data.per;
                if (!this || !cc.isValid(this.node) || !this.rankList) return;
                let len = this.rankData.list.length;
                this.rankList.numItems = len;
                this.tips.active = (0 == len);
                //更新自己的排名
                this.updateMyRank();
            },
            (err) => {
                this.requestEnd = true;
                GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, err);
            }
        );
    }

    /**
     * 更新自己的排名
     */
    updateMyRank() {
        if (!this.rankData || !this.rankData.rank) return;
        this.myRankItem.getComponent('RankListItem').init(this, {
            isMe: true,
            rank: this.rankData.rank,
        })
    }

    onBtnClose() {
        this.node.destroy();
    }

}
