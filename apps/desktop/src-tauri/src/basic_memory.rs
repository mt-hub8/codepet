use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::{chrono_like_now, DbState};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BasicMemoryRecord {
    pub id: String,
    pub memory_type: String,
    pub key: String,
    pub value: String,
    pub source: String,
    pub updated_at: String,
}

fn map_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<BasicMemoryRecord> {
    Ok(BasicMemoryRecord {
        id: row.get(0)?,
        memory_type: row.get(1)?,
        key: row.get(2)?,
        value: row.get(3)?,
        source: row.get(4)?,
        updated_at: row.get(5)?,
    })
}

fn upsert_memory(
    conn: &Connection,
    memory_type: &str,
    key: &str,
    value: &str,
    source: &str,
) -> Result<BasicMemoryRecord, String> {
    let id = format!("{memory_type}-{key}");
    let updated_at = chrono_like_now();
    conn.execute(
        "INSERT INTO basic_memory (id, memory_type, key, value, source, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(id) DO UPDATE SET
           value = excluded.value,
           source = excluded.source,
           updated_at = excluded.updated_at",
        params![id, memory_type, key, value, source, updated_at],
    )
    .map_err(|error| error.to_string())?;

    Ok(BasicMemoryRecord {
        id,
        memory_type: memory_type.to_string(),
        key: key.to_string(),
        value: value.to_string(),
        source: source.to_string(),
        updated_at,
    })
}

#[tauri::command]
pub fn list_basic_memory(db: State<DbState>) -> Result<Vec<BasicMemoryRecord>, String> {
    let conn = db.conn.lock().map_err(|_| "读取基础记忆失败".to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, memory_type, key, value, source, updated_at
             FROM basic_memory ORDER BY updated_at DESC",
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
pub fn save_basic_memory(
    memory_type: String,
    key: String,
    value: String,
    source: String,
    db: State<DbState>,
) -> Result<BasicMemoryRecord, String> {
    if key.trim().is_empty() {
        return Err("记忆 key 不能为空".to_string());
    }
    let conn = db.conn.lock().map_err(|_| "保存基础记忆失败".to_string())?;
    upsert_memory(&conn, &memory_type, &key, &value, &source)
}

#[tauri::command]
pub fn delete_basic_memory(id: String, db: State<DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "删除基础记忆失败".to_string())?;
    conn.execute("DELETE FROM basic_memory WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    Ok(())
}
