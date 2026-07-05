use std::{fs, process::Command};

use serde::Serialize;
use tauri::AppHandle;

use crate::{app_sounds_dir, app_storage_dir, database_path};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticInfo {
    pub app_version: String,
    pub os_name: String,
    pub data_dir: String,
    pub database_path: String,
    pub sounds_dir: String,
    pub pets_dir: String,
    pub logs_dir: String,
}

fn logs_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    Ok(app_storage_dir(app)?.join("logs"))
}

#[tauri::command]
pub fn get_diagnostic_info(app: AppHandle) -> Result<DiagnosticInfo, String> {
    let data_dir = app_storage_dir(&app)?;
    let logs = logs_dir(&app)?;
    fs::create_dir_all(&logs).map_err(|error| error.to_string())?;

    Ok(DiagnosticInfo {
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        os_name: std::env::consts::OS.to_string(),
        data_dir: data_dir.to_string_lossy().to_string(),
        database_path: database_path(&app)?.to_string_lossy().to_string(),
        sounds_dir: app_sounds_dir(&app)?.to_string_lossy().to_string(),
        pets_dir: app_storage_dir(&app)?.join("pets").to_string_lossy().to_string(),
        logs_dir: logs.to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub fn open_path_in_explorer(path: String) -> Result<(), String> {
    let target = std::path::Path::new(&path);
    if !target.exists() {
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        } else {
            return Err("路径不存在，无法打开。".to_string());
        }
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|error| format!("打开目录失败：{error}"))?;
        return Ok(());
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|error| format!("打开目录失败：{error}"))?;
        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|error| format!("打开目录失败：{error}"))?;
        return Ok(());
    }

    #[allow(unreachable_code)]
    Err("当前系统暂不支持打开目录。".to_string())
}
