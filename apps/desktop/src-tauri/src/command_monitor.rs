use std::{
    collections::HashMap,
    io::{BufRead, BufReader},
    path::Path,
    process::{Child, Command, Stdio},
    sync::Mutex,
    thread,
};

use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, State};

use crate::{chrono_like_now, now_id, DbState};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CommandTask {
    pub id: String,
    pub title: String,
    pub adapter_type: String,
    pub working_directory: String,
    pub command: String,
    pub args: Option<Vec<String>>,
    pub prompt_or_command: Option<String>,
    pub executable_path: Option<String>,
    pub status: String,
    pub exit_code: Option<i64>,
    pub no_output_timeout_minutes: i64,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CommandEvent {
    pub id: String,
    pub task_id: String,
    pub event_type: String,
    pub content: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct CommandOutputPayload {
    task_id: String,
    stream: String,
    content: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct CommandFinishedPayload {
    task_id: String,
    exit_code: i32,
    status: String,
}

pub struct CommandRunnerState {
    running: Mutex<HashMap<String, Child>>,
}

impl Default for CommandRunnerState {
    fn default() -> Self {
        Self {
            running: Mutex::new(HashMap::new()),
        }
    }
}

pub fn is_dangerous_command(command: &str, args: &[String]) -> bool {
    let full = format!("{} {}", command, args.join(" ")).to_lowercase();
    let patterns = [
        "rm -rf",
        "rm -fr",
        "del /s",
        "del /f /s",
        "format ",
        "shutdown",
        "curl ",
        "| sh",
        "| bash",
        "invoke-webrequest",
        "downloadstring",
        "iwr ",
        ".git",
    ];
    patterns.iter().any(|pattern| full.contains(pattern))
}

fn args_to_json(args: &Option<Vec<String>>) -> Option<String> {
    args.as_ref()
        .map(|values| serde_json::to_string(values).unwrap_or_else(|_| "[]".to_string()))
}

fn args_from_json(raw: Option<String>) -> Option<Vec<String>> {
    raw.and_then(|value| serde_json::from_str(&value).ok())
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct CommandStatusChangedPayload {
    task_id: String,
    status: String,
}

const TASK_SELECT: &str = "SELECT id, title, adapter_type, working_directory, command, args_json,
         prompt_or_command, executable_path, status, exit_code, no_output_timeout_minutes,
         started_at, completed_at, created_at, updated_at
         FROM command_tasks";

fn map_task_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<CommandTask> {
    Ok(CommandTask {
        id: row.get(0)?,
        title: row.get(1)?,
        adapter_type: row.get(2)?,
        working_directory: row.get(3)?,
        command: row.get(4)?,
        args: args_from_json(row.get(5)?),
        prompt_or_command: row.get(6)?,
        executable_path: row.get(7)?,
        status: row.get(8)?,
        exit_code: row.get(9)?,
        no_output_timeout_minutes: row.get(10)?,
        started_at: row.get(11)?,
        completed_at: row.get(12)?,
        created_at: row.get(13)?,
        updated_at: row.get(14)?,
    })
}

fn read_task(conn: &rusqlite::Connection, id: &str) -> Result<CommandTask, String> {
    conn.query_row(&format!("{TASK_SELECT} WHERE id = ?1"), params![id], map_task_row)
        .map_err(|_| "找不到命令任务".to_string())
}

fn upsert_task(conn: &rusqlite::Connection, task: &CommandTask) -> Result<(), String> {
    conn.execute(
        "INSERT INTO command_tasks
        (id, title, adapter_type, working_directory, command, args_json, prompt_or_command,
         executable_path, status, exit_code, no_output_timeout_minutes,
         started_at, completed_at, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          adapter_type = excluded.adapter_type,
          working_directory = excluded.working_directory,
          command = excluded.command,
          args_json = excluded.args_json,
          prompt_or_command = excluded.prompt_or_command,
          executable_path = excluded.executable_path,
          status = excluded.status,
          exit_code = excluded.exit_code,
          no_output_timeout_minutes = excluded.no_output_timeout_minutes,
          started_at = excluded.started_at,
          completed_at = excluded.completed_at,
          updated_at = excluded.updated_at",
        params![
            task.id,
            task.title,
            task.adapter_type,
            task.working_directory,
            task.command,
            args_to_json(&task.args),
            task.prompt_or_command,
            task.executable_path,
            task.status,
            task.exit_code,
            task.no_output_timeout_minutes,
            task.started_at,
            task.completed_at,
            task.created_at,
            task.updated_at
        ],
    )
    .map_err(|error| error.to_string())?;
    Ok(())
}

fn insert_event(conn: &rusqlite::Connection, event: &CommandEvent) -> Result<(), String> {
    conn.execute(
        "INSERT INTO command_events (id, task_id, event_type, content, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            event.id,
            event.task_id,
            event.event_type,
            event.content,
            event.created_at
        ],
    )
    .map_err(|error| error.to_string())?;
    Ok(())
}

fn add_event(
    conn: &rusqlite::Connection,
    app: &AppHandle,
    task_id: &str,
    event_type: &str,
    content: Option<String>,
    stream: Option<&str>,
) -> Result<(), String> {
    let event = CommandEvent {
        id: now_id("cmd-event"),
        task_id: task_id.to_string(),
        event_type: event_type.to_string(),
        content: content.clone(),
        created_at: chrono_like_now(),
    };
    insert_event(conn, &event)?;

    if let (Some(stream), Some(content)) = (stream, content) {
        let _ = app.emit(
            "command-output",
            CommandOutputPayload {
                task_id: task_id.to_string(),
                stream: stream.to_string(),
                content,
            },
        );
    }

    Ok(())
}

fn spawn_process(command: &str, args: &[String], working_directory: &str) -> Result<Child, String> {
    let cwd = Path::new(working_directory);
    if !cwd.exists() {
        return Err("工作目录不存在，请检查路径是否正确。".to_string());
    }
    if !cwd.is_dir() {
        return Err("工作目录必须是文件夹路径。".to_string());
    }

    let mut process = if cfg!(target_os = "windows") {
        let mut cmd = Command::new("cmd");
        cmd.arg("/C").arg(command);
        cmd.args(args);
        cmd
    } else {
        let mut cmd = Command::new(command);
        cmd.args(args);
        cmd
    };

    process
        .current_dir(cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    process.spawn().map_err(|error| {
        format!(
            "无法启动命令“{command}”，请确认命令已安装并在 PATH 中可用。{error}"
        )
    })
}

#[tauri::command]
pub fn list_command_tasks(db: State<DbState>) -> Result<Vec<CommandTask>, String> {
    let conn = db.conn.lock().map_err(|_| "读取命令任务失败".to_string())?;
    let mut stmt = conn
        .prepare(&format!("{TASK_SELECT} ORDER BY updated_at DESC, created_at DESC"))
        .map_err(|error| error.to_string())?;

    let rows = stmt
        .query_map([], map_task_row)
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_command_task(task: CommandTask, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "保存命令任务失败".to_string())?;
    upsert_task(&conn, &task)
}

#[tauri::command]
pub fn delete_command_task(id: String, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "删除命令任务失败".to_string())?;
    conn.execute("DELETE FROM command_events WHERE task_id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    conn.execute("DELETE FROM command_tasks WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_command_events(task_id: String, db: State<DbState>) -> Result<Vec<CommandEvent>, String> {
    let conn = db.conn.lock().map_err(|_| "读取命令日志失败".to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, task_id, event_type, content, created_at
             FROM command_events WHERE task_id = ?1 ORDER BY created_at ASC",
        )
        .map_err(|error| error.to_string())?;

    let rows = stmt
        .query_map(params![task_id], |row| {
            Ok(CommandEvent {
                id: row.get(0)?,
                task_id: row.get(1)?,
                event_type: row.get(2)?,
                content: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn clear_command_events(task_id: String, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "清空命令日志失败".to_string())?;
    conn.execute("DELETE FROM command_events WHERE task_id = ?1", params![task_id])
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn start_command_task(
    app: AppHandle,
    task_id: String,
    acknowledge_dangerous: bool,
    db: State<DbState>,
    runner: State<CommandRunnerState>,
) -> Result<(), String> {
    {
        let running = runner.running.lock().map_err(|_| "命令状态锁失败".to_string())?;
        if running.contains_key(&task_id) {
            return Err("该任务正在运行中。".to_string());
        }
    }

    let task = {
        let conn = db.conn.lock().map_err(|_| "读取命令任务失败".to_string())?;
        read_task(&conn, &task_id)?
    };

    if task.status == "running" {
        return Err("该任务正在运行中。".to_string());
    }

    let mut task = task;
    if task.adapter_type.is_empty() {
        task.adapter_type = "generic".to_string();
    }
    if task.no_output_timeout_minutes <= 0 {
        task.no_output_timeout_minutes = 5;
    }

    let args = task.args.clone().unwrap_or_default();
    if is_dangerous_command(&task.command, &args) && !acknowledge_dangerous {
        return Err("该命令可能具有破坏性，请确认后再启动。".to_string());
    }

    let started_at = chrono_like_now();
    {
        let conn = db.conn.lock().map_err(|_| "更新命令任务失败".to_string())?;
        conn.execute("DELETE FROM command_events WHERE task_id = ?1", params![task_id])
            .map_err(|error| error.to_string())?;

        let running_task = CommandTask {
            status: "running".to_string(),
            exit_code: None,
            started_at: Some(started_at.clone()),
            completed_at: None,
            updated_at: started_at.clone(),
            ..task.clone()
        };
        upsert_task(&conn, &running_task)?;
        add_event(&conn, &app, &task_id, "started", None, None)?;
    }

    let mut child = spawn_process(&task.command, &args, &task.working_directory)?;
    let stdout = child.stdout.take();
    let stderr = child.stderr.take();

    {
        let mut running = runner.running.lock().map_err(|_| "命令状态锁失败".to_string())?;
        running.insert(task_id.clone(), child);
    }

    let app_stdout = app.clone();
    let task_id_stdout = task_id.clone();
    if let Some(stdout) = stdout {
        thread::spawn(move || {
            let reader = BufReader::new(stdout);
            let db_state = app_stdout.state::<DbState>();
            for line in reader.lines().map_while(Result::ok) {
                if let Ok(conn) = db_state.conn.lock() {
                    let _ = add_event(
                        &conn,
                        &app_stdout,
                        &task_id_stdout,
                        "stdout",
                        Some(line.clone()),
                        Some("stdout"),
                    );
                }
            }
        });
    }

    let app_stderr = app.clone();
    let task_id_stderr = task_id.clone();
    if let Some(stderr) = stderr {
        thread::spawn(move || {
            let reader = BufReader::new(stderr);
            let db_state = app_stderr.state::<DbState>();
            for line in reader.lines().map_while(Result::ok) {
                if let Ok(conn) = db_state.conn.lock() {
                    let _ = add_event(
                        &conn,
                        &app_stderr,
                        &task_id_stderr,
                        "stderr",
                        Some(line.clone()),
                        Some("stderr"),
                    );
                }
            }
        });
    }

    let app_wait = app.clone();
    thread::spawn(move || {
        let exit = {
            let runner_state = app_wait.state::<CommandRunnerState>();
            let mut running = match runner_state.running.lock() {
                Ok(value) => value,
                Err(_) => return,
            };
            let mut child = running.remove(&task_id);
            child.as_mut().and_then(|process| process.wait().ok())
        };

        let db_state = app_wait.state::<DbState>();
        let Ok(conn) = db_state.conn.lock() else {
            return;
        };

        let cancelled: bool = conn
            .query_row(
                "SELECT status FROM command_tasks WHERE id = ?1",
                params![task_id],
                |row| row.get::<_, String>(0),
            )
            .map(|status| status == "cancelled")
            .unwrap_or(false);

        if cancelled {
            let _ = app_wait.emit(
                "command-finished",
                CommandFinishedPayload {
                    task_id: task_id.clone(),
                    exit_code: -1,
                    status: "cancelled".to_string(),
                },
            );
            return;
        }

        let (exit_code, status) = match exit {
            Some(code) if code.success() => (code.code().unwrap_or(0), "succeeded"),
            Some(code) => (code.code().unwrap_or(1), "failed"),
            None => (1, "failed"),
        };

        let completed_at = chrono_like_now();
        if let Ok(mut task) = read_task(&conn, &task_id) {
            task.status = status.to_string();
            task.exit_code = Some(exit_code as i64);
            task.completed_at = Some(completed_at.clone());
            task.updated_at = completed_at;
            let _ = upsert_task(&conn, &task);
        }

        let _ = add_event(
            &conn,
            &app_wait,
            &task_id,
            status,
            Some(format!("exit code: {exit_code}")),
            None,
        );

        let _ = app_wait.emit(
            "command-finished",
            CommandFinishedPayload {
                task_id: task_id.clone(),
                exit_code,
                status: status.to_string(),
            },
        );
    });

    Ok(())
}

#[tauri::command]
pub fn cancel_command_task(
    app: AppHandle,
    task_id: String,
    db: State<DbState>,
    runner: State<CommandRunnerState>,
) -> Result<(), String> {
    let mut running = runner.running.lock().map_err(|_| "命令状态锁失败".to_string())?;
    if let Some(mut child) = running.remove(&task_id) {
        let _ = child.kill();
    }

    let conn = db.conn.lock().map_err(|_| "更新命令任务失败".to_string())?;
    let mut task = read_task(&conn, &task_id)?;
    if !["running", "needs_user_input", "no_output_timeout"].contains(&task.status.as_str()) {
        return Err("该任务当前不在运行中。".to_string());
    }

    let completed_at = chrono_like_now();
    task.status = "cancelled".to_string();
    task.completed_at = Some(completed_at.clone());
    task.updated_at = completed_at;
    upsert_task(&conn, &task)?;
    add_event(
        &conn,
        &app,
        &task_id,
        "cancelled",
        Some("任务已取消".to_string()),
        None,
    )?;

    let _ = app.emit(
        "command-finished",
        CommandFinishedPayload {
            task_id,
            exit_code: -1,
            status: "cancelled".to_string(),
        },
    );

    Ok(())
}

#[tauri::command]
pub fn update_command_task_status(
    app: AppHandle,
    task_id: String,
    status: String,
    content: Option<String>,
    db: State<DbState>,
) -> Result<CommandTask, String> {
    let conn = db.conn.lock().map_err(|_| "更新命令任务失败".to_string())?;
    let mut task = read_task(&conn, &task_id)?;
    task.status = status.clone();
    task.updated_at = chrono_like_now();
    upsert_task(&conn, &task)?;

    if let Some(content) = content {
        let _ = add_event(&conn, &app, &task_id, &status, Some(content), None);
    }

    let _ = app.emit(
        "command-status-changed",
        CommandStatusChangedPayload {
            task_id,
            status,
        },
    );

    read_task(&conn, &task.id)
}

#[tauri::command]
pub fn add_command_event(event: CommandEvent, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "保存命令事件失败".to_string())?;
    insert_event(&conn, &event).map_err(|error| error.to_string())
}
