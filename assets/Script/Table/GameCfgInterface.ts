/**
 * @file 游戏数据表的接口，接口里的参数和对应表的列一一对应
 * @author 1241776745.qq.com(CaoYang)
 * Copyright 2024 HYJZ Inc.All Rights Reserved.
 */


/**
 * TB_Guide表的接口
 * @param GuideID 引导id
 * @param NextId 下一个引导ID
 * @param Text 引导简介
 * @param TopTips 顶部tips
 * @param ShowGuideGirl 是否显示指引人物
 * @param GuideGirlIsRight 指引人物在右侧
 * @param ClickNext 点击任意地方完成指引
 * @param AutoNext 自动接下一个引导
 * @param MaskData 遮罩属性(x, y, 宽, 高)
 * @param MaskType 遮罩类型(1方形，2圆形)
 * @param FingerPos 引导手指坐标(x,y)
 * @param PrefabName 按钮所在的界面或父节点
 * @param BtnName 按钮名称
 * @param SaveData 完成引导后保存进度
 */
export interface IF_TB_Guide {
	/** 引导id */
	GuideID: number,
	/** 下一个引导ID */
	NextId: number,
	/** 引导简介 */
	Text: string,
	/** 顶部tips */
	TopTips: string,
	/** 是否显示指引人物 */
	ShowGuideGirl: number,
	/** 指引人物在右侧 */
	GuideGirlIsRight: number,
	/** 点击任意地方完成指引 */
	ClickNext: number,
	/** 自动接下一个引导 */
	AutoNext: number,
	/** 遮罩属性(x, y, 宽, 高) */
	MaskData: string,
	/** 遮罩类型(1方形，2圆形) */
	MaskType: number,
	/** 引导手指坐标(x,y) */
	FingerPos: string,
	/** 按钮所在的界面或父节点 */
	PrefabName: string,
	/** 按钮名称 */
	BtnName: string,
	/** 完成引导后保存进度 */
	SaveData: number,
}

/**
 * TB_Item表的接口
 * @param Item_id 道具表id
 * @param Reveal_type 是否在界面显示
 * @param Reward_type 道具表奖励类型
 * @param Item_icon 道具icon
 * @param Item_description 道具描述
 * @param Up 提升百分比
 * @param Chance 奖励概率
 */
export interface IF_TB_Item {
	/** 道具表id */
	Item_id: number,
	/** 是否在界面显示 */
	Reveal_type: number,
	/** 道具表奖励类型 */
	Reward_type: number,
	/** 道具icon */
	Item_icon: string,
	/** 道具描述 */
	Item_description: string,
	/** 提升百分比 */
	Up: number,
	/** 奖励概率 */
	Chance: number,
}

/**
 * TB_Leaderboard表的接口
 * @param Leaderboard_id 排行榜表id
 * @param Tier_name 段位名称
 * @param Monkey_spine 奖杯图片/spine
 * @param Goal 等级表id
 */
export interface IF_TB_Leaderboard {
	/** 排行榜表id */
	Leaderboard_id: number,
	/** 段位名称 */
	Tier_name: string,
	/** 奖杯图片/spine */
	Monkey_spine: string,
	/** 等级表id */
	Goal: number,
}

/**
 * TB_MonkeyExp表的接口
 * @param Exp_id 表id
 * @param lv 下一等级id
 * @param Up_points 到达对应等级所需积分进度
 */
export interface IF_TB_MonkeyExp {
	/** 表id */
	Exp_id: number,
	/** 下一等级id */
	lv: number,
	/** 到达对应等级所需积分进度 */
	Up_points: number,
}

/**
 * TB_Onlinepoints表的接口
 * @param Tap_id 表id
 * @param Exp_id 等级表id
 * @param Onlinepoints 在线挂机收益
 */
export interface IF_TB_Onlinepoints {
	/** 表id */
	Tap_id: number,
	/** 等级表id */
	Exp_id: number,
	/** 在线挂机收益 */
	Onlinepoints: number,
}

/**
 * TB_Skin表的接口
 * @param Skin_id 表id
 * @param Skin_type 任务类别
 * @param Unlock 解锁条件
 * @param Skin_name 皮肤名称
 * @param Skin_description 皮肤描述
 * @param Monkey_spine 猴子spine文件
 * @param Monkey_png 猴子png文件
 * @param Monkey_base 对应底座
 * @param Unlock_description 解锁翻译描述
 */
export interface IF_TB_Skin {
	/** 表id */
	Skin_id: number,
	/** 任务类别 */
	Skin_type: number,
	/** 解锁条件 */
	Unlock: number,
	/** 皮肤名称 */
	Skin_name: string,
	/** 皮肤描述 */
	Skin_description: string,
	/** 猴子spine文件 */
	Monkey_spine: string,
	/** 猴子png文件 */
	Monkey_png: string,
	/** 对应底座 */
	Monkey_base: string[],
	/** 解锁翻译描述 */
	Unlock_description: string,
}

/**
 * TB_TapPoints表的接口
 * @param Points_id 表id
 * @param Exp_id 等级表id
 * @param Tap_points 点击所获得积分
 */
export interface IF_TB_TapPoints {
	/** 表id */
	Points_id: number,
	/** 等级表id */
	Exp_id: number,
	/** 点击所获得积分 */
	Tap_points: number,
}

/**
 * TB_WelfareTask表的接口
 * @param Welfare_id 表id
 * @param Welfare_type 任务类别
 * @param Task_name 任务描述
 * @param Icon 任务icon
 * @param Reward 任务奖励
 */
export interface IF_TB_WelfareTask {
	/** 表id */
	Welfare_id: number,
	/** 任务类别 */
	Welfare_type: number,
	/** 任务描述 */
	Task_name: string,
	/** 任务icon */
	Icon: string,
	/** 任务奖励 */
	Reward: number,
}

/**
 * TB_LanguageSprite表的接口
 * @param key 唯一标识
 * @param type_1 中文
 * @param type_2 英文
 * @param type_3 繁體
 */
export interface IF_TB_I18n_LanguageSprite {
	/** 唯一标识 */
	key: string,
	/** 中文 */
	type_1: string,
	/** 英文 */
	type_2: string,
	/** 繁體 */
	type_3: string,
}

/**
 * TB_LanguageText表的接口
 * @param key 唯一标识
 * @param undefined undefined
 * @param type_1 中文
 * @param type_2 英文
 * @param type_3 繁體
 */
export interface IF_TB_I18n_LanguageText {
	/** 唯一标识 */
	key: string,
	/** undefined */
	undefined: any,
	/** 中文 */
	type_1: string,
	/** 英文 */
	type_2: string,
	/** 繁體 */
	type_3: string,
}

