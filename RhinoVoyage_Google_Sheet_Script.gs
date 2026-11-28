/**
 * ==========================================================================
 * RHINOVOYAGE LUXURY TRAVEL & FLEET - GOOGLE APPS SCRIPT WEBHOOK ENGINE
 * ==========================================================================
 * Version: 2.0 (Multi-Tab Professional Enterprise Edition)
 * 
 * INSTRUCTIONS TO CONNECT:
 * 1. Open your Google Sheet (https://sheets.google.com).
 * 2. Click "Extensions" in the top menu -> Select "Apps Script".
 * 3. Delete any code currently in the editor and PASTE this entire script.
 * 4. Click the "Save" icon (or press Ctrl + S).
 * 5. Run the function "setupAllSheetTabs" once to auto-create and style all tabs!
 * 6. Click "Deploy" (top right) -> "New deployment".
 * 7. Click the gear icon next to "Select type" -> choose "Web app".
 * 8. Set:
 *    - Description: "RhinoVoyage Web Sync v2"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (crucial so website can post updates)
 * 9. Click "Deploy" -> "Authorize access" (choose your Google account -> Advanced -> Proceed).
 * 10. Copy the Web App URL (ends with /exec) and ensure it matches GOOGLE_SHEET_WEBHOOK_URL.
 * ==========================================================================
 */

// Theme Constants
var BRAND_GREEN = "#0F382C";
var BRAND_GOLD = "#D4AF37";
var HEADER_TEXT_COLOR = "#FFFFFF";

// Sheet Tab Names (Matched with or without emoji prefixes)
var TABS = {
  BOOKINGS: "🚗 Bookings",
  DRIVERS: "👨‍✈️ Drivers",
  CUSTOMERS: "👥 Customers",
  ACTIVITIES: "📋 Website Activities",
  FLEET: "🚙 Fleet Vehicles"
};

/**
 * Handle incoming POST requests from RhinoVoyage backend & website
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Wait up to 15s to prevent concurrent write collisions
    
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "No POST payload received" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Resolve target tab
    var targetTabName = resolveTabName(payload.sheetName);
    var sheet = getOrCreateTab(ss, targetTabName, payload.headers);

    // Append the row
    var rowData = payload.row;
    if (rowData && Array.isArray(rowData)) {
      sheet.appendRow(rowData);
      
      var lastRow = sheet.getLastRow();
      formatDataRow(sheet, lastRow, targetTabName);
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Synced to " + targetTabName,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.message 
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET requests (verification health-check)
 */
function doGet(e) {
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #071D16; color: #FFFFFF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }' +
    '.card { background: #0F382C; border: 2px solid #D4AF37; border-radius: 16px; padding: 40px; text-align: center; max-width: 480px; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }' +
    'h1 { color: #D4AF37; margin: 0 0 10px 0; font-size: 24px; letter-spacing: 1px; }' +
    'p { color: #E2E8F0; font-size: 14px; line-height: 1.6; }' +
    '.badge { background: #10B981; color: #042F2E; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; display: inline-block; margin-bottom: 20px; }' +
    '</style></head><body>' +
    '<div class="card">' +
    '<div class="badge">● REAL-TIME SYNC OPERATIONAL</div>' +
    '<h1>RHINOVOYAGE GOOGLE SHEETS ENGINE</h1>' +
    '<p>Connected successfully to the RhinoVoyage Platform. Trip bookings, driver partner applications, customer interactions, and audit activities are syncing seamlessly.</p>' +
    '</div></body></html>';
    
  return HtmlService.createHtmlOutput(html).setTitle("RhinoVoyage Sheet Engine Status");
}

/**
 * Resolve tab name mapping (handles aliases and emoji prefixes)
 */
function resolveTabName(name) {
  if (!name) return TABS.BOOKINGS;
  var lower = name.toLowerCase().trim();
  
  if (lower.indexOf("book") !== -1) return TABS.BOOKINGS;
  if (lower.indexOf("driver") !== -1) return TABS.DRIVERS;
  if (lower.indexOf("custom") !== -1 || lower.indexOf("user") !== -1) return TABS.CUSTOMERS;
  if (lower.indexOf("activit") !== -1 || lower.indexOf("log") !== -1) return TABS.ACTIVITIES;
  if (lower.indexOf("fleet") !== -1 || lower.indexOf("car") !== -1) return TABS.FLEET;
  
  return name;
}

/**
 * Get or automatically create and style a tab
 */
function getOrCreateTab(ss, tabName, customHeaders) {
  var sheet = ss.getSheetByName(tabName);
  
  // Also check without emoji
  if (!sheet) {
    var plainName = tabName.replace(/^[^\w\s]+/, "").trim();
    sheet = ss.getSheetByName(plainName);
  }

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    
    // Determine default headers if not provided
    var headers = customHeaders;
    if (!headers || !headers.length) {
      headers = getDefaultHeadersForTab(tabName);
    }
    
    if (headers && headers.length) {
      sheet.appendRow(headers);
      styleHeaderRow(sheet, headers.length);
    }
  } else {
    // If sheet exists but is empty, add headers
    if (sheet.getLastRow() === 0 && customHeaders && customHeaders.length) {
      sheet.appendRow(customHeaders);
      styleHeaderRow(sheet, customHeaders.length);
    }
  }

  return sheet;
}

/**
 * Default headers for each section
 */
function getDefaultHeadersForTab(tabName) {
  if (tabName === TABS.BOOKINGS) {
    return [
      "Timestamp (IST)", "Booking ID", "Event / Action", "Customer Name", "Customer Phone",
      "Customer Email", "Service Type", "Tour Package", "Vehicle Model", "Pickup Schedule",
      "Return Date", "Pickup Location", "Drop Location / Route", "Travelers", "Booking Status",
      "Assigned Chauffeur", "Chauffeur Phone", "Assigned Car Plate", "Total Fare (₹)",
      "Invoice Number", "Payment Method", "Special Notes"
    ];
  }
  if (tabName === TABS.DRIVERS) {
    return [
      "Timestamp (IST)", "Driver ID", "Event / Action", "Driver Name", "Phone / WhatsApp",
      "Email Address", "Verification Status", "Driving License No.", "Aadhar Card No.",
      "License Photo", "Aadhar Photo", "Role", "Registration Date"
    ];
  }
  if (tabName === TABS.CUSTOMERS) {
    return [
      "Timestamp (IST)", "Customer ID", "Event / Action", "Customer Name", "Email Address",
      "Phone Number", "Account Role", "Registered Date"
    ];
  }
  if (tabName === TABS.ACTIVITIES) {
    return [
      "Timestamp (IST)", "Category", "Action / Event", "Reference ID", "Actor Name & Role",
      "Actor Contact", "Activity Details", "Status"
    ];
  }
  if (tabName === TABS.FLEET) {
    return [
      "Timestamp (IST)", "Car ID", "Event / Action", "Vehicle Model", "Category",
      "Number Plate", "Seats", "Per Day Rate (₹)", "Outstation Rate (₹/km)",
      "Fuel Type", "Transmission", "Availability Status"
    ];
  }
  return ["Timestamp (IST)", "Event", "Details"];
}

/**
 * Style the top header row with RhinoVoyage luxury branding
 */
function styleHeaderRow(sheet, numColumns) {
  var headerRange = sheet.getRange(1, 1, 1, numColumns);
  
  headerRange.setBackground(BRAND_GREEN);
  headerRange.setFontColor(HEADER_TEXT_COLOR);
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setFontFamily("Arial");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  headerRange.setWrap(true);
  
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);
  
  // Set bottom border of header to gold
  headerRange.setBorder(null, null, true, null, null, null, BRAND_GOLD, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // Auto-resize columns
  for (var c = 1; c <= numColumns; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Format newly appended data rows (Status badge coloring, alignment, borders)
 */
function formatDataRow(sheet, rowNum, tabName) {
  var numCols = sheet.getLastColumn();
  if (numCols < 1 || rowNum < 2) return;
  
  var rowRange = sheet.getRange(rowNum, 1, 1, numCols);
  rowRange.setFontFamily("Arial");
  rowRange.setFontSize(9.5);
  rowRange.setVerticalAlignment("middle");
  sheet.setRowHeight(rowNum, 26);
  
  // Alternate light zebra row background for effortless scanning
  if (rowNum % 2 === 0) {
    rowRange.setBackground("#FAFCFB");
  } else {
    rowRange.setBackground("#FFFFFF");
  }

  // Scan row values to color code Status badges
  var values = rowRange.getValues()[0];
  for (var c = 0; c < values.length; c++) {
    var val = String(values[c] || "").trim();
    var cell = sheet.getRange(rowNum, c + 1);
    
    // Status column styling
    if (val === "Approved" || val === "Confirmed" || val === "Verified" || val === "Success") {
      cell.setBackground("#DCFCE7");
      cell.setFontColor("#166534");
      cell.setFontWeight("bold");
    } else if (val === "Pending" || val === "Under Review" || val === "In Transit") {
      cell.setBackground("#FEF3C7");
      cell.setFontColor("#92400E");
      cell.setFontWeight("bold");
    } else if (val === "Completed" || val === "Paid") {
      cell.setBackground("#E0E7FF");
      cell.setFontColor("#3730A3");
      cell.setFontWeight("bold");
    } else if (val === "Cancelled" || val === "Rejected" || val === "Failed") {
      cell.setBackground("#FEE2E2");
      cell.setFontColor("#991B1B");
      cell.setFontWeight("bold");
    }
  }
}

/**
 * ONE-CLICK SETUP FUNCTION
 * Run this function inside the Apps Script editor to create & style all 5 tabs immediately!
 */
function setupAllSheetTabs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabsToCreate = [
    TABS.BOOKINGS,
    TABS.DRIVERS,
    TABS.CUSTOMERS,
    TABS.ACTIVITIES,
    TABS.FLEET
  ];

  for (var i = 0; i < tabsToCreate.length; i++) {
    var tabName = tabsToCreate[i];
    var headers = getDefaultHeadersForTab(tabName);
    var sheet = getOrCreateTab(ss, tabName, headers);
    Logger.log("Configured tab: " + tabName);
  }

  // Delete default empty "Sheet1" if custom tabs exist
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }

  SpreadsheetApp.getUi().alert(
    "RhinoVoyage Setup Complete!",
    "All 5 professional tabs (Bookings, Drivers, Customers, Website Activities, Fleet) have been created and styled with luxury branding.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

