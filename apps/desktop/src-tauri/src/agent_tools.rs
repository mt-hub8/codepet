use std::process::{Command, Stdio};

use rusqlite::{params, OptionalExtension};
use serde::Serialize;
use tauri::State;

use crate::{chrono_like_now, DbState};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DetectExecutableResult {
    pub detected: bool,
    pub version: Option<String>,
    pub error_message: Option<String>,
}

#[tauri::command]
pub fn get_agent_tool_setting(key: String, db: State<DbState>) -> Result<Option<String>, String> {
    let conn = db.conn.lock().map_err(|_| "读取工具配置失败".to_string())?;
    conn.query_row(
        "SELECT value FROM agent_tool_settings WHERE key = ?1",
        params![key],
        |row| row.get(0),
    )
    .optional()
    .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_agent_tool_setting(key: String, value: String, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "保存工具配置失败".to_string())?;
    let updated_at = chrono_like_now();
    conn.execute(
        "INSERT INTO agent_tool_settings (key, value, updated_at)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        params![key, value, updated_at],
    )
    .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn detect_executable(executable: String, args: Vec<String>) -> DetectExecutableResult {
    let trimmed = executable.trim();
    if trimmed.is_empty() {
        return DetectExecutableResult {
            detected: false,
            version: None,
            error_message: Some("未配置可执行命令".to_string()),
        };
    }

    let mut process = if cfg!(target_os = "windows") {
        let mut cmd = Command::new("cmd");
        cmd.arg("/C").arg(trimmed);
        cmd.args(&args);
        cmd
    } else {
        let mut cmd = Command::new(trimmed);
        cmd.args(&args);
        cmd
    };

    process.stdout(Stdio::piped()).stderr(Stdio::piped());

    match process.spawn() {
        Ok(mut child) => match child.wait_with_output() {
            Ok(output) => {
                let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
                let version = if text.is_empty() { stderr.clone() } else { text };
                if output.status.success() || !version.is_empty() {
                    DetectExecutableResult {
                        detected: true,
                        version: Some(version.chars().take(120).collect()),
                        error_message: None,
                    }
                } else {
                    DetectExecutableResult {
                        detected: false,
                        version: None,
                        error_message: Some(if stderr.is_empty() {
                            "未检测到该工具".to_string()
                        } else {
                            stderr
                        }),
                    }
                }
            }
            Err(error) => DetectExecutableResult {
                detected: false,
                version: None,
                error_message: Some(format!("检测失败：{error}")),
            },
        },
        Err(error) => DetectExecutableResult {
            detected: false,
            version: None,
            error_message: Some(format!("检测失败：{error}")),
        },
    }
}
