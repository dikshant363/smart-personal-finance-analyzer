// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/**
 * Tauri Desktop Shell App Entry point — Smart Personal Finance Analyzer
 * Sprint 11.6: Desktop Experience Platform (DXP)
 */

#[tauri::command]
fn get_system_info() -> String {
    format!(
        "OS: {}, Arch: {}",
        std::env::consts::OS,
        std::env::consts::ARCH
    )
}

#[tauri::command]
fn export_data_to_file(path: String, json_payload: String) -> Result<String, String> {
    use std::fs::File;
    use std::io::Write;
    
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(json_payload.as_bytes()).map_err(|e| e.to_string())?;
    
    Ok(format!("Successfully exported data to {}", path))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            export_data_to_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
