// ============================================================
// training.js — トレーニングロジック（セッション管理）
// ============================================================

const Training = (() => {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    let state = {
        active: false,
        level: 1,
        questionsPerSet: 10,
        currentQuestion: 0,
        score: 0,
        targetNote: null,
        inputEnabled: false,
        details: [], // 各問題の詳細記録
        streak: 0,   // 連続正解数
        maxStreak: 0
    };

    let callbacks = {
        onQuestionStart: null,   // (questionNum, total) => {}
        onCorrect: null,         // (noteName, streak) => {}
        onWrong: null,           // (selectedNote, targetNote, semitones) => {}
        onSetComplete: null,     // (result) => {}
        onStateChange: null      // (state) => {}
    };

    /**
     * コールバックを設定
     */
    function setCallbacks(cbs) {
        Object.assign(callbacks, cbs);
    }

    /**
     * トレーニングセッションを開始
     * @param {number} level — レベル (1, 2, 3)
     * @param {number} questionsPerSet — 1セットの問題数
     */
    function start(level, questionsPerSet = 10) {
        state = {
            active: true,
            level,
            questionsPerSet,
            currentQuestion: 0,
            score: 0,
            targetNote: null,
            inputEnabled: false,
            details: [],
            streak: 0,
            maxStreak: 0
        };

        if (callbacks.onStateChange) callbacks.onStateChange(getState());
        nextQuestion();
    }

    /**
     * 次の問題へ
     */
    function nextQuestion() {
        if (!state.active) return;

        if (state.currentQuestion >= state.questionsPerSet) {
            completeSet();
            return;
        }

        state.currentQuestion++;
        state.inputEnabled = false;

        // ランダムな音を生成
        const range = Piano.getRangeForLevel(state.level);
        const octave = Math.floor(Math.random() * (range.end - range.start + 1)) + range.start;
        const noteIndex = Math.floor(Math.random() * NOTES.length);
        state.targetNote = `${NOTES[noteIndex]}${octave}`;

        if (callbacks.onQuestionStart) {
            callbacks.onQuestionStart(state.currentQuestion, state.questionsPerSet);
        }

        // 音を再生してから入力を有効にする
        setTimeout(() => {
            AudioEngine.playNote(state.targetNote, "2n", 0.8);
            setTimeout(() => {
                state.inputEnabled = true;
                if (callbacks.onStateChange) callbacks.onStateChange(getState());
            }, 800);
        }, 400);
    }

    /**
     * 出題音を再度再生
     */
    function replayNote() {
        if (!state.active || !state.targetNote) return;
        AudioEngine.playNote(state.targetNote, "2n", 0.8);
    }

    /**
     * 回答を受け付ける
     * @param {string} selectedNote — ユーザーが選んだ音名
     * @returns {Object|null} — 結果 { correct, semitones } or null（無効な場合）
     */
    function submitAnswer(selectedNote) {
        if (!state.active || !state.inputEnabled || !state.targetNote) return null;

        state.inputEnabled = false;

        const targetMidi = Tone.Frequency(state.targetNote).toMidi();
        const selectedMidi = Tone.Frequency(selectedNote).toMidi();
        const semitones = selectedMidi - targetMidi;
        const correct = semitones === 0;

        // 結果記録
        const detail = {
            question: state.currentQuestion,
            target: state.targetNote,
            selected: selectedNote,
            correct,
            semitones
        };
        state.details.push(detail);

        if (correct) {
            state.score++;
            state.streak++;
            if (state.streak > state.maxStreak) {
                state.maxStreak = state.streak;
            }
            if (callbacks.onCorrect) callbacks.onCorrect(selectedNote, state.streak);
        } else {
            state.streak = 0;
            if (callbacks.onWrong) callbacks.onWrong(selectedNote, state.targetNote, semitones);
        }

        if (callbacks.onStateChange) callbacks.onStateChange(getState());

        return { correct, semitones };
    }

    /**
     * セット完了時の処理
     */
    function completeSet() {
        state.active = false;
        state.inputEnabled = false;

        const result = {
            level: state.level,
            score: state.score,
            total: state.questionsPerSet,
            accuracy: Math.round((state.score / state.questionsPerSet) * 100),
            maxStreak: state.maxStreak,
            details: [...state.details]
        };

        if (callbacks.onSetComplete) callbacks.onSetComplete(result);
        if (callbacks.onStateChange) callbacks.onStateChange(getState());
    }

    /**
     * トレーニングを中断
     * @returns {Object} — 中断時点の結果
     */
    function abort() {
        if (!state.active) return null;

        state.active = false;
        state.inputEnabled = false;

        const answeredQuestions = state.details.length;
        const result = {
            level: state.level,
            score: state.score,
            total: answeredQuestions,
            accuracy: answeredQuestions > 0
                ? Math.round((state.score / answeredQuestions) * 100)
                : 0,
            maxStreak: state.maxStreak,
            details: [...state.details],
            aborted: true
        };

        if (callbacks.onStateChange) callbacks.onStateChange(getState());

        return result;
    }

    /**
     * 現在の状態を返す（読み取り専用コピー）
     */
    function getState() {
        return {
            active: state.active,
            level: state.level,
            currentQuestion: state.currentQuestion,
            questionsPerSet: state.questionsPerSet,
            score: state.score,
            streak: state.streak,
            maxStreak: state.maxStreak,
            inputEnabled: state.inputEnabled,
            targetNote: state.targetNote
        };
    }

    /**
     * アクティブ状態を返す
     */
    function isActive() {
        return state.active;
    }

    return {
        setCallbacks,
        start,
        nextQuestion,
        replayNote,
        submitAnswer,
        abort,
        getState,
        isActive
    };
})();
