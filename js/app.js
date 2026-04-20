// ============================================================
// app.js — アプリケーション本体（画面管理・イベント統合）
// ============================================================

const App = (() => {
    // 画面定義
    const SCREENS = ['welcome', 'home', 'training', 'result', 'history', 'settings'];

    // アプリ状態
    let currentScreen = 'welcome';
    let currentUser = null;
    let appSettings = null;
    let audioInitialized = false;
    let selectedHistoryIds = new Set();

    // DOM要素キャッシュ
    const $ = (id) => document.getElementById(id);

    // ==================== 初期化 と i18n ====================

    /**
     * DOM内の data-i18n 属性を走査し、翻訳を適用する
     */
    function updateDOMTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const paramStr = el.getAttribute('data-i18n-params');
            let params = {};
            if (paramStr) {
                try { params = JSON.parse(paramStr); } catch (e) {}
            }
            el.innerHTML = I18n.t(key, params);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = I18n.t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = I18n.t(key);
        });

        // 翻訳後にフッターなどの動的テキストも再更新する
        updateFooterHints();
        updateOctaveDisplay(Keyboard.getOctave());
    }

    async function changeLanguage(lang) {
        I18n.setLanguage(lang);
        
        // セレクトボックスの同期
        const welSel = $('welcome-lang');
        const setSel = $('settings-lang');
        if (welSel) welSel.value = lang;
        if (setSel) setSel.value = lang;

        updateDOMTranslations();

        if (currentUser && appSettings) {
            appSettings.language = lang;
            await DB.saveSettings(appSettings);
        }
    }

    async function init() {
        // I18nの初期設定（DBがない場合のフォールバック）
        const browserLang = I18n.detectBrowserLanguage();
        I18n.setLanguage(browserLang);
        if ($('welcome-lang')) $('welcome-lang').value = browserLang;
        updateDOMTranslations();

        // DB初期化
        await DB.open();

        // ピアノ初期化
        Piano.init($('piano-container'), handlePianoNote);

        // キーボード初期化
        Keyboard.init();

        // ショートカットキーの設定
        setupGlobalKeys();

        // オクターブ変更イベント
        document.addEventListener('octaveChange', (e) => {
            updateOctaveDisplay(e.detail.octave);
        });

        // ユーザー一覧を確認
        const users = await DB.getAllUsers();
        if (users.length === 0) {
            showScreen('welcome');
        } else {
            // 最後にアクティブだったユーザーを選択
            const lastUser = users.sort((a, b) => b.lastActive - a.lastActive)[0];
            await selectUser(lastUser.id);
            showScreen('home');
        }

        // ローディング非表示
        $('loading-screen')?.classList.add('hidden');
    }

    // ==================== 音声初期化 ====================

    async function ensureAudio() {
        if (audioInitialized) return;
        $('loading-overlay')?.classList.remove('hidden');
        $('loading-text').textContent = I18n.t('common.audioInit');
        try {
            await AudioEngine.init();
            audioInitialized = true;
        } catch (e) {
            console.error('音声初期化失敗:', e);
            showToast(I18n.t('common.audioFail'), 'error');
        }
        $('loading-overlay')?.classList.add('hidden');
    }

    // ==================== 画面管理 ====================

    function showScreen(screenName) {
        SCREENS.forEach(name => {
            const el = $(`screen-${name}`);
            if (el) {
                el.classList.toggle('active', name === screenName);
            }
        });
        currentScreen = screenName;

        // ピアノ表示制御
        const pianoWrapper = $('piano-section');
        if (pianoWrapper) {
            pianoWrapper.classList.toggle('hidden', !['home', 'training'].includes(screenName));
        }

        // 画面固有の初期化
        switch (screenName) {
            case 'home':
                initHomeScreen();
                break;
            case 'history':
                initHistoryScreen();
                break;
            case 'settings':
                initSettingsScreen();
                break;
        }

        // フッターのショートカット表示を更新
        updateFooterHints();
    }

    // ==================== ウェルカム画面 ====================

    function setupWelcome() {
        const form = $('welcome-form');
        const input = $('welcome-name-input');
        const langSelect = $('welcome-lang');

        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                changeLanguage(e.target.value);
            });
        }

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = input.value.trim();
            if (!name) return;

            try {
                const userId = await DB.createUser(name);
                await selectUser(userId);
                showScreen('home');
                showToast(I18n.t('welcome.success', { name }), 'success');
            } catch (err) {
                if (err.name === 'ConstraintError') {
                    showToast(I18n.t('welcome.nameExists'), 'error');
                } else {
                    showToast(I18n.t('welcome.addFail'), 'error');
                }
            }
        });
    }

    // ==================== ホーム画面 ====================

    function initHomeScreen() {
        const level = appSettings?.preferredLevel || 1;
        $('home-level-select').value = level;
        Piano.render(level);
        updateOctaveDisplay(Keyboard.getOctave());
    }

    function setupHome() {
        // レベル選択
        $('home-level-select')?.addEventListener('change', (e) => {
            const level = parseInt(e.target.value);
            Piano.render(level);
            if (appSettings) {
                appSettings.preferredLevel = level;
                DB.saveSettings(appSettings);
            }
        });

        // 問題数選択
        $('home-questions-select')?.addEventListener('change', (e) => {
            if (appSettings) {
                appSettings.questionsPerSet = parseInt(e.target.value);
                DB.saveSettings(appSettings);
            }
        });

        // トレーニング開始ボタン
        $('btn-start-training')?.addEventListener('click', startTraining);

        // 履歴ボタン
        $('btn-history')?.addEventListener('click', () => showScreen('history'));

        // 設定ボタン
        $('btn-settings')?.addEventListener('click', () => showScreen('settings'));

        // ユーザー切替ボタン
        $('btn-user-switch')?.addEventListener('click', toggleUserMenu);
    }

    // ==================== トレーニング画面 ====================

    async function startTraining() {
        await ensureAudio();
        if (!audioInitialized) return;

        const level = parseInt($('home-level-select').value);
        const questions = appSettings?.questionsPerSet || 10;

        Piano.render(level);
        showScreen('training');

        // 進捗表示初期化
        updateTrainingUI(0, questions, 0, 0);

        // トレーニング開始
        Training.setCallbacks({
            onQuestionStart: (num, total) => {
                $('training-message').textContent = I18n.t('training.listen');
                $('training-message').className = 'training-message listening';
                updateTrainingProgress(num, total);
                setTimeout(() => {
                    $('training-message').textContent = I18n.t('training.answer');
                    $('training-message').className = 'training-message answering';
                }, 1200);
            },
            onCorrect: (note, streak) => {
                Piano.highlightKey(note, 'correct', 1200);
                $('training-message').textContent = streak >= 3
                    ? I18n.t('training.correctStreak', { n: streak })
                    : I18n.t('training.correct');
                $('training-message').className = 'training-message correct';
                updateTrainingScore();
                setTimeout(() => Training.nextQuestion(), 1300);
            },
            onWrong: (selected, target, semitones) => {
                Piano.highlightKey(selected, 'wrong', 2000);
                Piano.highlightKey(target, 'correct', 2000);

                const abs = Math.abs(semitones);
                let msg = I18n.t('training.wrong', { target });
                if (semitones > 0) {
                    msg += abs === 1 ? I18n.t('training.wrongDetailHigher1') : I18n.t('training.wrongDetailHigher', { n: abs });
                } else {
                    msg += abs === 1 ? I18n.t('training.wrongDetailLower1') : I18n.t('training.wrongDetailLower', { n: abs });
                }

                $('training-message').textContent = msg;
                $('training-message').className = 'training-message wrong';
                updateTrainingScore();
                setTimeout(() => Training.nextQuestion(), 2500);
            },
            onSetComplete: (result) => {
                showResult(result);
            },
            onStateChange: () => {}
        });

        Training.start(level, questions);
    }

    function updateTrainingUI(current, total, score, streak) {
        $('training-current').textContent = current;
        $('training-total').textContent = total;
        $('training-score').textContent = score;
        $('training-streak').textContent = streak;
    }

    function updateTrainingProgress(current, total) {
        $('training-current').textContent = current;
        $('training-total').textContent = total;

        // プログレスバー更新
        const pct = ((current - 1) / total) * 100;
        $('training-progress-fill').style.width = `${pct}%`;
    }

    function updateTrainingScore() {
        const st = Training.getState();
        $('training-score').textContent = st.score;
        $('training-streak').textContent = st.streak;

        // ストリークが3以上ならアニメーション
        const streakEl = $('training-streak-container');
        if (st.streak >= 3) {
            streakEl?.classList.add('on-fire');
        } else {
            streakEl?.classList.remove('on-fire');
        }
    }

    function setupTraining() {
        // 中断ボタン
        $('btn-abort-training')?.addEventListener('click', abortTraining);

        // リプレイボタン
        $('btn-replay')?.addEventListener('click', () => {
            Training.replayNote();
        });
    }

    function abortTraining() {
        const result = Training.abort();
        if (result && result.total > 0) {
            showResult(result);
        } else {
            showScreen('home');
        }
    }

    // ==================== 結果画面 ====================

    async function showResult(result) {
        showScreen('result');

        // スコア表示
        $('result-score').textContent = `${result.score} / ${result.total}`;
        $('result-accuracy').textContent = `${result.accuracy}%`;

        // 評価メッセージ
        let gradeKey = '';
        let gradeClass = '';
        if (result.accuracy === 100) { gradeKey = 'result.perfect'; gradeClass = 'perfect'; }
        else if (result.accuracy >= 80) { gradeKey = 'result.great'; gradeClass = 'great'; }
        else if (result.accuracy >= 60) { gradeKey = 'result.good'; gradeClass = 'good'; }
        else if (result.accuracy >= 40) { gradeKey = 'result.fair'; gradeClass = 'fair'; }
        else { gradeKey = 'result.practice'; gradeClass = 'practice'; }

        $('result-grade').textContent = I18n.t(gradeKey);
        $('result-grade').className = `result-grade ${gradeClass}`;

        // ストリーク
        $('result-max-streak').textContent = result.maxStreak;

        // 中断表示
        if (result.aborted) {
            $('result-aborted-badge')?.classList.remove('hidden');
        } else {
            $('result-aborted-badge')?.classList.add('hidden');
        }

        // レベル表示
        $('result-level').textContent = `Level ${result.level}`;

        // 詳細リスト描画
        renderResultDetails(result.details);

        // DB に保存
        if (currentUser) {
            await DB.saveSession({
                userId: currentUser.id,
                level: result.level,
                score: result.score,
                total: result.total,
                accuracy: result.accuracy,
                maxStreak: result.maxStreak,
                details: result.details,
                aborted: !!result.aborted
            });
        }
    }

    function renderResultDetails(details) {
        const list = $('result-details-list');
        if (!list) return;
        list.innerHTML = '';

        details.forEach((d, i) => {
            const item = document.createElement('div');
            item.className = `result-detail-item ${d.correct ? 'correct' : 'wrong'}`;
            item.innerHTML = `
                <span class="detail-num">#${i + 1}</span>
                <span class="detail-icon">${d.correct ? '✅' : '❌'}</span>
                <span class="detail-target">${I18n.t('result.target', { n: d.target })}</span>
                ${!d.correct ? `<span class="detail-selected">${I18n.t('result.selected', { n: d.selected })}</span>` : ''}
            `;
            list.appendChild(item);
        });
    }

    function setupResult() {
        $('btn-retry')?.addEventListener('click', () => {
            startTraining();
        });

        $('btn-back-home')?.addEventListener('click', () => {
            showScreen('home');
        });
    }

    // ==================== 履歴画面 ====================

    async function initHistoryScreen() {
        if (!currentUser) return;
        
        selectedHistoryIds.clear();

        const stats = await DB.getUserStats(currentUser.id);
        const sessions = await DB.getSessionsByUser(currentUser.id, 9999);

        updateHistoryActionUI(sessions.length);

        // 統計サマリー
        $('stats-total-sessions').textContent = stats.totalSessions;
        $('stats-total-questions').textContent = stats.totalQuestions;
        $('stats-overall-accuracy').textContent = `${stats.overallAccuracy}%`;

        // レベル別統計
        const byLevelEl = $('stats-by-level');
        if (byLevelEl) {
            byLevelEl.innerHTML = '';
            [1, 2, 3].forEach(lv => {
                const data = stats.byLevel[lv];
                const card = document.createElement('div');
                card.className = 'level-stat-card glass-panel';
                const accuracyTxt = data ? data.accuracy + '%' : '—';
                const sessionsTxt = data ? data.sessions + I18n.t('history.times') : I18n.t('history.untried');
                card.innerHTML = `
                    <div class="level-stat-label">Level ${lv}</div>
                    <div class="level-stat-value">${accuracyTxt}</div>
                    <div class="level-stat-sub">${sessionsTxt}</div>
                `;
                byLevelEl.appendChild(card);
            });
        }

        // 推移グラフ描画
        renderTrendChart(stats.recentTrend);

        // セッション一覧
        const listEl = $('history-session-list');
        if (listEl) {
            listEl.innerHTML = '';
            if (sessions.length === 0) {
                listEl.innerHTML = `<p class="empty-message">${I18n.t('history.emptyRecord')}</p>`;
            } else {
                sessions.forEach(s => {
                    const date = new Date(s.timestamp);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                    const row = document.createElement('div');
                    row.className = 'history-row';
                    
                    const abortedBadge = s.aborted ? `<span class="history-badge aborted">${I18n.t('result.aborted')}</span>` : '';
                    
                    row.innerHTML = `
                        <label class="history-row-checkbox">
                            <input type="checkbox" value="${s.id}">
                        </label>
                        <div class="history-row-content">
                            <span class="history-date">${dateStr}</span>
                            <span class="history-level">Lv.${s.level}</span>
                            <span class="history-score">${s.score}/${s.total}</span>
                            <span class="history-accuracy ${s.accuracy >= 80 ? 'high' : s.accuracy >= 50 ? 'mid' : 'low'}">${s.accuracy}%</span>
                            ${abortedBadge}
                        </div>
                        <div class="history-row-actions">
                            <button class="icon-btn-small btn-dl-single" title="${I18n.t('history.dlBtnTitle')}">📥</button>
                            <button class="icon-btn-small danger btn-del-single" title="${I18n.t('history.delBtnTitle')}">🗑</button>
                        </div>
                    `;
                    listEl.appendChild(row);

                    // 個別イベント
                    const cb = row.querySelector('input[type="checkbox"]');
                    cb.addEventListener('change', (e) => {
                        if (e.target.checked) selectedHistoryIds.add(s.id);
                        else selectedHistoryIds.delete(s.id);
                        updateHistoryActionUI(sessions.length);
                    });

                    row.querySelector('.btn-dl-single').addEventListener('click', () => {
                        exportSessionsToJson([s]);
                        showToast(I18n.t('history.dlSuccess1'), 'success');
                    });

                    row.querySelector('.btn-del-single').addEventListener('click', async () => {
                        if (confirm(I18n.t('history.delSessionConfirm'))) {
                            await DB.deleteSession(s.id);
                            showToast(I18n.t('history.delSessionSuccess'), 'success');
                            initHistoryScreen();
                        }
                    });
                });
            }
        }
        
        const selectAllCb = $('history-select-all');
        if(selectAllCb) selectAllCb.checked = false;
    }

    /**
     * 正解率推移グラフをCanvas描画
     */
    function renderTrendChart(data) {
        const canvas = $('trend-chart');
        if (!canvas || data.length === 0) {
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = '14px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(I18n.t('history.noData'), canvas.width / 2, canvas.height / 2);
            }
            return;
        }

        const ctx = canvas.getContext('2d');
        const W = canvas.width = canvas.parentElement.clientWidth || 600;
        const H = canvas.height = 230; // 高さを確保
        const pad = { top: 20, right: 20, bottom: 45, left: 40 }; // 下部パディング拡大
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        // グリッド線
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        [0, 25, 50, 75, 100].forEach(v => {
            const y = pad.top + plotH - (v / 100) * plotH;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '11px Outfit, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(v + '%', pad.left - 6, y + 4);
        });

        // データポイント接続
        const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW / 2;

        // グラデーション塗りつぶし
        const gradient = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
        gradient.addColorStop(0, 'rgba(0, 210, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 210, 255, 0.02)');

        // 塗り
        ctx.beginPath();
        data.forEach((d, i) => {
            const x = pad.left + i * stepX;
            const y = pad.top + plotH - (d.accuracy / 100) * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineTo(pad.left + (data.length - 1) * stepX, H - pad.bottom);
        ctx.lineTo(pad.left, H - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // 線
        ctx.beginPath();
        data.forEach((d, i) => {
            const x = pad.left + i * stepX;
            const y = pad.top + plotH - (d.accuracy / 100) * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#00d2ff';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // ドットと日付ラベル
        data.forEach((d, i) => {
            const x = pad.left + i * stepX;
            const y = pad.top + plotH - (d.accuracy / 100) * plotH;

            // 丸
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#00d2ff';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // X軸日付ラベル（斜め）
            const date = new Date(d.timestamp);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            
            ctx.save();
            ctx.translate(x, Math.floor(H - pad.bottom + 14));
            ctx.rotate(-Math.PI / 4.5);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '10px Roboto, sans-serif';
            ctx.fillText(dateStr, 0, 0);
            ctx.restore();
        });
    }

    function setupHistory() {
        $('btn-history-back')?.addEventListener('click', () => showScreen('home'));

        $('btn-clear-history')?.addEventListener('click', async () => {
            if (!currentUser) return;
            if (!confirm(I18n.t('history.delAllConfirm'))) return;
            await DB.deleteSessionsByUser(currentUser.id);
            showToast(I18n.t('history.delAllSuccess'), 'success');
            initHistoryScreen();
        });

        $('history-select-all')?.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const checkboxes = document.querySelectorAll('#history-session-list input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = isChecked;
                const id = parseInt(cb.value);
                if (isChecked) selectedHistoryIds.add(id);
                else selectedHistoryIds.delete(id);
            });
            updateHistoryActionUI(checkboxes.length);
        });

        $('btn-download-selected')?.addEventListener('click', async () => {
            if (selectedHistoryIds.size === 0) return;
            const ids = Array.from(selectedHistoryIds);
            const sessions = await DB.getSessionsByUser(currentUser.id, 9999);
            const targets = sessions.filter(s => ids.includes(s.id));
            exportSessionsToJson(targets);
            showToast(I18n.t('history.dlSuccessN', { n: targets.length }), 'success');
        });

        $('btn-delete-selected')?.addEventListener('click', async () => {
            if (selectedHistoryIds.size === 0) return;
            if (!confirm(I18n.t('history.delMultiConfirm', { n: selectedHistoryIds.size }))) return;
            await DB.deleteSessions(Array.from(selectedHistoryIds));
            showToast(I18n.t('history.delMultiSuccess'), 'success');
            initHistoryScreen();
        });
    }

    // UI状態更新とJSONエクスポートのヘルパー
    function updateHistoryActionUI(totalCount = 0) {
        const countSpan = $('history-selection-count');
        const count = selectedHistoryIds.size;
        
        if (count > 0) {
            if (countSpan) {
                countSpan.textContent = I18n.t('history.nSelected', { n: count });
                countSpan.classList.remove('hidden');
            }
            $('btn-download-selected').disabled = false;
            $('btn-delete-selected').disabled = false;
        } else {
            if (countSpan) countSpan.classList.add('hidden');
            $('btn-download-selected').disabled = true;
            $('btn-delete-selected').disabled = true;
        }

        const selectAllCb = $('history-select-all');
        if (selectAllCb) {
            selectAllCb.checked = (count > 0 && count === totalCount);
        }
    }

    function exportSessionsToJson(sessions) {
        if (!sessions || sessions.length === 0) return;
        const dataStr = JSON.stringify(sessions, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const d = new Date();
        const df = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
        a.download = `absolute-pitch-history-${df}.json`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // ==================== 設定画面 ====================

    function initSettingsScreen() {
        if (!appSettings) return;

        $('settings-level').value = appSettings.preferredLevel || 1;
        $('settings-questions').value = appSettings.questionsPerSet || 10;
        $('settings-labels').checked = appSettings.showKeyLabels !== false;
        
        if ($('settings-lang')) $('settings-lang').value = I18n.getLanguage();

        // ユーザー一覧を読み込む
        loadUserList();
    }

    async function loadUserList() {
        const users = await DB.getAllUsers();
        const listEl = $('user-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        users.forEach(user => {
            const item = document.createElement('div');
            item.className = `user-item ${currentUser && currentUser.id === user.id ? 'active' : ''}`;
            const badge = currentUser && currentUser.id === user.id ? `<span class="user-badge">${I18n.t('settings.inUse')}</span>` : '';
            const btnDisable = currentUser && currentUser.id === user.id ? 'disabled' : '';
            
            item.innerHTML = `
                <span class="user-icon">👤</span>
                <span class="user-name">${user.name}</span>
                ${badge}
                <button class="user-switch-btn" data-user-id="${user.id}" ${btnDisable}>${I18n.t('settings.switchBtn')}</button>
                <button class="user-delete-btn" data-user-id="${user.id}" title="${I18n.t('settings.delBtnHover')}">✕</button>
            `;
            listEl.appendChild(item);
        });

        // 切替・削除イベント
        listEl.querySelectorAll('.user-switch-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = parseInt(btn.dataset.userId);
                await selectUser(userId);
                initSettingsScreen();
                showToast(I18n.t('settings.switchSuccess', { name: currentUser.name }), 'success');
            });
        });

        listEl.querySelectorAll('.user-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = parseInt(btn.dataset.userId);
                if (currentUser && currentUser.id === userId) {
                    showToast(I18n.t('settings.cantDelActive'), 'error');
                    return;
                }
                const user = await DB.getUser(userId);
                if (!confirm(I18n.t('settings.delUserConfirm', { name: user.name }))) return;
                await DB.deleteUser(userId);
                showToast(I18n.t('settings.delUserSuccess'), 'success');
                loadUserList();
            });
        });
    }

    function setupSettings() {
        $('btn-settings-back')?.addEventListener('click', () => showScreen('home'));

        $('settings-level')?.addEventListener('change', (e) => {
            if (appSettings) {
                appSettings.preferredLevel = parseInt(e.target.value);
                DB.saveSettings(appSettings);
            }
        });

        $('settings-questions')?.addEventListener('change', (e) => {
            if (appSettings) {
                appSettings.questionsPerSet = parseInt(e.target.value);
                DB.saveSettings(appSettings);
            }
        });

        $('settings-labels')?.addEventListener('change', (e) => {
            if (appSettings) {
                appSettings.showKeyLabels = e.target.checked;
                DB.saveSettings(appSettings);
                Piano.setShowLabels(e.target.checked);
            }
        });

        $('settings-lang')?.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });

        // 新規ユーザー追加
        $('settings-add-user-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = $('settings-new-user-name');
            const name = input.value.trim();
            if (!name) return;
            try {
                await DB.createUser(name);
                input.value = '';
                showToast(I18n.t('settings.addUserSuccess', { name }), 'success');
                loadUserList();
            } catch (err) {
                if (err.name === 'ConstraintError') {
                    showToast(I18n.t('welcome.nameExists'), 'error');
                } else {
                    showToast(I18n.t('welcome.addFail'), 'error');
                }
            }
        });
    }

    // ==================== ユーザー管理 ====================

    async function selectUser(userId) {
        currentUser = await DB.getUser(userId);
        if (!currentUser) return;
        await DB.touchUser(userId);

        appSettings = await DB.getSettings(userId);
        if (!appSettings.userId) {
            appSettings.userId = userId;
        }
        
        // 言語設定の反映
        if (appSettings.language) {
            I18n.setLanguage(appSettings.language);
            updateDOMTranslations();
        } else {
            appSettings.language = I18n.getLanguage(); // 最新状態をDBに
        }
        
        await DB.saveSettings(appSettings);

        // ヘッダー更新
        updateUserDisplay();
        
        // 言語セレクトの同期
        if ($('settings-lang')) $('settings-lang').value = I18n.getLanguage();
    }

    function updateUserDisplay() {
        const el = $('current-user-name');
        if (el && currentUser) {
            el.textContent = currentUser.name;
        }
    }

    function toggleUserMenu() {
        showScreen('settings');
    }

    // ==================== ピアノ操作コールバック ====================

    async function handlePianoNote(noteName, keyElement) {
        // 音声が初期化されていなければ初期化
        if (!audioInitialized) {
            await ensureAudio();
            // 初期化後ピアノを再描画して音を鳴らす
            AudioEngine.noteOn(noteName, 0.7);
            setTimeout(() => AudioEngine.noteOff(noteName), 500);
        }

        // トレーニング中なら回答処理
        if (Training.isActive()) {
            const result = Training.submitAnswer(noteName);
            // resultに基づいてコールバックが発火するのでここでは何もしない
        }
        // フリープレイモードでは音はpiano.js側で既に鳴っている
    }

    // ==================== グローバルキーボードショートカット ====================

    function setupGlobalKeys() {
        document.addEventListener('keydown', (e) => {
            // テキスト入力中は無視
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

            switch (e.key) {
                case 'Enter':
                    if (currentScreen === 'home') {
                        e.preventDefault();
                        startTraining();
                    } else if (currentScreen === 'result') {
                        e.preventDefault();
                        startTraining();
                    }
                    break;

                case 'Escape':
                    e.preventDefault();
                    if (currentScreen === 'training') {
                        abortTraining();
                    } else if (['history', 'settings', 'result'].includes(currentScreen)) {
                        showScreen('home');
                    }
                    break;

                case ' ':
                    if (currentScreen === 'training' && Training.isActive()) {
                        e.preventDefault();
                        Training.replayNote();
                    }
                    break;

                case 'r':
                case 'R':
                    if (currentScreen === 'training' && Training.isActive()) {
                        e.preventDefault();
                        Training.replayNote();
                    }
                    break;
            }
        });
    }

    // ==================== UI ユーティリティ ====================

    function showToast(message, type = 'info') {
        const container = $('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        // フェードインアニメーション
        requestAnimationFrame(() => toast.classList.add('visible'));

        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function updateOctaveDisplay(octave) {
        const el = $('octave-indicator');
        if (el) el.textContent = I18n.t('common.octave', { n: octave });
    }

    function updateFooterHints() {
        const el = $('footer-shortcuts');
        if (!el) return;

        const hints = {
            home: I18n.t('footer.shortcutsHome'),
            training: I18n.t('footer.shortcutsTraining'),
            result: I18n.t('footer.shortcutsResult'),
            history: I18n.t('footer.shortcutsBack'),
            settings: I18n.t('footer.shortcutsBack')
        };

        el.textContent = hints[currentScreen] || '';
    }

    // ==================== 起動 ====================

    function boot() {
        // 各画面のイベントリスナーをセットアップ
        setupWelcome();
        setupHome();
        setupTraining();
        setupResult();
        setupHistory();
        setupSettings();

        // 初期化
        init();
    }

    // DOMContentLoaded で起動
    document.addEventListener('DOMContentLoaded', boot);

    return {
        showScreen,
        showToast
    };
})();
