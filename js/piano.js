// ============================================================
// piano.js — ピアノ鍵盤 UI
// ============================================================

const Piano = (() => {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    let container = null;
    let onNoteCallback = null;
    let showLabels = true;
    let currentRange = { start: 3, end: 5 };

    // 現在押下中のキー管理（ビジュアル用）
    const activeKeys = new Set();

    /**
     * レベルに応じた音域を返す
     */
    function getRangeForLevel(level) {
        // levelは1〜6。1,3,5は白鍵のみ。2,4,6は黒鍵含む（クロマチック）
        switch (Number(level)) {
            case 1: return { start: 4, end: 4, whiteOnly: true };   // 1オクターブ (C4-B4) 白鍵のみ
            case 2: return { start: 4, end: 4, whiteOnly: false };  // 1オクターブ (C4-B4) 黒鍵含む
            case 3: return { start: 3, end: 4, whiteOnly: true };   // 2オクターブ (C3-B4) 白鍵のみ
            case 4: return { start: 3, end: 4, whiteOnly: false };  // 2オクターブ (C3-B4) 黒鍵含む
            case 5: return { start: 2, end: 5, whiteOnly: true };   // 4オクターブ (C2-B5) 白鍵のみ
            case 6: return { start: 2, end: 5, whiteOnly: false };  // 4オクターブ (C2-B5) 黒鍵含む
            default: return { start: 4, end: 4, whiteOnly: false };
        }
    }

    /**
     * 初期化
     * @param {HTMLElement} containerEl — ピアノを描画するコンテナ
     * @param {Function} noteCallback — キーが押された時のコールバック (noteName, keyElement)
     */
    function init(containerEl, noteCallback) {
        container = containerEl;
        onNoteCallback = noteCallback;
    }

    /**
     * 鍵盤を描画
     * @param {number} level — レベル（1,2,3）
     */
    function render(level) {
        if (!container) return;
        container.innerHTML = '';

        currentRange = getRangeForLevel(level);
        const { start, end } = currentRange;

        const pianoEl = document.createElement('div');
        pianoEl.className = 'piano';
        pianoEl.setAttribute('role', 'group');
        pianoEl.setAttribute('aria-label', 'ピアノ鍵盤');

        for (let oct = start; oct <= end; oct++) {
            const octaveGroup = document.createElement('div');
            octaveGroup.className = 'octave-group';

            NOTES.forEach((note, idx) => {
                const noteName = `${note}${oct}`;
                const isBlack = note.includes('#');

                const key = document.createElement('div');
                key.className = `key ${isBlack ? 'black-key' : 'white-key'}`;
                key.dataset.note = noteName;
                key.setAttribute('role', 'button');
                key.setAttribute('aria-label', noteName);

                // ラベル（白鍵のみ）
                if (!isBlack && showLabels) {
                    const label = document.createElement('span');
                    label.className = 'key-label';
                    label.textContent = note + oct;
                    key.appendChild(label);
                }

                // マウス / タッチ操作
                key.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    handleKeyPress(noteName, key);
                });

                key.addEventListener('mouseup', () => handleKeyRelease(noteName, key));
                key.addEventListener('mouseleave', () => handleKeyRelease(noteName, key));

                // タッチ対応
                key.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    handleKeyPress(noteName, key);
                }, { passive: false });

                key.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    handleKeyRelease(noteName, key);
                });

                octaveGroup.appendChild(key);
            });

            pianoEl.appendChild(octaveGroup);
        }

        container.appendChild(pianoEl);
    }

    /**
     * キー押下処理
     */
    function handleKeyPress(noteName, keyElement) {
        if (activeKeys.has(noteName)) return;
        activeKeys.add(noteName);

        keyElement.classList.add('active');
        AudioEngine.noteOn(noteName, 0.7);

        if (onNoteCallback) {
            onNoteCallback(noteName, keyElement);
        }
    }

    /**
     * キー解放処理
     */
    function handleKeyRelease(noteName, keyElement) {
        if (!activeKeys.has(noteName)) return;
        activeKeys.delete(noteName);

        keyElement.classList.remove('active');
        AudioEngine.noteOff(noteName);
    }

    /**
     * 外部からキーを押す（キーボードマッピング用）
     */
    function triggerKey(noteName) {
        const keyEl = container?.querySelector(`[data-note="${noteName}"]`);
        if (keyEl) {
            handleKeyPress(noteName, keyEl);
        }
    }

    /**
     * 外部からキーを離す（キーボードマッピング用）
     */
    function releaseKey(noteName) {
        const keyEl = container?.querySelector(`[data-note="${noteName}"]`);
        if (keyEl) {
            handleKeyRelease(noteName, keyEl);
        }
    }

    /**
     * 正解/不正解のハイライト
     * @param {string} noteName
     * @param {string} type — 'correct' | 'wrong'
     * @param {number} duration — ハイライト時間（ms）
     */
    function highlightKey(noteName, type, duration = 2000) {
        const keyEl = container?.querySelector(`[data-note="${noteName}"]`);
        if (keyEl) {
            keyEl.classList.add(type);
            setTimeout(() => keyEl.classList.remove(type), duration);
        }
    }

    /**
     * 全ハイライトをクリア
     */
    function clearHighlights() {
        container?.querySelectorAll('.key').forEach(k => {
            k.classList.remove('correct', 'wrong');
        });
    }

    /**
     * ラベル表示の切替
     */
    function setShowLabels(show) {
        showLabels = show;
        container?.querySelectorAll('.key-label').forEach(label => {
            label.style.display = show ? '' : 'none';
        });
    }

    /**
     * 現在の音域に含まれる全ノート名を返す
     */
    function getAllNotes() {
        const notes = [];
        const { start, end } = currentRange;
        for (let oct = start; oct <= end; oct++) {
            NOTES.forEach(note => notes.push(`${note}${oct}`));
        }
        return notes;
    }

    /**
     * 現在の音域を返す
     */
    function getRange() {
        return { ...currentRange };
    }

    return {
        NOTES,
        WHITE_NOTES,
        init,
        render,
        triggerKey,
        releaseKey,
        highlightKey,
        clearHighlights,
        setShowLabels,
        getAllNotes,
        getRange,
        getRangeForLevel
    };
})();
