/**
 * Developed by Bangkit Cerdas Mandiri
 *
 * KONFIGURASI SPREADSHEET
 * Ganti ID di bawah dengan ID Spreadsheet Anda jika diperlukan.
 */
const SPREADSHEET_ID = '1bBnA1YLVOpvbjrxY22JsIhxLrATo7f0D67LRAlbA_Ug';

/**
 * Menambahkan menu khusus di Google Sheets saat file dibuka.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🛠️ Sistem Absensi')
      .addItem('1. Inisialisasi/Buat Sheet Riwayat', 'setupAttendanceSheet')
      .addItem('2. Generate ID Murid Kosong', 'generateMissingIDs')
      .addToUi();
}

/**
 * Fungsi untuk membuat Sheet 'RiwayatAbsensi' jika belum ada.
 */
function setupAttendanceSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let logSheet = ss.getSheetByName("RiwayatAbsensi");
  
  if (!logSheet) {
    logSheet = ss.insertSheet("RiwayatAbsensi");
    const headers = ["ID Siswa", "Nama Siswa", "Kelas", "Tanggal", "Jam", "Status", "Metode"];
    logSheet.appendRow(headers);
    
    // Format Header agar terlihat profesional
    const range = logSheet.getRange(1, 1, 1, 7);
    range.setFontWeight("bold");
    range.setBackground("#2563eb"); 
    range.setFontColor("white");
    range.setHorizontalAlignment("center");
    
    SpreadsheetApp.getUi().alert("Sheet 'RiwayatAbsensi' berhasil dibuat!");
  } else {
    SpreadsheetApp.getUi().alert("Sheet 'RiwayatAbsensi' sudah tersedia.");
  }
}

/**
 * Handle POST: Menerima data Absensi dari Aplikasi dan menyimpannya ke 'RiwayatAbsensi'
 */
function doPost(e) {
  try {
    const body = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    let data = {};
    try {
      data = JSON.parse(body);
    } catch (parseErr) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid JSON payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Basic validation
    if (!data.studentId || !data.name) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Missing required fields: studentId or name' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = ss.getSheetByName("RiwayatAbsensi");

    // Jika sheet belum ada (pengamanan ekstra), buat otomatis
    if (!logSheet) {
      logSheet = ss.insertSheet("RiwayatAbsensi");
      logSheet.appendRow(["ID Siswa", "Nama Siswa", "Kelas", "Tanggal", "Jam", "Status", "Metode"]);
      logSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#f3f3f3");
    }

    // Isi default tanggal/jam jika tidak ada
    const now = new Date();
    const timezone = Session.getScriptTimeZone ? Session.getScriptTimeZone() : 'GMT';
    const dateVal = data.date || Utilities.formatDate(now, timezone, 'yyyy-MM-dd');
    const timeVal = data.time || Utilities.formatDate(now, timezone, 'HH:mm');
    const row = [
      String(data.studentId),
      String(data.name),
      String(data.kelas || ''),
      String(dateVal),
      String(timeVal),
      String(data.type || ''),
      String(data.method || 'Scan')
    ];

    logSheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET: Mengirim data Murid dari tab 'DataSiswa' ke Aplikasi (Digunakan untuk Auto-Sync)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("DataSiswa");
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Sheet 'DataSiswa' tidak ditemukan." }))
             .setMimeType(ContentService.MimeType.JSON);
    }
    
    const values = sheet.getDataRange().getValues();
    const students = [];
    
    // Lewati baris header (i=1)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] && values[i][1]) { // Pastikan ID dan Nama ada
        students.push({
          id: String(values[i][0]),
          name: String(values[i][1]),
          kelas: String(values[i][2] || "-"),
          parent: String(values[i][3] || "Orang Tua"),
          phone: String(values[i][4] || "")
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(students))
           .setMimeType(ContentService.MimeType.JSON);
           
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
           .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi pembantu untuk mengisi ID secara otomatis jika ada baris yang kosong
 */
function generateMissingIDs() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("DataSiswa");
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    // Jika ID kosong tapi Nama ada
    if ((data[i][0] === "" || data[i][0] === null) && data[i][1] !== "") {
      const randomID = "STD-" + Math.floor(100000 + Math.random() * 900000);
      sheet.getRange(i + 1, 1).setValue(randomID);
    }
  }
}