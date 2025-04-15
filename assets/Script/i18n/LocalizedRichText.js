import GameGlobal from "../tool/GameGlobal";
import GameTable from '../Table/GameTable';
const TB_LanguageText = GameTable.data.LanguageText;

cc.Class({
    extends: cc.RichText,

    editor: {
        executeInEditMode: true,
        menu: "i18n/LocalizedRichText",
    },

    properties: {
        textKey: {
            default: 'TEXT_KEY',
            multiline: true,
            tooltip: 'Enter i18n key here',
            notify: function () {
                if (this.localizedString != "TEXT_KEY") {
                    this.string = this.localizedString;
                }
            }
        },
        localizedString: {
            override: true,
            tooltip: 'Here shows the localized string of Text Key',
            get: function () {
                let languageData = TB_LanguageText[this.textKey];
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
        if (this.localizedString && this.localizedString != "TEXT_KEY") {
            this.string = this.localizedString;
        }
    }
});
