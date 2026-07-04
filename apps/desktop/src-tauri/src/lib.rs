use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager, PhysicalPosition, State, WindowEvent,
};

mod command_monitor;
mod agent_tools;
mod pet_assets;

struct WindowState {
    always_on_top: Mutex<bool>,
}

pub(crate) struct DbState {
    conn: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Reminder {
    id: String,
    title: String,
    reminder_type: String,
    mode: String,
    interval_minutes: Option<i64>,
    fixed_time: Option<String>,
    message: Option<String>,
    enabled: bool,
    next_trigger_at: Option<String>,
    sound_id: Option<String>,
    sound_enabled: bool,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReminderEventRecord {
    id: String,
    reminder_id: String,
    event_type: String,
    message: Option<String>,
    created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReminderSound {
    id: String,
    name: String,
    source: String,
    file_path: String,
    volume: f64,
    created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct StorageInfo {
    database_path: String,
    sounds_dir: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LocalAiSettings {
    enabled: bool,
    provider: String,
    base_url: String,
    selected_model: Option<String>,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OllamaModel {
    name: String,
    size: Option<i64>,
    modified_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct OllamaStatus {
    status: String,
    base_url: String,
    models: Vec<OllamaModel>,
    selected_model: Option<String>,
    error_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct OllamaChatMessage {
    role: String,
    content: String,
}

fn now_id(prefix: &str) -> String {
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    format!("{prefix}-{millis}")
}

pub(crate) fn app_storage_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let base = app.path().app_data_dir().map_err(|error| error.to_string())?;
    Ok(base.join("codepet"))
}

fn app_sounds_dir(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_storage_dir(app)?.join("sounds"))
}

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_storage_dir(app)?.join("codepet.sqlite"))
}

fn init_database(app: &AppHandle) -> Result<Connection, String> {
    let storage_dir = app_storage_dir(app)?;
    fs::create_dir_all(storage_dir.join("sounds")).map_err(|error| error.to_string())?;
    fs::create_dir_all(storage_dir.join("pets")).map_err(|error| error.to_string())?;

    let conn = Connection::open(database_path(app)?).map_err(|error| error.to_string())?;
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS reminders (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          mode TEXT NOT NULL,
          interval_minutes INTEGER,
          fixed_time TEXT,
          message TEXT,
          enabled INTEGER NOT NULL DEFAULT 1,
          next_trigger_at TEXT,
          sound_id TEXT,
          sound_enabled INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reminder_events (
          id TEXT PRIMARY KEY,
          reminder_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          message TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reminder_sounds (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          source TEXT NOT NULL,
          file_path TEXT NOT NULL,
          volume REAL NOT NULL DEFAULT 1.0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS local_ai_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS command_tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          adapter_type TEXT NOT NULL DEFAULT 'generic',
          working_directory TEXT NOT NULL,
          command TEXT NOT NULL,
          args_json TEXT,
          prompt_or_command TEXT,
          executable_path TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          exit_code INTEGER,
          no_output_timeout_minutes INTEGER NOT NULL DEFAULT 5,
          started_at TEXT,
          completed_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS command_events (
          id TEXT PRIMARY KEY,
          task_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          content TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS agent_tool_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pet_assets (
          id TEXT PRIMARY KEY,
          display_name TEXT NOT NULL,
          description TEXT,
          source TEXT NOT NULL,
          manifest_path TEXT NOT NULL,
          spritesheet_path TEXT NOT NULL,
          grid_json TEXT NOT NULL,
          animations_json TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        ",
    )
    .map_err(|error| error.to_string())?;

    let _ = conn.execute("ALTER TABLE reminders ADD COLUMN sound_id TEXT", []);
    let _ = conn.execute(
        "ALTER TABLE reminders ADD COLUMN sound_enabled INTEGER NOT NULL DEFAULT 1",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE command_tasks ADD COLUMN adapter_type TEXT NOT NULL DEFAULT 'generic'",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE command_tasks ADD COLUMN prompt_or_command TEXT",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE command_tasks ADD COLUMN executable_path TEXT",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE command_tasks ADD COLUMN no_output_timeout_minutes INTEGER NOT NULL DEFAULT 5",
        [],
    );

    conn.execute(
        "INSERT OR IGNORE INTO reminder_sounds
        (id, name, source, file_path, volume, created_at)
        VALUES ('default-beep', '默认提示音', 'built_in', 'built-in:default-beep', 1.0, datetime('now'))",
        [],
    )
    .map_err(|error| error.to_string())?;
    conn.execute(
        "UPDATE reminder_sounds
         SET name = '默认提示音', source = 'built_in', file_path = 'built-in:default-beep'
         WHERE id = 'default-beep'",
        [],
    )
    .map_err(|error| error.to_string())?;

    Ok(conn)
}

fn normalize_ollama_base_url(base_url: &str) -> String {
    let trimmed = base_url.trim().trim_end_matches('/');
    if trimmed.ends_with("/api") {
        trimmed.to_string()
    } else {
        format!("{trimmed}/api")
    }
}

fn ollama_endpoint(base_url: &str, path: &str) -> String {
    format!(
        "{}/{}",
        normalize_ollama_base_url(base_url),
        path.trim_start_matches('/')
    )
}

fn is_local_ollama_url(base_url: &str) -> bool {
    let lower = base_url.to_lowercase();
    lower.starts_with("http://localhost:")
        || lower.starts_with("http://127.0.0.1:")
        || lower.starts_with("http://[::1]:")
}

fn default_local_ai_settings() -> LocalAiSettings {
    LocalAiSettings {
        enabled: false,
        provider: "ollama".to_string(),
        base_url: "http://localhost:11434/api".to_string(),
        selected_model: None,
        updated_at: chrono_like_now(),
    }
}

fn parse_ollama_tags(value: Value) -> Vec<OllamaModel> {
    value
        .get("models")
        .and_then(|models| models.as_array())
        .map(|models| {
            models
                .iter()
                .filter_map(|model| {
                    let name = model.get("name")?.as_str()?.to_string();
                    Some(OllamaModel {
                        name,
                        size: model.get("size").and_then(|size| size.as_i64()),
                        modified_at: model
                            .get("modified_at")
                            .and_then(|modified_at| modified_at.as_str())
                            .map(ToString::to_string),
                    })
                })
                .collect()
        })
        .unwrap_or_default()
}

fn friendly_ollama_error(error: reqwest::Error) -> String {
    if error.is_timeout() {
        return "本地模型响应超时，请检查 Ollama 是否仍在运行。".to_string();
    }
    if error.is_connect() {
        return "未检测到 Ollama，请先安装并启动 Ollama。".to_string();
    }
    if error.is_decode() {
        return "Ollama 返回内容解析失败，请检查 API 地址是否正确。".to_string();
    }
    "本地模型响应失败，请检查 Ollama 是否仍在运行。".to_string()
}

#[tauri::command]
fn get_storage_info(app: AppHandle) -> Result<StorageInfo, String> {
    Ok(StorageInfo {
        database_path: database_path(&app)?.to_string_lossy().to_string(),
        sounds_dir: app_sounds_dir(&app)?.to_string_lossy().to_string(),
    })
}

#[tauri::command]
fn get_app_meta(key: String, db: State<DbState>) -> Result<Option<String>, String> {
    let conn = db.conn.lock().map_err(|_| "读取本地配置失败".to_string())?;
    conn.query_row(
        "SELECT value FROM app_meta WHERE key = ?1",
        params![key],
        |row| row.get(0),
    )
    .optional()
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn set_app_meta(key: String, value: String, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "写入本地配置失败".to_string())?;
    conn.execute(
        "INSERT INTO app_meta (key, value) VALUES (?1, ?2)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )
    .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_local_ai_settings(db: State<DbState>) -> Result<LocalAiSettings, String> {
    let conn = db.conn.lock().map_err(|_| "读取本地 AI 配置失败".to_string())?;
    let value: Option<String> = conn
        .query_row(
            "SELECT value FROM local_ai_settings WHERE key = 'ollama'",
            [],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;

    match value {
        Some(value) => serde_json::from_str(&value).map_err(|_| "本地 AI 配置解析失败".to_string()),
        None => Ok(default_local_ai_settings()),
    }
}

#[tauri::command]
fn save_local_ai_settings(settings: LocalAiSettings, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "保存本地 AI 配置失败".to_string())?;
    let normalized = LocalAiSettings {
        provider: "ollama".to_string(),
        base_url: normalize_ollama_base_url(&settings.base_url),
        updated_at: chrono_like_now(),
        ..settings
    };
    let value = serde_json::to_string(&normalized).map_err(|error| error.to_string())?;
    conn.execute(
        "INSERT INTO local_ai_settings (key, value, updated_at)
         VALUES ('ollama', ?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        params![value, normalized.updated_at],
    )
    .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
async fn detect_ollama_status(
    base_url: String,
    selected_model: Option<String>,
) -> Result<OllamaStatus, String> {
    let normalized = normalize_ollama_base_url(&base_url);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
        .map_err(|_| "初始化本地 AI 请求失败".to_string())?;

    let response = client
        .get(ollama_endpoint(&normalized, "tags"))
        .send()
        .await
        .map_err(friendly_ollama_error)?;

    if !response.status().is_success() {
        return Ok(OllamaStatus {
            status: "error".to_string(),
            base_url: normalized,
            models: vec![],
            selected_model,
            error_message: Some("Ollama API 返回异常，请检查地址是否正确。".to_string()),
        });
    }

    let value: Value = response.json().await.map_err(friendly_ollama_error)?;
    let models = parse_ollama_tags(value);
    if models.is_empty() {
        return Ok(OllamaStatus {
            status: "unavailable".to_string(),
            base_url: normalized,
            models,
            selected_model,
            error_message: Some(
                "当前没有本地模型，请先在终端运行：ollama pull qwen3:0.6b".to_string(),
            ),
        });
    }

    let selected_exists = selected_model
        .as_ref()
        .map(|selected| models.iter().any(|model| model.name == *selected))
        .unwrap_or(true);

    Ok(OllamaStatus {
        status: if selected_exists { "available" } else { "error" }.to_string(),
        base_url: normalized,
        models,
        selected_model,
        error_message: if selected_exists {
            None
        } else {
            Some("当前模型不可用，请重新选择模型。".to_string())
        },
    })
}

#[tauri::command]
async fn ollama_chat(
    base_url: String,
    model: String,
    messages: Vec<OllamaChatMessage>,
) -> Result<String, String> {
    if model.trim().is_empty() {
        return Err("请先选择本地模型。".to_string());
    }
    if messages.is_empty() {
        return Err("请输入要发送给本地模型的内容。".to_string());
    }

    let normalized = normalize_ollama_base_url(&base_url);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|_| "初始化本地 AI 请求失败".to_string())?;
    let response = client
        .post(ollama_endpoint(&normalized, "chat"))
        .json(&serde_json::json!({
            "model": model,
            "messages": messages,
            "stream": false
        }))
        .send()
        .await
        .map_err(friendly_ollama_error)?;

    if !response.status().is_success() {
        return Err("本地模型响应失败，请检查 Ollama 是否仍在运行。".to_string());
    }

    let value: Value = response.json().await.map_err(friendly_ollama_error)?;
    let content = value
        .get("message")
        .and_then(|message| message.get("content"))
        .and_then(|content| content.as_str())
        .map(str::trim)
        .filter(|content| !content.is_empty())
        .ok_or_else(|| "模型返回空内容，请稍后重试。".to_string())?;
    Ok(content.to_string())
}

#[tauri::command]
fn is_local_ollama_base_url(base_url: String) -> bool {
    is_local_ollama_url(&base_url)
}

#[tauri::command]
fn list_reminders(db: State<DbState>) -> Result<Vec<Reminder>, String> {
    let conn = db.conn.lock().map_err(|_| "读取提醒失败".to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, title, type, mode, interval_minutes, fixed_time, message, enabled,
             next_trigger_at, sound_id, sound_enabled, created_at, updated_at
             FROM reminders ORDER BY enabled DESC, next_trigger_at ASC, created_at ASC",
        )
        .map_err(|error| error.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Reminder {
                id: row.get(0)?,
                title: row.get(1)?,
                reminder_type: row.get(2)?,
                mode: row.get(3)?,
                interval_minutes: row.get(4)?,
                fixed_time: row.get(5)?,
                message: row.get(6)?,
                enabled: row.get::<_, i64>(7)? == 1,
                next_trigger_at: row.get(8)?,
                sound_id: row.get(9)?,
                sound_enabled: row.get::<_, i64>(10)? == 1,
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            })
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn save_reminder(reminder: Reminder, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "保存提醒失败".to_string())?;
    conn.execute(
        "INSERT INTO reminders
        (id, title, type, mode, interval_minutes, fixed_time, message, enabled, next_trigger_at,
         sound_id, sound_enabled, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          type = excluded.type,
          mode = excluded.mode,
          interval_minutes = excluded.interval_minutes,
          fixed_time = excluded.fixed_time,
          message = excluded.message,
          enabled = excluded.enabled,
          next_trigger_at = excluded.next_trigger_at,
          sound_id = excluded.sound_id,
          sound_enabled = excluded.sound_enabled,
          updated_at = excluded.updated_at",
        params![
            reminder.id,
            reminder.title,
            reminder.reminder_type,
            reminder.mode,
            reminder.interval_minutes,
            reminder.fixed_time,
            reminder.message,
            if reminder.enabled { 1 } else { 0 },
            reminder.next_trigger_at,
            reminder.sound_id,
            if reminder.sound_enabled { 1 } else { 0 },
            reminder.created_at,
            reminder.updated_at
        ],
    )
    .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_reminder(id: String, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "删除提醒失败".to_string())?;
    conn.execute("DELETE FROM reminders WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn list_reminder_events(limit: i64, db: State<DbState>) -> Result<Vec<ReminderEventRecord>, String> {
    let conn = db.conn.lock().map_err(|_| "读取提醒历史失败".to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, reminder_id, event_type, message, created_at
             FROM reminder_events ORDER BY created_at DESC LIMIT ?1",
        )
        .map_err(|error| error.to_string())?;

    let rows = stmt
        .query_map(params![limit], |row| {
            Ok(ReminderEventRecord {
                id: row.get(0)?,
                reminder_id: row.get(1)?,
                event_type: row.get(2)?,
                message: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn add_reminder_event(event: ReminderEventRecord, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "保存提醒历史失败".to_string())?;
    conn.execute(
        "INSERT INTO reminder_events (id, reminder_id, event_type, message, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            event.id,
            event.reminder_id,
            event.event_type,
            event.message,
            event.created_at
        ],
    )
    .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn list_reminder_sounds(db: State<DbState>) -> Result<Vec<ReminderSound>, String> {
    let conn = db.conn.lock().map_err(|_| "读取提示音失败".to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, name, source, file_path, volume, created_at
             FROM reminder_sounds ORDER BY source ASC, created_at ASC",
        )
        .map_err(|error| error.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(ReminderSound {
                id: row.get(0)?,
                name: row.get(1)?,
                source: row.get(2)?,
                file_path: row.get(3)?,
                volume: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn import_reminder_sound(
    app: AppHandle,
    original_path: String,
    name: String,
    db: State<DbState>,
) -> Result<ReminderSound, String> {
    let source_path = Path::new(&original_path);
    let extension = source_path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_lowercase();
    if !["mp3", "wav", "ogg"].contains(&extension.as_str()) {
        return Err("仅支持 mp3、wav、ogg 提示音文件".to_string());
    }

    let id = now_id("sound");
    let sounds_dir = app_sounds_dir(&app)?;
    fs::create_dir_all(&sounds_dir).map_err(|error| error.to_string())?;
    let target_path = sounds_dir.join(format!("{id}.{extension}"));
    fs::copy(source_path, &target_path).map_err(|error| error.to_string())?;

    let created_at = chrono_like_now();
    let sound = ReminderSound {
        id,
        name,
        source: "custom".to_string(),
        file_path: target_path.to_string_lossy().to_string(),
        volume: 1.0,
        created_at,
    };

    let conn = db.conn.lock().map_err(|_| "保存提示音失败".to_string())?;
    conn.execute(
        "INSERT INTO reminder_sounds (id, name, source, file_path, volume, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            sound.id,
            sound.name,
            sound.source,
            sound.file_path,
            sound.volume,
            sound.created_at
        ],
    )
    .map_err(|error| error.to_string())?;

    Ok(sound)
}

pub(crate) fn chrono_like_now() -> String {
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    format!("{millis}")
}

#[tauri::command]
fn delete_reminder_sound(id: String, db: State<DbState>) -> Result<(), String> {
    if id == "default-beep" {
        return Err("内置提示音不能删除".to_string());
    }

    let conn = db.conn.lock().map_err(|_| "删除提示音失败".to_string())?;
    let file_path: Option<String> = conn
        .query_row(
            "SELECT file_path FROM reminder_sounds WHERE id = ?1 AND source = 'custom'",
            params![id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;

    conn.execute(
        "UPDATE reminders SET sound_id = 'default-beep' WHERE sound_id = ?1",
        params![id],
    )
    .map_err(|error| error.to_string())?;
    conn.execute("DELETE FROM reminder_sounds WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;

    if let Some(path) = file_path {
        let _ = fs::remove_file(path);
    }
    Ok(())
}

#[tauri::command]
fn start_window_drag(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "找不到主窗口".to_string())?;

    window.start_dragging().map_err(|error| error.to_string())
}

#[tauri::command]
fn get_always_on_top(state: State<WindowState>) -> bool {
    *state.always_on_top.lock().expect("读取置顶状态失败")
}

#[tauri::command]
fn toggle_always_on_top(app: AppHandle, state: State<WindowState>) -> Result<bool, String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "找不到主窗口".to_string())?;
    let mut always_on_top = state.always_on_top.lock().expect("更新置顶状态失败");

    *always_on_top = !*always_on_top;
    window
        .set_always_on_top(*always_on_top)
        .map_err(|error| error.to_string())?;

    Ok(*always_on_top)
}

#[tauri::command]
fn show_main_window_command(app: AppHandle) {
    show_main_window(&app);
}

fn place_window_near_bottom_right(app: &AppHandle) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window("main") else {
        return Ok(());
    };
    let Some(monitor) = window.current_monitor()?.or(window.primary_monitor()?) else {
        return Ok(());
    };

    let monitor_size = monitor.size();
    let monitor_position = monitor.position();
    let window_size = window.outer_size()?;
    let margin = 24;
    let x = monitor_position.x + monitor_size.width as i32 - window_size.width as i32 - margin;
    let y = monitor_position.y + monitor_size.height as i32 - window_size.height as i32 - margin;

    window.set_position(PhysicalPosition { x, y })?;
    Ok(())
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn hide_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
}

fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "显示 CodePet", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "隐藏 CodePet", true, None::<&str>)?;
    let toggle_top = MenuItem::with_id(app, "toggle_top", "切换置顶", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &hide, &toggle_top, &quit])?;

    TrayIconBuilder::with_id("main-tray")
        .tooltip("CodePet")
        .icon(app.default_window_icon().cloned().expect("缺少默认窗口图标"))
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => show_main_window(app),
            "hide" => hide_main_window(app),
            "toggle_top" => {
                let state = app.state::<WindowState>();
                let _ = toggle_always_on_top(app.clone(), state);
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let conn =
                init_database(app.handle()).map_err(|error| tauri::Error::Anyhow(anyhow::anyhow!(error)))?;
            app.manage(DbState {
                conn: Mutex::new(conn),
            });
            setup_tray(app.handle())?;
            place_window_near_bottom_right(app.handle())?;
            Ok(())
        })
        .manage(WindowState {
            always_on_top: Mutex::new(false),
        })
        .manage(command_monitor::CommandRunnerState::default())
        .invoke_handler(tauri::generate_handler![
            get_storage_info,
            get_app_meta,
            set_app_meta,
            get_local_ai_settings,
            save_local_ai_settings,
            detect_ollama_status,
            ollama_chat,
            is_local_ollama_base_url,
            list_reminders,
            save_reminder,
            delete_reminder,
            list_reminder_events,
            add_reminder_event,
            list_reminder_sounds,
            import_reminder_sound,
            delete_reminder_sound,
            command_monitor::list_command_tasks,
            command_monitor::save_command_task,
            command_monitor::delete_command_task,
            command_monitor::list_command_events,
            command_monitor::clear_command_events,
            command_monitor::start_command_task,
            command_monitor::cancel_command_task,
            command_monitor::update_command_task_status,
            command_monitor::add_command_event,
            agent_tools::get_agent_tool_setting,
            agent_tools::save_agent_tool_setting,
            agent_tools::detect_executable,
            pet_assets::preview_pet_import,
            pet_assets::import_pet_asset,
            pet_assets::list_pet_assets,
            pet_assets::delete_pet_asset,
            pet_assets::get_current_pet_id,
            pet_assets::set_current_pet_id,
            start_window_drag,
            get_always_on_top,
            toggle_always_on_top,
            show_main_window_command
        ])
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("运行 CodePet Tauri 应用失败");
}
