import GameGlobal from "../tool/GameGlobal";
import GameTable from '../Table/GameTable';
const TB_LanguageSprite = GameTable.data.LanguageSprite;
cc.Class({
    extends: cc.Sprite,

    editor:{
        executeInEditMode: true,
        menu: "i18n/LocalizedSprite",
    },

    properties: {
        textKey: {
            default: 'TEXT_KEY',
            multiline: true,
            tooltip: 'Enter i18n key here',
            notify: function () {
                cc.resources.load(this.localizedString, cc.SpriteFrame, (err, spriteFrame) => {
                    if (err) {
                        cc.error(err.message || err);
                        return;
                    }
                    this.spriteFrame = spriteFrame;
                });
            }
        },
        localizedString: {
            override: true,
            tooltip: 'Here shows the localized string of Text Key',
            get: function () {
                let languageData = TB_LanguageSprite[this.textKey];
                if (!languageData) return this.string;
                let lauguageType = GameGlobal.lauguageType;
                return languageData[`type_${lauguageType}`];
            },
            set: function (value) {
                this.textKey = value;
                if (CC_EDITOR) {
                    // cc.warn('Please set label text key in Text Key property.');
                }
            }
        },
    },

    onLoad() {
        if (this.localizedString) {
            cc.resources.load(this.localizedString, cc.SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    cc.error(err.message || err);
                    return;
                }
                this.spriteFrame = spriteFrame;
            });
        }
    }
});
