/**
 * @file 游戏音频播放管理模块
 * @author CaoYang 2024/8/12
 */

import { CCMAudioManager } from "./ccm/CCMAudioManager/CCMAudioManager";

import GameStore from './GameStore';
import GameUtils, { LOG_LEVEL } from './GameUtils';
import GameUI from './GameUI';
import GameGlobal from './GameGlobal';

export default class GameAudio {
    private static _instance: GameAudio;
    private _sound: string[] = [];
    private _effects = {};                             // 音乐剪辑集合
    private _effectClips = {};
    private _musicPlaying = false;// 背景音乐正在播放
    private _musicPlayFinish: Function = null;// 播放完成回调
    private _enableEffect = false; // 可以播放音效
    private _enableMusic = false; // 可以播放音乐
    private _enableVerb = false;
    private _bgMusicFile: any[] = [];
    private _bgEffectFile: any[] = [];//循环播放的音效
    private _curMusicFile: string = null;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new GameAudio();
        this._instance.init();
        return this._instance;
    }

    get bgMusicFile() {
        let musicData = this._bgMusicFile;
        return 0 === musicData.length ? null : musicData[musicData.length - 1].voiceUrl;
    }

    /**
     * 加载时进行初始化各种数据
     */
    init() {
        this.initEnableMusic();
        this.initEnableEffect();
        this.initEnableVerb();

        this._bgMusicFile = [];
        this._curMusicFile = null;
    }

    /**
     * 加载音乐/音效资源
     * @param sound 
     */
    preload(sound) {
        this._sound = sound;
        for (let idx in this._sound) {
            // let path = cc.path.join('voice', this._sound[idx]);
            let path = `voice/${this._sound[idx]}`;
            GameUI.instance.loadResource(path, cc.AudioClip, (errors, clip: cc.AudioClip) => {
                if (errors) {
                    return;
                }
                this._effectClips[path] = clip;
            });
        }
    }

    music(idx, loop = false) {
        let url = this._sound[idx];
        this.playMusic(url, loop);
    }

    /**
     * 播放音乐
     * @param {*} url 音乐路径 
     * @param {boolean} loop 是否循环
     * @param {Function} callback 播放回调
     */
    public playMusic(url, loop: boolean = false, callback?: Function) {
        cc.audioEngine.stopMusic();
        this._musicPlaying = false;
        if (null == GameStore.instance.get(GameStore.instance.STORE_TYPE.MUSIC) || 'undefined' === typeof GameStore.instance.get(GameStore.instance.STORE_TYPE.MUSIC)) {
            this._enableMusic = true;
        } else {
            this._enableMusic = GameStore.instance.get(GameStore.instance.STORE_TYPE.MUSIC);
        }
        if (this._enableMusic) {
            let path = cc.assetManager.utils.normalize(url);
            if (!path.startsWith('voice')) {
                // path = cc.path.join('voice', url);
                path = `voice/${url}`;
            }
            let musicVolume = this.getMusicVolume();
            cc.audioEngine.setMusicVolume(+musicVolume);
            GameUI.instance.loadResource(path, cc.AudioClip, (errors, clip: cc.AudioClip) => {
                if (errors) {
                    return;
                }
                let audioId = cc.audioEngine.playMusic(clip, loop);
                if (callback) callback(audioId)
                this._musicPlaying = true;
            });
        }
    }

    /**
     * 停止播放音乐
     * @param {boolean} isReset 是否重置所有背景音乐 
     */
    stopMusic(isReset: boolean = true) {
        if (isReset) this._bgMusicFile = [];
        cc.audioEngine.stopMusic();
        this._musicPlaying = false;
    }

    /**
     * 停止当前背景音乐并恢复上一背景音乐播放
     */
    stopResumeMusic() {
        if (this._musicPlaying) {
            cc.audioEngine.stopMusic();
            this._musicPlaying = false;
            this._bgMusicFile.splice(this._bgMusicFile.length - 1, 1);
        }
        if (0 < this._bgMusicFile.length) {
            let musicData = this._bgMusicFile[this._bgMusicFile.length - 1];
            this._curMusicFile = musicData.voiceUrl;
            this.playMusic(musicData.voiceUrl, true);
            return true;
        }
        return false;
    }

    /**
     * 暂停播放音乐
     */
    pauseMusic() {
        cc.audioEngine.pauseMusic();
    }

    /**
     * 恢复播放音乐
     */
    resumeMusic() {
        cc.audioEngine.resumeMusic();
    }

    /**
     * 得到当前音乐的音量
     */
    getMusicVolume() {
        let musicVolume = GameStore.instance.get(GameStore.instance.STORE_TYPE.MUSICE_VOLUME);
        if (musicVolume == null) {
          musicVolume = 0.7;
          this.setMusicVolume(musicVolume);
        }
        return +musicVolume;
    }

    /**
     * 设置当前音效
     * @param {number} volume 音效大小 
     */
    setMusicVolume(volume: number) {
        volume = cc.misc.clamp01(volume);
        cc.audioEngine.setMusicVolume(volume);
        GameStore.instance.put(GameStore.instance.STORE_TYPE.MUSICE_VOLUME, volume);
    }

    /**
     * 获取当前音乐是否正在播放
     * @returns {boolean} 布尔值
     */
    isMusicPlaying() {
        return cc.audioEngine.isMusicPlaying();
    }

    /**
     * 播放音频
     * @param {number} idx 音频位置
     * @param {boolean} loop 是否循环
     */
    playEffectByIndex(idx: number, loop?: boolean, specialName?, useCCM?) {
        let url = this._sound[idx];
        this.playEffect(url, loop, specialName, useCCM);
    }

    /**
     * 播放音频
     * @param {string} url 音频路径
     * @param {boolean} loop true循环播
     * @param {number} effectType 音效类型 1---游戏音效  2--角色语音
     */
    playEffect(url: string, loop = false, specialName?: string, useCCM = true, effectType: number = 1) {
        //播放游戏音效时音量为0直接不播放
        if (1 === effectType && 0 === this.getEffectsVolume()) return;
        //播放英雄语音时音量为0直接不播放
        if (2 === effectType && 0 === this.getVoiceVolume()) return;
        //先设置音量
        let volume = 1 === effectType ? this.getEffectsVolume() : this.getVoiceVolume();
        cc.audioEngine.setEffectsVolume(volume);
        CCMAudioManager.Instance.setVolume(volume);

        if (null == GameStore.instance.get(GameStore.instance.STORE_TYPE.VOICE) || 'undefined' === typeof GameStore.instance.get(GameStore.instance.STORE_TYPE.VOICE)) {
            this._enableEffect = true;
        } else {
            this._enableEffect = GameStore.instance.get(GameStore.instance.STORE_TYPE.VOICE);
        }
        let audioName = url;
        url = cc.assetManager.utils.normalize(url);
        if (!url.startsWith('voice')) {
            // url = cc.path.join('voice', url);
            url = `voice/${url}`;
        }
        if (this._enableEffect) {
            if (!useCCM) { // 停掉之前的相同音效
                if (this._effects[url]) cc.audioEngine.stopEffect(this._effects[url]);
                let clip = this._effectClips[url];
                if (clip) {
                    let audioId = cc.audioEngine.playEffect(clip, loop);

                    if (true == loop && !specialName) { // 没有特殊名的循环音效，直接存id
                        this._effects['' + audioId] = audioName;
                    } else {
                        specialName = specialName || url;
                        this._effects[specialName] = audioId;
                    }
                    cc.audioEngine.setFinishCallback(this._effects[specialName], () => {
                        if (!loop) {
                            this._effects[specialName] = null;
                        }
                    });
                } else {
                    // cc.assetManager.loadRemote(cc.url.raw(url + '.mp3'), (errors, clip) => {
                    GameUI.instance.loadResource(url, cc.AudioClip, (errors, clip: cc.AudioClip) => {
                        if (errors) {
                            GameUtils.instance.log('caoyang', LOG_LEVEL.ERROR, `${errors}`);
                            return;
                        }
                        this._effectClips[url] = clip;
                        let audioId = cc.audioEngine.playEffect(clip, loop);
                        if (true == loop && !specialName) { // 没有特殊名的循环音效，直接存id
                            this._effects['' + audioId] = audioName;
                        } else {
                            specialName = specialName || url;
                            this._effects[specialName] = audioId;
                        }
                        cc.audioEngine.setFinishCallback(this._effects[specialName], () => {
                            if (!loop) {
                                this._effects[specialName] = null;
                            }
                        });
                    });
                }
            } else {
                CCMAudioManager.Instance.playEffect(url + '.mp3');
            }
        }
    }

    /**
     * 获取当前音效的音量
     * @returns {number} 音量
     */
    getEffectsVolume(): number {
        let effectsVolume = GameStore.instance.get(GameStore.instance.STORE_TYPE.EFFECTS_VOLUME);
        return (effectsVolume || 0 == effectsVolume) ? +effectsVolume : 1;
    }

    /**
     * 设置当前音效的音量
     * @param {number} volume 音量大小 
     */
    setEffectsVolume(volume: number) {
        // volume = cc.clamp01(volume);
        volume = cc.misc.clamp01(volume);
        // cc.audioEngine.setEffectsVolume(volume);
        GameStore.instance.put(GameStore.instance.STORE_TYPE.EFFECTS_VOLUME, volume);
    }

    /**
     * 获取当前角色语音的音量
     * @returns {number} 音量
     */
    getVoiceVolume(): number {
        let voiceVolume = GameStore.instance.get(GameStore.instance.STORE_TYPE.VOICE_VOLUME);
        return (voiceVolume || 0 == voiceVolume) ? +voiceVolume : 1;
    }

    /**
     * 设置当前角色语音的音量
     * @param {number} volume 音量大小 
     */
    setVoiceVolume(volume: number) {
        volume = cc.misc.clamp01(volume);
        GameStore.instance.put(GameStore.instance.STORE_TYPE.VOICE_VOLUME, volume);
    }

    /**
     * 暂停某一个音效
     * @param {*} url 音效地址
     */
    pauseEffect(url) {
        url = cc.assetManager.utils.normalize(url);
        if (!url.startsWith('voice')) {
            // url = cc.path.join('voice', url);
            url = `voice/${url}`;
        }
        let audio = this._effects[url];
        if (audio)
            cc.audioEngine.pauseEffect(audio);
        else
            cc.error(`音效文件不存在! 地址: ${url}`);
    }

    /**
     * 暂停所有的音效
     */
    pauseAllEffects() {
        cc.audioEngine.pauseAllEffects();
    }

    /**
     * 恢复播放音效
     * @param {*} url 音效地址 
     */
    resumeEffect(url) {
        url = cc.assetManager.utils.normalize(url);
        if (!url.startsWith('voice')) {
            // url = cc.path.join('voice', url);
            url = `voice/${url}`;
        }
        let audio = this._effects[url];
        if (audio)
            cc.audioEngine.resumeEffect(audio);
        else
            cc.error(`音效文件不存在! 地址: ${url}`);
    }

    /**
     * 恢复所有音效播放
     */
    resumeAllEffects() {
        cc.audioEngine.resumeAllEffects();
    }

    /**
     * 停止音频
     * @param {*} url 
     * @param {*} specialName 非空表示特殊的音效，主要是多个组件播了同一个音频，因此用specialName来区分不同组件
     * @param {bealoon} isLoop true表示这是个循环音效，特殊处理
     */
    stopEffect(url, specialName, isLoop) {
        let audio = null;

        let searchAudioName = url;
        // 循环音效停掉所有当前的同名音效
        if (true === isLoop && !specialName) {
            for (const name in this._effects) {
                if (!Object.hasOwnProperty.call(this._effects, name)) {
                    continue;
                }
                const audioName = this._effects[name];
                if (audioName == searchAudioName) {
                    cc.audioEngine.stopEffect(parseInt(name));
                    this._effects[name] = null;
                }
            }

            return;
        }

        if (!!specialName) {
            audio = this._effects[specialName];
            this._effects[specialName] = null;
        } else {
            url = cc.assetManager.utils.normalize(url);
            if (!url.startsWith('voice')) {
                // url = cc.path.join('voice', url);
                url = `voice/${url}`;
            }
            audio = this._effects[url];
            this._effects[url] = null;
        }

        if (null != audio)
            cc.audioEngine.stopEffect(audio);
    }

    /**
     * 停止所有音效播放
     */
    stopAllEffects() {
        cc.audioEngine.stopAllEffects();
    }

    uncache(url) {
        if (!url.startsWith('voice')) {
            // url = cc.path.join('voice', url);
            url = `voice/${url}`;
        }
        let clip = this._effectClips[url];
        if (!clip) {
            cc.audioEngine.uncache(clip);
        }
    }

    uncacheAll() {
        cc.audioEngine.uncacheAll();
    }

    /**
     * 开关音效
     * @param enable 
     */
    enableEffect(enable: boolean) {
        this._enableEffect = enable;
        GameStore.instance.put(GameStore.instance.STORE_TYPE.VOICE, enable);
        /*
        if (!enable) {
            // if (this._enableMusic) {
            //     setTimeout(() => {
            //         this.stopAllEffects();
            //     }, 100);
            // } else {
            this.stopAllEffects();
            // }
        }
        */

        // 真机上连点开关音效，会导致游戏卡死、bgm从头开始播放，临时处理
        GameStore.instance.put(GameStore.instance.STORE_TYPE.EFFECTS_VOLUME, !!enable ? 1.0 : 0);
    }

    /**
     * 从本地数据初始化音效开关
     */
    initEnableEffect() {
        let flag = GameStore.instance.get(GameStore.instance.STORE_TYPE.VOICE);

        if (null === flag || 'undefined' === typeof flag) {
            GameStore.instance.put(GameStore.instance.STORE_TYPE.VOICE, true);
            flag = true;
        }
        this._enableEffect = flag;
    }

    /**
     * 获取音效开关状态
     */
    isEnableEffect() {
        return this._enableEffect;
    }

    /**
     * 开关音乐
     * @param enable 
     */
    enableMusic(enable: boolean) {
        this._enableMusic = enable;
        GameStore.instance.put(GameStore.instance.STORE_TYPE.MUSIC, enable);
        if (enable) {
            if (this._bgMusicFile.length > 0) {
                this.playMusic(this._bgMusicFile[this._bgMusicFile.length - 1], true);
            }
        } else {
            this.stopMusic();
        }
    }

    /**
     * 从本地数据初始化音乐开关
     */
    initEnableMusic() {
        let flag = GameStore.instance.get(GameStore.instance.STORE_TYPE.MUSIC);

        if (null === flag || 'undefined' === typeof flag) {
            GameStore.instance.put(GameStore.instance.STORE_TYPE.MUSIC, true);
            flag = true;
        }
        this._enableMusic = flag;
    }

    /**
     * 获取音乐开关状态
     */
    isEnableMusic() {
        return this._enableMusic;
    }

    enableVerb(enable) {
        this._enableVerb = enable;
        GameStore.instance.put(GameStore.instance.STORE_TYPE.VERB, enable);
    }

    /**
     * 从本地数据初始化动效开关
     */
    initEnableVerb() {
        let flag = GameStore.instance.get(GameStore.instance.STORE_TYPE.VERB);

        if (null === flag || 'undefined' === typeof flag) {
            GameStore.instance.put(GameStore.instance.STORE_TYPE.VERB, true);
            flag = true;
        }
        this._enableVerb = flag;
    }

    isEnableVerb() {
        return this._enableVerb;
    }
}

