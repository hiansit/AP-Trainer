// ============================================================
// db.js — IndexedDB管理（ユーザー・セッション・設定）
// ============================================================

const DB = (() => {
    const DB_NAME = "AbsolutePitchTrainerDB";
    const DB_VERSION = 1;
    let db = null;

    /**
     * データベースを開く / 初期化
     * @returns {Promise<IDBDatabase>}
     */
    function open() {
        return new Promise((resolve, reject) => {
            if (db) { resolve(db); return; }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                // ユーザーストア
                if (!database.objectStoreNames.contains("users")) {
                    const userStore = database.createObjectStore("users", { keyPath: "id", autoIncrement: true });
                    userStore.createIndex("name", "name", { unique: true });
                }

                // セッションストア（トレーニング履歴）
                if (!database.objectStoreNames.contains("sessions")) {
                    const sessionStore = database.createObjectStore("sessions", { keyPath: "id", autoIncrement: true });
                    sessionStore.createIndex("userId", "userId", { unique: false });
                    sessionStore.createIndex("timestamp", "timestamp", { unique: false });
                    sessionStore.createIndex("userId_timestamp", ["userId", "timestamp"], { unique: false });
                }

                // 設定ストア
                if (!database.objectStoreNames.contains("settings")) {
                    database.createObjectStore("settings", { keyPath: "userId" });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = (event) => {
                console.error("[DB] データベース接続エラー:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    // ==================== ユーザー管理 ====================

    /**
     * ユーザーを作成
     * @param {string} name
     * @returns {Promise<number>} 新規ユーザーID
     */
    async function createUser(name) {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("users", "readwrite");
            const store = tx.objectStore("users");
            const user = {
                name: name.trim(),
                createdAt: Date.now(),
                lastActive: Date.now()
            };
            const req = store.add(user);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * 全ユーザーを取得
     * @returns {Promise<Array>}
     */
    async function getAllUsers() {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("users", "readonly");
            const store = tx.objectStore("users");
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * ユーザーを取得
     * @param {number} id
     * @returns {Promise<Object>}
     */
    async function getUser(id) {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("users", "readonly");
            const store = tx.objectStore("users");
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * ユーザーを削除（関連するセッション・設定も削除）
     * @param {number} id
     */
    async function deleteUser(id) {
        const database = await open();

        // ユーザー本体削除
        await new Promise((resolve, reject) => {
            const tx = database.transaction("users", "readwrite");
            const req = tx.objectStore("users").delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });

        // 関連セッション削除
        await deleteSessionsByUser(id);

        // 関連設定削除
        await new Promise((resolve, reject) => {
            const tx = database.transaction("settings", "readwrite");
            const req = tx.objectStore("settings").delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * ユーザーの最終アクティブ時刻を更新
     * @param {number} id
     */
    async function touchUser(id) {
        const database = await open();
        const tx = database.transaction("users", "readwrite");
        const store = tx.objectStore("users");
        const req = store.get(id);
        req.onsuccess = () => {
            const user = req.result;
            if (user) {
                user.lastActive = Date.now();
                store.put(user);
            }
        };
    }

    // ==================== セッション（履歴）管理 ====================

    /**
     * セッション結果を保存
     * @param {Object} session - { userId, level, score, total, accuracy, details[] }
     * @returns {Promise<number>}
     */
    async function saveSession(session) {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("sessions", "readwrite");
            const store = tx.objectStore("sessions");
            session.timestamp = Date.now();
            const req = store.add(session);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * ユーザーのセッション履歴を取得（新しい順）
     * @param {number} userId
     * @param {number} limit - 最大件数（デフォルト50）
     * @returns {Promise<Array>}
     */
    async function getSessionsByUser(userId, limit = 50) {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("sessions", "readonly");
            const store = tx.objectStore("sessions");
            const index = store.index("userId");
            const req = index.getAll(userId);
            req.onsuccess = () => {
                // 新しい順にソート & リミット適用
                const results = req.result
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, limit);
                resolve(results);
            };
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * ユーザーの統計データを取得
     * @param {number} userId
     * @returns {Promise<Object>}
     */
    async function getUserStats(userId) {
        const sessions = await getSessionsByUser(userId, 9999);
        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                overallAccuracy: 0,
                byLevel: {},
                recentTrend: []
            };
        }

        let totalQuestions = 0;
        let totalCorrect = 0;
        const byLevel = {};

        sessions.forEach(s => {
            totalQuestions += s.total;
            totalCorrect += s.score;

            if (!byLevel[s.level]) {
                byLevel[s.level] = { sessions: 0, questions: 0, correct: 0 };
            }
            byLevel[s.level].sessions++;
            byLevel[s.level].questions += s.total;
            byLevel[s.level].correct += s.score;
        });

        // レベル別正解率を計算
        Object.keys(byLevel).forEach(lv => {
            byLevel[lv].accuracy = byLevel[lv].questions > 0
                ? Math.round((byLevel[lv].correct / byLevel[lv].questions) * 100)
                : 0;
        });

        // 直近20セッションのトレンド（グラフ用）
        const recentTrend = sessions.slice(0, 20).reverse().map(s => ({
            timestamp: s.timestamp,
            accuracy: s.total > 0 ? Math.round((s.score / s.total) * 100) : 0,
            level: s.level
        }));

        return {
            totalSessions: sessions.length,
            totalQuestions,
            totalCorrect,
            overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            byLevel,
            recentTrend
        };
    }

    /**
     * ユーザーの全セッションを削除
     * @param {number} userId
     */
    async function deleteSessionsByUser(userId) {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("sessions", "readwrite");
            const store = tx.objectStore("sessions");
            const index = store.index("userId");
            const req = index.openCursor(userId);
            req.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * 特定のセッションを削除
     * @param {number} sessionId
     */
    async function deleteSession(sessionId) {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("sessions", "readwrite");
            const req = tx.objectStore("sessions").delete(sessionId);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * 複数のセッションを一括削除
     * @param {number[]} sessionIds
     */
    async function deleteSessions(sessionIds) {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("sessions", "readwrite");
            const store = tx.objectStore("sessions");
            
            let completed = 0;
            let hasError = false;

            if (sessionIds.length === 0) {
                resolve();
                return;
            }

            sessionIds.forEach(id => {
                const req = store.delete(id);
                req.onsuccess = () => {
                    completed++;
                    if (completed === sessionIds.length && !hasError) resolve();
                };
                req.onerror = (e) => {
                    if (!hasError) {
                        hasError = true;
                        reject(e.target.error);
                    }
                };
            });
        });
    }

    // ==================== 設定管理 ====================

    /**
     * ユーザー設定を取得
     * @param {number} userId
     * @returns {Promise<Object>}
     */
    async function getSettings(userId) {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("settings", "readonly");
            const req = tx.objectStore("settings").get(userId);
            req.onsuccess = () => {
                resolve(req.result || {
                    userId,
                    preferredLevel: 1,
                    questionsPerSet: 10,
                    showKeyLabels: true
                });
            };
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * ユーザー設定を保存
     * @param {Object} settings - { userId, preferredLevel, questionsPerSet, showKeyLabels }
     */
    async function saveSettings(settings) {
        const database = await open();
        return new Promise((resolve, reject) => {
            const tx = database.transaction("settings", "readwrite");
            const req = tx.objectStore("settings").put(settings);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    return {
        open,
        createUser,
        getAllUsers,
        getUser,
        deleteUser,
        touchUser,
        saveSession,
        getSessionsByUser,
        getUserStats,
        deleteSessionsByUser,
        deleteSession,
        deleteSessions,
        getSettings,
        saveSettings
    };
})();
