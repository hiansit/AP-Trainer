// ============================================================
// keyboard.js — PCキーボード → ピアノ鍵盤 マッピング
// ============================================================

const Keyboard = (() => {
    let enabled = true;
    let currentOctave = 4; // 基準オクターブ
    const pressedKeys = new Set();

    // QWERTYキーボードの配列をピアノ鍵盤にマッピング
    // 下段（白鍵）: A S D F G H J K L ; '
    // 上段（黒鍵）: W E   T Y U   O P
    // 上のオクターブ: Z X C V B N M , . /
    const KEY_MAP_LOWER = {
        'a': 'C',
        'w': 'C#',
        's': 'D',
        'e': 'D#',
        'd': 'E',
        'f': 'F',
        't': 'F#',
        'g': 'G',
        'y': 'G#',
        'h': 'A',
        'u': 'A#',
        'j': 'B',
    };

    // 上のオクターブ用
    const KEY_MAP_UPPER = {
        'k': 'C',
        'o': 'C#',
        'l': 'D',
        'p': 'D#',
        ';': 'E',
    };

    /**
     * 初期化 — キーボードイベントをバインド
     */
    function init() {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }

    /**
     * キーダウン処理
     */
    function handleKeyDown(e) {
        // テキスト入力中は無視
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        const key = e.key.toLowerCase();

        // 既に押されている場合はスキップ（リピート防止）
        if (pressedKeys.has(key)) return;

        // ショートカットキー処理（App側でハンドル）
        if (['enter', ' ', 'escape', '1', '2', '3', 'r'].includes(key)) {
            // app.js のイベントハンドラに委譲（伝播を止めない）
            return;
        }

        // オクターブ上下
        if (key === 'z') {
            changeOctave(-1);
            e.preventDefault();
            return;
        }
        if (key === 'x') {
            changeOctave(1);
            e.preventDefault();
            return;
        }

        // ピアノキー判定
        let noteName = null;

        if (KEY_MAP_LOWER[key]) {
            noteName = KEY_MAP_LOWER[key] + currentOctave;
        } else if (KEY_MAP_UPPER[key]) {
            noteName = KEY_MAP_UPPER[key] + (currentOctave + 1);
        }

        if (noteName && enabled) {
            e.preventDefault();
            pressedKeys.add(key);
            Piano.triggerKey(noteName);
        }
    }

    /**
     * キーアップ処理
     */
    function handleKeyUp(e) {
        const key = e.key.toLowerCase();

        if (!pressedKeys.has(key)) return;
        pressedKeys.delete(key);

        let noteName = null;

        if (KEY_MAP_LOWER[key]) {
            noteName = KEY_MAP_LOWER[key] + currentOctave;
        } else if (KEY_MAP_UPPER[key]) {
            noteName = KEY_MAP_UPPER[key] + (currentOctave + 1);
        }

        if (noteName) {
            Piano.releaseKey(noteName);
        }
    }

    /**
     * オクターブの変更
     */
    function changeOctave(delta) {
        const newOctave = currentOctave + delta;
        if (newOctave >= 1 && newOctave <= 6) {
            // 全ての音を離す
            pressedKeys.forEach(key => {
                let noteName = null;
                if (KEY_MAP_LOWER[key]) {
                    noteName = KEY_MAP_LOWER[key] + currentOctave;
                } else if (KEY_MAP_UPPER[key]) {
                    noteName = KEY_MAP_UPPER[key] + (currentOctave + 1);
                }
                if (noteName) Piano.releaseKey(noteName);
            });
            pressedKeys.clear();

            currentOctave = newOctave;

            // オクターブ変更イベントを発火
            document.dispatchEvent(new CustomEvent('octaveChange', { detail: { octave: currentOctave } }));
        }
    }

    /**
     * キーボードの有効/無効切り替え
     */
    function setEnabled(state) {
        enabled = state;
        if (!state) {
            // 全キーを離す
            pressedKeys.forEach(key => {
                let noteName = null;
                if (KEY_MAP_LOWER[key]) {
                    noteName = KEY_MAP_LOWER[key] + currentOctave;
                } else if (KEY_MAP_UPPER[key]) {
                    noteName = KEY_MAP_UPPER[key] + (currentOctave + 1);
                }
                if (noteName) Piano.releaseKey(noteName);
            });
            pressedKeys.clear();
        }
    }

    /**
     * 現在のオクターブを返す
     */
    function getOctave() {
        return currentOctave;
    }

    /**
     * オクターブを設定
     */
    function setOctave(oct) {
        if (oct >= 1 && oct <= 6) currentOctave = oct;
    }

    /**
     * キーマップのガイド文字列を返す
     */
    function getKeyGuide() {
        return {
            whiteKeys: 'A S D F G H J → C D E F G A B',
            blackKeys: 'W E   T Y U   → C# D# F# G# A#',
            upperOctave: 'K L ;  (O P) → C\' D\' E\' (C#\' D#\')',
            octaveDown: 'Z → オクターブ下',
            octaveUp: 'X → オクターブ上'
        };
    }

    return {
        init,
        setEnabled,
        getOctave,
        setOctave,
        getKeyGuide
    };
})();
