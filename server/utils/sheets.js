const https = require('https');
const url = require('url');

/**
 * Format timestamp in clean Indian Standard Time (IST)
 */
function formatISTDate(date) {
  try {
    const d = date ? new Date(date) : new Date();
    if (isNaN(d.getTime())) return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    return new Date().toISOString();
  }
}

/**
 * Core HTTP dispatcher to Google Apps Script Webhook
 */
const postToSheet = async (payload) => {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[Sheets Notice] GOOGLE_SHEET_WEBHOOK_URL not configured. Skipping sheet sync.');
    return { success: false, message: 'No webhook URL' };
  }

  try {
    const postData = JSON.stringify(payload);

    if (global.fetch) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: postData,
        redirect: 'follow'
      });
      return await response.json().catch(() => ({ success: true }));
    } else {
      return new Promise((resolve, reject) => {
        const executeRequest = (requestUrl, data) => {
          const u = url.parse(requestUrl);
          const reqOptions = {
            hostname: u.hostname,
            path: u.path,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data)
            }
          };

          const req = https.request(reqOptions, (res) => {
            if ([301, 302, 307, 308].includes(res.statusCode)) {
              const redirectUrl = res.headers.location;
              const redirectU = url.parse(redirectUrl);
              const getOptions = {
                hostname: redirectU.hostname,
                path: redirectU.path,
                method: 'GET'
              };
              https.get(getOptions, (getRes) => {
                let body = '';
                getRes.on('data', chunk => body += chunk);
                getRes.on('end', () => {
                  try {
                    resolve(JSON.parse(body));
                  } catch (e) {
                    resolve({ success: true, message: 'Redirect followed.' });
                  }
                });
              }).on('error', (err) => reject(err));
            } else {
              let body = '';
              res.on('data', chunk => body += chunk);
              res.on('end', () => {
                try {
                  resolve(JSON.parse(body));
                } catch (e) {
                  resolve({ success: true });
                }
              });
            }
          });

          req.on('error', (err) => reject(err));
          req.write(data);
          req.end();
        };

        executeRequest(webhookUrl, postData);
      });
    }
  } catch (error) {
    console.error('[Sheets Error] Google Sheet Sync Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 1. SECTION: BOOKINGS (Sheet: 'Bookings' / '🚗 Bookings')
 * Full trip lifecycle dossier
 */
exports.syncBooking = async (booking, eventType = 'Booking Update') => {
  if (!booking) return;

  const timestamp = formatISTDate(new Date());
  const ref = (booking.id || '').toUpperCase();
  const customerName = booking.name || 'Valued Traveler';
  const customerPhone = booking.phone || '';
  const customerEmail = booking.userEmail || booking.email || '';
  const serviceType = booking.serviceType || 'Car Rental';
  const packageName = booking.packageName || '';
  const vehicle = booking.vehicle || '';
  const pickupSchedule = `${booking.pickupDate || ''} ${booking.pickupTime || ''}`.trim() || 'Scheduled';
  const returnDate = booking.returnDate || '';
  const pickupLocation = booking.pickupLocation || '';
  const dropLocation = booking.dropLocation || '';
  const travelers = booking.travelers || '1';
  const status = booking.status || 'Pending';
  const driverName = booking.driverName || (booking.assignedDriver ? booking.assignedDriver.name : '');
  const driverPhone = booking.driverPhone || (booking.assignedDriver ? booking.assignedDriver.phone : '');
  const carAssigned = booking.carModel ? `${booking.carModel} (${booking.carNumber || ''})`.trim() : (booking.carId || '');
  const totalAmount = booking.totalAmount || (booking.invoice ? booking.invoice.totalAmount : '');
  const invoiceNumber = booking.invoiceNumber || (booking.invoice ? booking.invoice.invoiceNumber : '');
  const paymentMethod = booking.paymentMethod || 'Flexible';
  const notes = booking.details || '';

  const headers = [
    'Timestamp (IST)',
    'Booking ID',
    'Event / Action',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Service Type',
    'Tour Package',
    'Vehicle Model',
    'Pickup Schedule',
    'Return Date',
    'Pickup Location',
    'Drop Location / Route',
    'Travelers',
    'Booking Status',
    'Assigned Chauffeur',
    'Chauffeur Phone',
    'Assigned Car Plate',
    'Total Fare (₹)',
    'Invoice Number',
    'Payment Method',
    'Special Notes'
  ];

  const row = [
    timestamp,
    ref,
    eventType,
    customerName,
    customerPhone,
    customerEmail,
    serviceType,
    packageName,
    vehicle,
    pickupSchedule,
    returnDate,
    pickupLocation,
    dropLocation,
    travelers,
    status,
    driverName,
    driverPhone,
    carAssigned,
    totalAmount ? `₹${totalAmount}` : '',
    invoiceNumber,
    paymentMethod,
    notes
  ];

  const payload = {
    sheetName: 'Bookings',
    headers,
    row,
    eventType,
    bookingId: ref,
    name: customerName,
    phone: customerPhone,
    email: customerEmail,
    serviceType,
    packageName,
    vehicle,
    pickupSchedule,
    returnDate,
    pickupLocation,
    dropLocation,
    travelers,
    status,
    driverName,
    driverPhone,
    carModel: booking.carModel || '',
    carNumber: booking.carNumber || '',
    totalAmount,
    invoiceNumber,
    paymentMethod,
    details: notes
  };

  // 1. Post to Bookings Tab
  const res = await postToSheet(payload);

  // 2. Also log to Website Activities Tab
  await exports.syncActivityLog({
    category: 'Bookings',
    action: eventType,
    entityId: ref,
    actorName: customerName,
    actorContact: `${customerPhone} | ${customerEmail}`.trim(),
    details: `${serviceType} (${vehicle}) from ${pickupLocation || 'Guwahati'} to ${dropLocation || packageName || 'Destination'}. Status: ${status}`,
    status
  }).catch(() => {});

  return res;
};

/**
 * 2. SECTION: DRIVERS (Sheet: 'Drivers' / '👨‍✈️ Drivers')
 * Chauffeur partner onboarding, documents, and verification status
 */
exports.syncDriver = async (driver, eventType = 'Driver Update') => {
  if (!driver) return;

  const timestamp = formatISTDate(new Date());
  const driverId = (driver.id || '').toUpperCase();
  const name = driver.name || 'Driver Partner';
  const phone = driver.phone || '';
  const email = driver.email || '';
  const verificationStatus = driver.verificationStatus || 'Pending';
  const license = driver.license || '';
  const aadhar = driver.aadhar || '';
  const licensePhoto = driver.licensePhoto ? (driver.licensePhoto.startsWith('http') ? driver.licensePhoto : 'Uploaded on File') : 'Not Provided';
  const aadharPhoto = driver.aadharPhoto ? (driver.aadharPhoto.startsWith('http') ? driver.aadharPhoto : 'Uploaded on File') : 'Not Provided';
  const role = driver.role || 'driver';
  const regDate = driver.createdAt ? formatISTDate(driver.createdAt) : timestamp;

  const headers = [
    'Timestamp (IST)',
    'Driver ID',
    'Event / Action',
    'Driver Name',
    'Phone / WhatsApp',
    'Email Address',
    'Verification Status',
    'Driving License No.',
    'Aadhar Card No.',
    'License Photo',
    'Aadhar Photo',
    'Role',
    'Registration Date'
  ];

  const row = [
    timestamp,
    driverId,
    eventType,
    name,
    phone,
    email,
    verificationStatus,
    license,
    aadhar,
    licensePhoto,
    aadharPhoto,
    role,
    regDate
  ];

  const payload = {
    sheetName: 'Drivers',
    headers,
    row,
    eventType,
    driverId,
    name,
    phone,
    email,
    verificationStatus,
    license,
    aadhar,
    role
  };

  const res = await postToSheet(payload);

  // Also log into Website Activities
  await exports.syncActivityLog({
    category: 'Driver Management',
    action: eventType,
    entityId: driverId,
    actorName: name,
    actorContact: `${phone} | ${email}`.trim(),
    details: `Driver profile updated. Status: ${verificationStatus}. License: ${license || 'On File'}`,
    status: verificationStatus
  }).catch(() => {});

  return res;
};

/**
 * 3. SECTION: CUSTOMERS (Sheet: 'Customers' / '👥 Customers')
 * Registered customer travelers & accounts
 */
exports.syncCustomer = async (user, eventType = 'Customer Account Update') => {
  if (!user) return;

  const timestamp = formatISTDate(new Date());
  const userId = (user.id || '').toUpperCase();
  const name = user.name || 'Traveler';
  const email = user.email || '';
  const phone = user.phone || 'Not Provided';
  const role = user.role || 'user';
  const regDate = user.createdAt ? formatISTDate(user.createdAt) : timestamp;

  const headers = [
    'Timestamp (IST)',
    'Customer ID',
    'Event / Action',
    'Customer Name',
    'Email Address',
    'Phone Number',
    'Account Role',
    'Registered Date'
  ];

  const row = [
    timestamp,
    userId,
    eventType,
    name,
    email,
    phone,
    role,
    regDate
  ];

  const payload = {
    sheetName: 'Customers',
    headers,
    row,
    eventType,
    userId,
    name,
    email,
    phone,
    role
  };

  const res = await postToSheet(payload);

  // Also log into Website Activities
  await exports.syncActivityLog({
    category: 'Customer Auth',
    action: eventType,
    entityId: userId,
    actorName: name,
    actorContact: `${phone} | ${email}`.trim(),
    details: `Customer account event: ${eventType}`,
    status: 'Success'
  }).catch(() => {});

  return res;
};

/**
 * Backward compatibility wrapper: routes to syncDriver or syncCustomer
 */
exports.syncUserLog = async (user, eventType) => {
  if (!user) return;
  if (user.role === 'driver') {
    return exports.syncDriver(user, eventType);
  } else {
    return exports.syncCustomer(user, eventType);
  }
};

/**
 * 4. SECTION: WEBSITE ACTIVITIES (Sheet: 'Website Activities' / '📋 Website Activities')
 * Real-time unified audit trail of website interactions
 */
exports.syncActivityLog = async (activity) => {
  if (!activity) return;

  const timestamp = formatISTDate(activity.timestamp || new Date());
  const category = activity.category || 'General';
  const action = activity.action || 'Activity Event';
  const entityId = activity.entityId || '';
  const actorName = activity.actorName || 'System';
  const actorContact = activity.actorContact || '';
  const details = activity.details || '';
  const status = activity.status || 'Success';

  const headers = [
    'Timestamp (IST)',
    'Category',
    'Action / Event',
    'Reference ID',
    'Actor Name & Role',
    'Actor Contact',
    'Activity Details',
    'Status'
  ];

  const row = [
    timestamp,
    category,
    action,
    entityId,
    actorName,
    actorContact,
    details,
    status
  ];

  const payload = {
    sheetName: 'Website Activities',
    headers,
    row,
    category,
    action,
    entityId,
    actorName,
    actorContact,
    details,
    status
  };

  return postToSheet(payload);
};

/**
 * 5. SECTION: FLEET (Sheet: 'Fleet' / '🚙 Fleet Vehicles')
 * Fleet inventory, models, plates, and pricing
 */
exports.syncCar = async (car, eventType = 'Fleet Update') => {
  if (!car) return;

  const timestamp = formatISTDate(new Date());
  const carId = (car.id || '').toUpperCase();
  const model = car.model || car.name || 'Vehicle';
  const category = car.category || 'SUV';
  const plateNumber = car.plateNumber || car.number || 'On File';
  const seats = car.seats || '4+1';
  const pricePerDay = car.pricePerDay || car.rate || '';
  const outstationRate = car.outstationRate || '';
  const fuelType = car.fuelType || 'Diesel';
  const transmission = car.transmission || 'Manual';
  const status = car.status || 'available';

  const headers = [
    'Timestamp (IST)',
    'Car ID',
    'Event / Action',
    'Vehicle Model',
    'Category',
    'Number Plate',
    'Seats',
    'Per Day Rate (₹)',
    'Outstation Rate (₹/km)',
    'Fuel Type',
    'Transmission',
    'Availability Status'
  ];

  const row = [
    timestamp,
    carId,
    eventType,
    model,
    category,
    plateNumber,
    seats,
    pricePerDay ? `₹${pricePerDay}` : '',
    outstationRate ? `₹${outstationRate}/km` : '',
    fuelType,
    transmission,
    status
  ];

  const payload = {
    sheetName: 'Fleet',
    headers,
    row,
    eventType,
    carId,
    model,
    category,
    plateNumber,
    seats,
    pricePerDay,
    outstationRate,
    fuelType,
    transmission,
    status
  };

  const res = await postToSheet(payload);

  await exports.syncActivityLog({
    category: 'Fleet Management',
    action: eventType,
    entityId: carId,
    actorName: 'Admin / Fleet Ops',
    actorContact: 'info@rhinovoyage.com',
    details: `${model} (${category}, ${plateNumber}) - Status: ${status}`,
    status
  }).catch(() => {});

  return res;
};

/**
 * 6. BULK FULL-DATABASE SYNC
 * Syncs all past and present database records to the Google Sheet across all tabs
 */
exports.syncAllDataToSheet = async () => {
  const db = require('../config/db');
  console.log('[Sheets] Starting comprehensive database sync to Google Sheets...');
  
  const results = { bookings: 0, drivers: 0, customers: 0, cars: 0 };

  try {
    // 1. Sync Bookings
    const bookings = await db.find('bookings');
    for (const b of bookings) {
      await exports.syncBooking(b, 'Database Full Sync');
      results.bookings++;
    }

    // 2. Sync Users (Drivers and Customers)
    const users = await db.find('users');
    for (const u of users) {
      if (u.role === 'driver') {
        await exports.syncDriver(u, 'Database Full Sync');
        results.drivers++;
      } else if (u.role === 'user') {
        await exports.syncCustomer(u, 'Database Full Sync');
        results.customers++;
      }
    }

    // 3. Sync Cars
    const cars = await db.find('cars');
    for (const c of cars) {
      await exports.syncCar(c, 'Database Full Sync');
      results.cars++;
    }

    // 4. Log the full sync event
    await exports.syncActivityLog({
      category: 'System Admin',
      action: 'Full Database Sync Completed',
      entityId: 'SYNC-ALL',
      actorName: 'RhinoVoyage Operations',
      actorContact: 'info@rhinovoyage.com',
      details: `Full sync finished: ${results.bookings} bookings, ${results.drivers} drivers, ${results.customers} customers, ${results.cars} cars.`,
      status: 'Success'
    });

    console.log(`[Sheets] Full sync successful: ${JSON.stringify(results)}`);
    return { success: true, count: results };
  } catch (err) {
    console.error('[Sheets] Full sync error:', err.message);
    return { success: false, error: err.message };
  }
};
