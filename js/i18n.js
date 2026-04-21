const i18nData = {
    'ja': {
        common: {
            title: "Absolute Pitch Trainer",
            loading: "読み込み中...",
            audioInit: "🎹 ピアノサンプルを読み込み中...",
            audioFail: "音声の初期化に失敗しました",
            back: "← 戻る",
            octave: "Oct: {n}",
            userSwitch: "ユーザー切替",
            dlBtn: "📥",
            delBtn: "🗑"
        },
        welcome: {
            title: "ようこそ",
            desc: "絶対音感トレーニングを始めましょう。<br>まずはニックネームなどを入力してデータを識別できるようにします。",
            placeholder: "あなたの名前",
            startBtn: "始める",
            success: "ようこそ、{name}さん！",
            nameExists: "その名前は既に使用されています",
            addFail: "ユーザーの作成に失敗しました"
        },
        home: {
            subtitle: "耳を鍛え、世界を音で捉える。",
            level: "🎯 レベル",
            level1: "Level 1 — 1オクターブ (C4-B4) 白鍵のみ",
            level2: "Level 2 — 1オクターブ (C4-B4) 黒鍵含む",
            level3: "Level 3 — 2オクターブ (C3-B4) 白鍵のみ",
            level4: "Level 4 — 2オクターブ (C3-B4) 黒鍵含む",
            level5: "Level 5 — 4オクターブ (C2-B5) 白鍵のみ",
            level6: "Level 6 — 4オクターブ (C2-B5) 黒鍵含む",
            questions: "📝 問題数",
            qCount: "{n} 問",
            startBtn: "▶ トレーニング開始",
            historyBtn: "📊 学習履歴",
            settingsBtn: "⚙️ 設定",
            hintPiano: "🎵 下のピアノ鍵盤は自由に演奏できます",
            hintKeys: "キーボード: A S D F G H J（白鍵） / W E T Y U（黒鍵）"
        },
        training: {
            abort: "✕ 中断",
            score: "正解",
            streak: "🔥 連続",
            ready: "準備中...",
            replay: "🔊 もう一度聴く",
            listen: "🎧 聴いてください…",
            answer: "🎹 どの音ですか？",
            correctStreak: "🔥 {n}連続正解！ すばらしい！",
            correct: "✅ 正解！",
            wrong: "❌ 不正解… 正解は {target}",
            wrongDetailHigher: " ({n}半音高い)",
            wrongDetailLower: " ({n}半音低い)",
            wrongDetailHigher1: " (半音高い)",
            wrongDetailLower1: " (半音低い)"
        },
        result: {
            title: "トレーニング結果",
            aborted: "中断",
            perfect: "🏆 パーフェクト！",
            great: "🎉 すばらしい！",
            good: "👍 いい感じ！",
            fair: "💪 もう少し！",
            practice: "🎯 練習あるのみ！",
            accuracy: "正解率",
            maxStreak: "最大連続正解:",
            details: "詳細",
            qNum: "#{n}",
            target: "出題: {n}",
            selected: "回答: {n}",
            retryBtn: "▶ もう1セット",
            homeBtn: "🏠 ホームに戻る"
        },
        history: {
            title: "📊 学習履歴",
            totalSessions: "総セッション",
            totalQuestions: "総問題数",
            filterAllLevels: "全レベル",
            filterAllQuestions: "全出題数",
            overallAcc: "総合正解率",
            byLevel: "レベル別",
            untried: "未挑戦",
            times: "回",
            trend: "正解率の推移",
            noData: "データがまだありません",
            emptyRecord: "まだ記録がありません",
            sessionList: "セッション一覧",
            selectAll: "全選択",
            nSelected: "{n}件選択",
            dlBtnTitle: "選択したセッションをダウンロード",
            delBtnTitle: "選択したセッションを削除",
            clearBtnTitle: "全データの一括消去",
            clearBtn: "全消去",
            dlSuccess1: "1件をダウンロードしました",
            dlSuccessN: "{n}件ダウンロードしました",
            delSessionConfirm: "このセッションを削除しますか？",
            delSessionSuccess: "セッションを削除しました",
            delAllConfirm: "全ての学習履歴を削除しますか？",
            delAllSuccess: "履歴を削除しました",
            delMultiConfirm: "選択した {n} 件のセッションを削除しますか？",
            delMultiSuccess: "選択したセッションを削除しました",
            importBtnTitle: "学習履歴ファイルの取り込み (JSON)",
            importSuccess: "{n} 件の新しいセッションを取り込みました",
            importNoNew: "新しいセッションはありませんでした（すべて重複です）",
            importError: "ファイルの読み込みに失敗しました"
        },
        settings: {
            title: "⚙️ 設定",
            trainingGroup: "トレーニング設定",
            defLevel: "デフォルトレベル",
            defQuestions: "デフォルト問題数",
            showLabels: "鍵盤ラベル表示",
            langLabel: "言語 (Language)",
            userGroup: "👤 ユーザー管理",
            newUserPlaceholder: "新しいユーザー名",
            addBtn: "追加",
            inUse: "使用中",
            switchBtn: "切替",
            delBtnHover: "削除",
            switchSuccess: "{name} に切替えました",
            cantDelActive: "使用中のユーザーは削除できません",
            delUserConfirm: "{name} を削除しますか？\n学習履歴も全て削除されます。",
            delUserSuccess: "ユーザーを削除しました",
            addUserSuccess: "{name} を追加しました"
        },
        footer: {
            shortcutsHome: "Enter: 開始 | A-J: 白鍵演奏 | Z/X: オクターブ上下",
            shortcutsTraining: "Space/R: リプレイ | Esc: 中断 | A-J: 回答",
            shortcutsResult: "Enter: もう1セット | Esc: ホームに戻る",
            shortcutsBack: "Esc: 戻る",
            credit: "Audio engine: Tone.js | Piano samples: Salamander Grand Piano"
        }
    },
    'en': {
        common: {
            title: "Absolute Pitch Trainer",
            loading: "Loading...",
            audioInit: "🎹 Loading piano samples...",
            audioFail: "Failed to initialize audio.",
            back: "← Back",
            octave: "Oct: {n}",
            userSwitch: "Switch User",
            dlBtn: "📥",
            delBtn: "🗑"
        },
        welcome: {
            title: "Welcome",
            desc: "Let's start your absolute pitch training.<br>First, enter a nickname to identify your data.",
            placeholder: "Your nickname",
            startBtn: "Start",
            success: "Welcome, {name}!",
            nameExists: "That name is already in use.",
            addFail: "Failed to create user."
        },
        home: {
            subtitle: "Train your ears to capture the world in sounds.",
            level: "🎯 Level",
            level1: "Level 1 — 1 Oct. (C4-B4) White Keys",
            level2: "Level 2 — 1 Oct. (C4-B4) All Keys",
            level3: "Level 3 — 2 Oct. (C3-B4) White Keys",
            level4: "Level 4 — 2 Oct. (C3-B4) All Keys",
            level5: "Level 5 — 4 Oct. (C2-B5) White Keys",
            level6: "Level 6 — 4 Oct. (C2-B5) All Keys",
            questions: "📝 Questions",
            qCount: "{n} Qs",
            startBtn: "▶ Start Training",
            historyBtn: "📊 History",
            settingsBtn: "⚙️ Settings",
            hintPiano: "🎵 Play the piano keys freely below",
            hintKeys: "Keys: A S D F G H J (White) / W E T Y U (Black)"
        },
        training: {
            abort: "✕ Abort",
            score: "Correct",
            streak: "🔥 Streak",
            ready: "Get ready...",
            replay: "🔊 Replay Audio",
            listen: "🎧 Listen carefully...",
            answer: "🎹 Which note is it?",
            correctStreak: "🔥 {n} Streak! Awesome!",
            correct: "✅ Correct!",
            wrong: "❌ Wrong... It was {target}",
            wrongDetailHigher: " ({n} semitones higher)",
            wrongDetailLower: " ({n} semitones lower)",
            wrongDetailHigher1: " (1 semitone higher)",
            wrongDetailLower1: " (1 semitone lower)"
        },
        result: {
            title: "Training Result",
            aborted: "Aborted",
            perfect: "🏆 Perfect!",
            great: "🎉 Great!",
            good: "👍 Good!",
            fair: "💪 Almost!",
            practice: "🎯 Need practice!",
            accuracy: "Accuracy",
            maxStreak: "Max Streak:",
            details: "Details",
            qNum: "#{n}",
            target: "Target: {n}",
            selected: "Answer: {n}",
            retryBtn: "▶ One More Set",
            homeBtn: "🏠 Back to Home"
        },
        history: {
            title: "📊 Training History",
            totalSessions: "Total Sessions",
            totalQuestions: "Total Qs",
            filterAllLevels: "All Levels",
            filterAllQuestions: "All Qs",
            overallAcc: "Overall Accuracy",
            byLevel: "By Level",
            untried: "Untried",
            times: "times",
            trend: "Accuracy Trend",
            noData: "No data available",
            emptyRecord: "There are no records yet.",
            sessionList: "Sessions",
            selectAll: "Select All",
            nSelected: "{n} selected",
            dlBtnTitle: "Download selected sessions",
            delBtnTitle: "Delete selected sessions",
            clearBtnTitle: "Clear all data",
            clearBtn: "Clear All",
            dlSuccess1: "Downloaded 1 session.",
            dlSuccessN: "Downloaded {n} sessions.",
            delSessionConfirm: "Delete this session?",
            delSessionSuccess: "Session deleted.",
            delAllConfirm: "Delete ALL training history?",
            delAllSuccess: "History deleted.",
            delMultiConfirm: "Delete {n} selected sessions?",
            delMultiSuccess: "Selected sessions deleted.",
            importBtnTitle: "Import training history (JSON)",
            importSuccess: "Imported {n} new session(s).",
            importNoNew: "No new sessions found (all duplicates).",
            importError: "Failed to read the file."
        },
        settings: {
            title: "⚙️ Settings",
            trainingGroup: "Training Settings",
            defLevel: "Default Level",
            defQuestions: "Default Questions",
            showLabels: "Show Key Labels",
            langLabel: "Language",
            userGroup: "👤 User Management",
            newUserPlaceholder: "New username",
            addBtn: "Add",
            inUse: "Active",
            switchBtn: "Switch",
            delBtnHover: "Delete",
            switchSuccess: "Switched to {name}",
            cantDelActive: "Cannot delete the active user.",
            delUserConfirm: "Delete {name}?\nAll history will also be deleted permanently.",
            delUserSuccess: "User deleted.",
            addUserSuccess: "Added {name}"
        },
        footer: {
            shortcutsHome: "Enter: Start | A-J: Play White Keys | Z/X: Octave Up/Down",
            shortcutsTraining: "Space/R: Replay | Esc: Abort | A-J: Answer",
            shortcutsResult: "Enter: Retry | Esc: Home",
            shortcutsBack: "Esc: Back",
            credit: "Audio engine: Tone.js | Piano samples: Salamander Grand Piano"
        }
    },
    'zh-TW': {
        common: {
            title: "Absolute Pitch Trainer",
            loading: "載入中...",
            audioInit: "🎹 正在載入鋼琴音色...",
            audioFail: "音訊初始化失敗",
            back: "← 返回",
            octave: "Oct: {n}",
            userSwitch: "切換使用者",
            dlBtn: "📥",
            delBtn: "🗑"
        },
        welcome: {
            title: "歡迎使用",
            desc: "開始絕對音感訓練吧。<br>請先輸入您的暱稱以識別您的記錄。",
            placeholder: "你的暱稱",
            startBtn: "開始",
            success: "歡迎，{name}！",
            nameExists: "該名稱已被使用",
            addFail: "無法建立使用者"
        },
        home: {
            subtitle: "訓練你的耳朵，用聲音捕捉世界。",
            level: "🎯 等級",
            level1: "Level 1 — 1 個八度 (C4-B4) 僅白鍵",
            level2: "Level 2 — 1 個八度 (C4-B4) 含黑鍵",
            level3: "Level 3 — 2 個八度 (C3-B4) 僅白鍵",
            level4: "Level 4 — 2 個八度 (C3-B4) 含黑鍵",
            level5: "Level 5 — 4 個八度 (C2-B5) 僅白鍵",
            level6: "Level 6 — 4 個八度 (C2-B5) 含黑鍵",
            questions: "📝 題數",
            qCount: "{n} 題",
            startBtn: "▶ 開始訓練",
            historyBtn: "📊 學習紀錄",
            settingsBtn: "⚙️ 設定",
            hintPiano: "🎵 您可自由彈奏下方的鋼琴琴鍵",
            hintKeys: "鍵盤: A S D F G H J (白鍵) / W E T Y U (黑鍵)"
        },
        training: {
            abort: "✕ 中斷",
            score: "答對",
            streak: "🔥 連對",
            ready: "準備中...",
            replay: "🔊 再聽一次",
            listen: "🎧 請聽...",
            answer: "🎹 是哪個音？",
            correctStreak: "🔥 連續答對 {n} 題！太棒了！",
            correct: "✅ 答對了！",
            wrong: "❌ 答錯了... 正確答案是 {target}",
            wrongDetailHigher: " (高了 {n} 個半音)",
            wrongDetailLower: " (低了 {n} 個半音)",
            wrongDetailHigher1: " (高了 1 個半音)",
            wrongDetailLower1: " (低了 1 個半音)"
        },
        result: {
            title: "訓練結果",
            aborted: "已中斷",
            perfect: "🏆 完美！",
            great: "🎉 太棒了！",
            good: "👍 不錯喔！",
            fair: "💪 再接再厲！",
            practice: "🎯 還需多練習！",
            accuracy: "正確率",
            maxStreak: "最高連對:",
            details: "詳細紀錄",
            qNum: "#{n}",
            target: "考題: {n}",
            selected: "你的作答: {n}",
            retryBtn: "▶ 再測一次",
            homeBtn: "🏠 回到首頁"
        },
        history: {
            title: "📊 學習紀錄",
            totalSessions: "總次數",
            totalQuestions: "總題數",
            filterAllLevels: "所有等級",
            filterAllQuestions: "所有題數",
            overallAcc: "綜合正確率",
            byLevel: "各等級",
            untried: "未嘗試",
            times: "次",
            trend: "正確率變化走勢",
            noData: "暫無數據",
            emptyRecord: "目前還沒有紀錄",
            sessionList: "單次紀錄列表",
            selectAll: "全選",
            nSelected: "已選 {n} 筆",
            dlBtnTitle: "下載選取的紀錄",
            delBtnTitle: "刪除選取的紀錄",
            clearBtnTitle: "清除所有數據",
            clearBtn: "全部清除",
            dlSuccess1: "已下載 1 筆紀錄",
            dlSuccessN: "已下載 {n} 筆紀錄",
            delSessionConfirm: "確定要刪除這筆紀錄嗎？",
            delSessionSuccess: "已刪除該筆紀錄",
            delAllConfirm: "確定要清除所有的學習紀錄嗎？",
            delAllSuccess: "紀錄已清除",
            delMultiConfirm: "確定要刪除選取的 {n} 筆紀錄嗎？",
            delMultiSuccess: "已刪除選取的紀錄",
            importBtnTitle: "匯入學習紀錄檔案 (JSON)",
            importSuccess: "成功匯入了 {n} 筆新紀錄",
            importNoNew: "沒有發現新紀錄（皆為重複資料）",
            importError: "讀取檔案失敗"
        },
        settings: {
            title: "⚙️ 設定",
            trainingGroup: "訓練設定",
            defLevel: "預設等級",
            defQuestions: "預設題數",
            showLabels: "顯示琴鍵標籤",
            langLabel: "語言 (Language)",
            userGroup: "👤 使用者管理",
            newUserPlaceholder: "新使用者名稱",
            addBtn: "新增",
            inUse: "使用中",
            switchBtn: "切換",
            delBtnHover: "刪除",
            switchSuccess: "已切換至 {name}",
            cantDelActive: "無法刪除目前使用中的使用者",
            delUserConfirm: "確定要刪除 {name} 嗎？\n所有的學習紀錄也將被永久刪除。",
            delUserSuccess: "已刪除使用者",
            addUserSuccess: "已新增 {name}"
        },
        footer: {
            shortcutsHome: "Enter: 開始 | A-J: 彈奏白鍵 | Z/X: 切換八度",
            shortcutsTraining: "Space/R: 再聽一次 | Esc: 中斷 | A-J: 作答",
            shortcutsResult: "Enter: 再測一次 | Esc: 回到首頁",
            shortcutsBack: "Esc: 返回",
            credit: "Audio engine: Tone.js | Piano samples: Salamander Grand Piano"
        }
    }
};

const I18n = (() => {
    let currentLang = 'ja';

    function setLanguage(lang) {
        if (i18nData[lang]) {
            currentLang = lang;
        } else {
            // fallback
            currentLang = 'en';
        }
    }

    function getLanguage() {
        return currentLang;
    }

    /**
     * 文字列の取得
     * @param {string} path "category.key" の形式
     * @param {object} params 置換プレースホルダ { n: 10 }
     */
    function t(path, params = {}) {
        const parts = path.split('.');
        let val = i18nData[currentLang];
        for (const p of parts) {
            if (!val) break;
            val = val[p];
        }
        if (typeof val !== 'string') {
            return path; // 見つからなければパスをそのまま返す
        }
        // プレースホルダの置換
        for (const key in params) {
            val = val.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
        }
        return val;
    }

    /**
     * ブラウザ言語に基づく初期言語選択（ざっくり）
     */
    function detectBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        if (lang.startsWith('ja')) return 'ja';
        if (lang.startsWith('zh-TW') || lang.startsWith('zh-HK')) return 'zh-TW';
        return 'en';
    }

    return {
        setLanguage,
        getLanguage,
        t,
        detectBrowserLanguage,
        availableLangs: Object.keys(i18nData) // ['ja', 'en', 'zh-TW']
    };
})();
