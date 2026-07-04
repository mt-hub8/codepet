use std::{
    fs,
    path::{Path, PathBuf},
};

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, State};

use crate::{app_storage_dir, chrono_like_now, DbState};

pub const BUILT_IN_PET_ID: &str = "codepet-default";
const CURRENT_PET_META_KEY: &str = "current_pet_id";

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PetAssetRecord {
    pub id: String,
    pub display_name: String,
    pub description: Option<String>,
    pub source: String,
    pub manifest_path: String,
    pub spritesheet_path: String,
    pub grid_json: String,
    pub animations_json: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PetImportPreview {
    pub folder_path: String,
    pub manifest_path: String,
    pub spritesheet_path: String,
    pub manifest: Value,
}

fn app_pets_dir(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_storage_dir(app)?.join("pets"))
}

fn resolve_import_folder(source_path: &str) -> Result<PathBuf, String> {
    let path = Path::new(source_path);
    if !path.exists() {
        return Err("导入路径不存在，请重新选择。".to_string());
    }

    if path.is_file() {
        let file_name = path
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or("");
        if file_name.eq_ignore_ascii_case("pet.json") {
            return path
                .parent()
                .map(Path::to_path_buf)
                .ok_or_else(|| "无法解析 pet.json 所在目录。".to_string());
        }
        return Err("请选择包含 pet.json 的文件夹，或直接选择 pet.json 文件。".to_string());
    }

    Ok(path.to_path_buf())
}

fn read_manifest(folder: &Path) -> Result<(PathBuf, Value), String> {
    let manifest_path = folder.join("pet.json");
    if !manifest_path.exists() {
        return Err("未找到 pet.json，请确认文件夹中包含 pet.json。".to_string());
    }

    let content =
        fs::read_to_string(&manifest_path).map_err(|_| "读取 pet.json 失败，请检查文件权限。".to_string())?;
    let manifest: Value = serde_json::from_str(&content)
        .map_err(|_| "pet.json 格式错误，请检查 JSON 语法。".to_string())?;

    Ok((manifest_path, manifest))
}

fn validate_manifest(manifest: &Value) -> Result<(String, String, String), String> {
    let id = manifest
        .get("id")
        .and_then(|value| value.as_str())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "pet.json 缺少必填字段 id。".to_string())?;

    if id.contains("..") || id.contains('/') || id.contains('\\') {
        return Err("宠物 id 不能包含路径分隔符。".to_string());
    }

    if id == BUILT_IN_PET_ID {
        return Err("该 id 为 CodePet 内置保留 id，请更换宠物 id。".to_string());
    }

    let display_name = manifest
        .get("displayName")
        .or_else(|| manifest.get("name"))
        .and_then(|value| value.as_str())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "pet.json 缺少必填字段 displayName（或 name）。".to_string())?;

    let spritesheet_path = manifest
        .get("spritesheetPath")
        .and_then(|value| value.as_str())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "pet.json 缺少必填字段 spritesheetPath。".to_string())?;

    let extension = Path::new(spritesheet_path)
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_lowercase();
    if !["png", "webp"].contains(&extension.as_str()) {
        return Err("spritesheet 仅支持 png 或 webp 格式。".to_string());
    }

    Ok((
        id.to_string(),
        display_name.to_string(),
        spritesheet_path.to_string(),
    ))
}

fn resolve_spritesheet(folder: &Path, spritesheet_rel: &str) -> Result<PathBuf, String> {
    let spritesheet_path = folder.join(spritesheet_rel);
    if !spritesheet_path.exists() {
        return Err(format!(
            "找不到 spritesheet 文件：{}，请确认 pet.json 中的 spritesheetPath 正确。",
            spritesheet_rel
        ));
    }
    if !spritesheet_path.is_file() {
        return Err("spritesheetPath 必须指向图片文件。".to_string());
    }
    Ok(spritesheet_path)
}

fn map_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<PetAssetRecord> {
    Ok(PetAssetRecord {
        id: row.get(0)?,
        display_name: row.get(1)?,
        description: row.get(2)?,
        source: row.get(3)?,
        manifest_path: row.get(4)?,
        spritesheet_path: row.get(5)?,
        grid_json: row.get(6)?,
        animations_json: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
    })
}

fn pet_exists(conn: &Connection, id: &str) -> Result<bool, String> {
    conn.query_row(
        "SELECT 1 FROM pet_assets WHERE id = ?1",
        params![id],
        |_| Ok(()),
    )
    .optional()
    .map(|value| value.is_some())
    .map_err(|error| error.to_string())
}

fn reset_current_pet_if_needed(conn: &Connection, deleted_id: &str) -> Result<(), String> {
    let current: Option<String> = conn
        .query_row(
            "SELECT value FROM app_meta WHERE key = ?1",
            params![CURRENT_PET_META_KEY],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;

    if current.as_deref() == Some(deleted_id) {
        conn.execute("DELETE FROM app_meta WHERE key = ?1", params![CURRENT_PET_META_KEY])
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn preview_pet_import(source_path: String) -> Result<PetImportPreview, String> {
    let folder = resolve_import_folder(&source_path)?;
    let (manifest_path, manifest) = read_manifest(&folder)?;
    let (_, _, spritesheet_rel) = validate_manifest(&manifest)?;
    let spritesheet_path = resolve_spritesheet(&folder, &spritesheet_rel)?;

    Ok(PetImportPreview {
        folder_path: folder.to_string_lossy().to_string(),
        manifest_path: manifest_path.to_string_lossy().to_string(),
        spritesheet_path: spritesheet_path.to_string_lossy().to_string(),
        manifest,
    })
}

#[tauri::command]
pub fn import_pet_asset(
    app: AppHandle,
    db: State<DbState>,
    source_folder: String,
    grid_json: String,
    animations_json: String,
) -> Result<PetAssetRecord, String> {
    let folder = resolve_import_folder(&source_folder)?;
    let (_, manifest) = read_manifest(&folder)?;
    let (id, display_name, spritesheet_rel) = validate_manifest(&manifest)?;
    let source_spritesheet = resolve_spritesheet(&folder, &spritesheet_rel)?;

    if grid_json.trim().is_empty() {
        return Err("缺少 grid 配置，无法导入。".to_string());
    }
    if animations_json.trim().is_empty() {
        return Err("缺少 animations 配置，无法导入。".to_string());
    }

    let conn = db.conn.lock().map_err(|_| "保存宠物素材失败".to_string())?;
    if pet_exists(&conn, &id)? {
        return Err(format!("宠物 id「{id}」已存在，请修改 pet.json 中的 id 或删除旧记录。"));
    }

    let pets_dir = app_pets_dir(&app)?;
    let target_dir = pets_dir.join(&id);
    if target_dir.exists() {
        return Err("目标目录已存在，导入失败。请先删除旧记录后重试。".to_string());
    }
    fs::create_dir_all(&target_dir).map_err(|_| "创建宠物目录失败，请检查磁盘权限。".to_string())?;

    let target_manifest = target_dir.join("pet.json");
    let target_spritesheet = target_dir.join(&spritesheet_rel);
    if target_spritesheet
        .parent()
        .is_some_and(|parent| parent != target_dir)
    {
        let _ = fs::remove_dir_all(&target_dir);
        return Err("spritesheetPath 不能包含子目录。".to_string());
    }

    if let Err(error) = fs::copy(folder.join("pet.json"), &target_manifest) {
        let _ = fs::remove_dir_all(&target_dir);
        return Err(format!("复制 pet.json 失败：{error}"));
    }
    if let Err(error) = fs::copy(&source_spritesheet, &target_spritesheet) {
        let _ = fs::remove_dir_all(&target_dir);
        return Err(format!("复制 spritesheet 失败：{error}"));
    }

    let description = manifest
        .get("description")
        .and_then(|value| value.as_str())
        .map(str::to_string);
    let now = chrono_like_now();
    let record = PetAssetRecord {
        id: id.clone(),
        display_name,
        description,
        source: "user_imported".to_string(),
        manifest_path: target_manifest.to_string_lossy().to_string(),
        spritesheet_path: target_spritesheet.to_string_lossy().to_string(),
        grid_json,
        animations_json,
        created_at: now.clone(),
        updated_at: now,
    };

    if let Err(error) = conn.execute(
        "INSERT INTO pet_assets
        (id, display_name, description, source, manifest_path, spritesheet_path, grid_json, animations_json, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            record.id,
            record.display_name,
            record.description,
            record.source,
            record.manifest_path,
            record.spritesheet_path,
            record.grid_json,
            record.animations_json,
            record.created_at,
            record.updated_at
        ],
    ) {
        let _ = fs::remove_dir_all(&target_dir);
        return Err(format!("保存宠物记录失败：{error}"));
    }

    Ok(record)
}

#[tauri::command]
pub fn list_pet_assets(db: State<DbState>) -> Result<Vec<PetAssetRecord>, String> {
    let conn = db.conn.lock().map_err(|_| "读取宠物列表失败".to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, display_name, description, source, manifest_path, spritesheet_path, grid_json, animations_json, created_at, updated_at
             FROM pet_assets ORDER BY created_at DESC",
        )
        .map_err(|error| error.to_string())?;

    let rows = stmt
        .query_map([], map_row)
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;

    Ok(rows)
}

#[tauri::command]
pub fn delete_pet_asset(app: AppHandle, id: String, db: State<DbState>) -> Result<(), String> {
    if id == BUILT_IN_PET_ID {
        return Err("内置默认宠物不能删除。".to_string());
    }

    let conn = db.conn.lock().map_err(|_| "删除宠物失败".to_string())?;
    let exists = pet_exists(&conn, &id)?;
    if !exists {
        return Err("宠物记录不存在或已被删除。".to_string());
    }

    reset_current_pet_if_needed(&conn, &id)?;
    conn.execute("DELETE FROM pet_assets WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;

    let target_dir = app_pets_dir(&app)?.join(&id);
    if target_dir.exists() {
        fs::remove_dir_all(&target_dir).map_err(|_| "删除宠物文件失败，请检查文件权限。")?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_current_pet_id(db: State<DbState>) -> Result<Option<String>, String> {
    let conn = db.conn.lock().map_err(|_| "读取当前宠物失败".to_string())?;
    conn.query_row(
        "SELECT value FROM app_meta WHERE key = ?1",
        params![CURRENT_PET_META_KEY],
        |row| row.get(0),
    )
    .optional()
    .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_current_pet_id(id: Option<String>, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "设置当前宠物失败".to_string())?;

    if let Some(pet_id) = &id {
        if pet_id == BUILT_IN_PET_ID {
            conn.execute("DELETE FROM app_meta WHERE key = ?1", params![CURRENT_PET_META_KEY])
                .map_err(|error| error.to_string())?;
            return Ok(());
        }
        if !pet_exists(&conn, pet_id)? {
            return Err("所选宠物不存在，可能已被删除。".to_string());
        }
        conn.execute(
            "INSERT INTO app_meta (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![CURRENT_PET_META_KEY, pet_id],
        )
        .map_err(|error| error.to_string())?;
        return Ok(());
    }

    conn.execute("DELETE FROM app_meta WHERE key = ?1", params![CURRENT_PET_META_KEY])
        .map_err(|error| error.to_string())?;
    Ok(())
}
