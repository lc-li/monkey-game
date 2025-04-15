import Guide from './TB_Guide';
import Item from './TB_Item';
import Leaderboard from './TB_Leaderboard';
import MonkeyExp from './TB_MonkeyExp';
import Onlinepoints from './TB_Onlinepoints';
import Skin from './TB_Skin';
import TapPoints from './TB_TapPoints';
import WelfareTask from './TB_WelfareTask';
import LanguageSprite from './i18n/TB_LanguageSprite';
import LanguageText from './i18n/TB_LanguageText';

export interface IF_GameTable {
  /** TB_Guide */
  Guide: any,
  /** TB_Item */
  Item: any,
  /** TB_Leaderboard */
  Leaderboard: any,
  /** TB_MonkeyExp */
  MonkeyExp: any,
  /** TB_Onlinepoints */
  Onlinepoints: any,
  /** TB_Skin */
  Skin: any,
  /** TB_TapPoints */
  TapPoints: any,
  /** TB_WelfareTask */
  WelfareTask: any,
  /** TB_LanguageSprite */
  LanguageSprite: any,
  /** TB_LanguageText */
  LanguageText: any,
}

export default class GameTable {
  static data: IF_GameTable = {
    Guide: Guide,
    Item: Item,
    Leaderboard: Leaderboard,
    MonkeyExp: MonkeyExp,
    Onlinepoints: Onlinepoints,
    Skin: Skin,
    TapPoints: TapPoints,
    WelfareTask: WelfareTask,
    LanguageSprite: LanguageSprite,
    LanguageText: LanguageText,
  };
}

