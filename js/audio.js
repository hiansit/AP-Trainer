// ============================================================
// audio.js — 音声エンジン（Tone.js + Salamander Grand Piano）
// ============================================================

const AudioEngine = (() => {
    let piano = null;
    let isLoaded = false;
    let loadPromise = null;

    // Salamander Grand Piano サンプルマッピング
    // 全レンジからサンプリングして中間音は自動ピッチシフト補間
    const SAMPLE_MAP = {
        A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3", A1: "A1.mp3",
        C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", A2: "A2.mp3",
        C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", A3: "A3.mp3",
        C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3",
        C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", A5: "A5.mp3",
        C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3", A6: "A6.mp3",
        C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3", A7: "A7.mp3",
        C8: "C8.mp3"
    };

    const SAMPLE_BASE_URL = "https://tonejs.github.io/audio/salamander/";

    /**
     * 音声エンジンを初期化（ユーザー操作後に呼ぶ）
     * @returns {Promise<void>}
     */
    async function init() {
        if (loadPromise) return loadPromise;

        loadPromise = new Promise(async (resolve, reject) => {
            try {
                await Tone.start();

                piano = new Tone.Sampler({
                    urls: SAMPLE_MAP,
                    baseUrl: SAMPLE_BASE_URL,
                    release: 1.2,
                    onload: () => {
                        isLoaded = true;
                        console.log("[AudioEngine] Salamander Piano loaded");
                        resolve();
                    },
                    onerror: (err) => {
                        console.error("[AudioEngine] サンプル読み込みエラー:", err);
                        reject(err);
                    }
                }).toDestination();

                // 音量調整
                piano.volume.value = -6;

            } catch (e) {
                console.error("[AudioEngine] 初期化エラー:", e);
                reject(e);
            }
        });

        return loadPromise;
    }

    /**
     * ノートを再生
     * @param {string} note - 音名（例: "C4", "F#3"）
     * @param {string} duration - 長さ（例: "8n", "4n", "1n"）
     * @param {number} velocity - ベロシティ 0.0〜1.0
     */
    function playNote(note, duration = "4n", velocity = 0.7) {
        if (!isLoaded || !piano) return;
        piano.triggerAttackRelease(note, duration, undefined, velocity);
    }

    /**
     * ノートの発音開始（キー押下用）
     * @param {string} note
     * @param {number} velocity
     */
    function noteOn(note, velocity = 0.7) {
        if (!isLoaded || !piano) return;
        piano.triggerAttack(note, undefined, velocity);
    }

    /**
     * ノートの発音停止（キー離す用）
     * @param {string} note
     */
    function noteOff(note) {
        if (!isLoaded || !piano) return;
        piano.triggerRelease(note);
    }

    /**
     * ローディング状態を取得
     * @returns {boolean}
     */
    function getIsLoaded() {
        return isLoaded;
    }

    return {
        init,
        playNote,
        noteOn,
        noteOff,
        getIsLoaded
    };
})();
