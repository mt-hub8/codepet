use std::sync::Mutex;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager, PhysicalPosition, State, WindowEvent,
};

struct WindowState {
    always_on_top: Mutex<bool>,
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
        .manage(WindowState {
            always_on_top: Mutex::new(false),
        })
        .invoke_handler(tauri::generate_handler![
            start_window_drag,
            get_always_on_top,
            toggle_always_on_top
        ])
        .setup(|app| {
            setup_tray(app.handle())?;
            place_window_near_bottom_right(app.handle())?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("运行 CodePet Tauri 应用失败");
}
