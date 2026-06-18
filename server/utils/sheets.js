const https = require('https');
const url = require('url');

const postToSheet = async (payload) => {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    const postData = JSON.stringify(payload);

    if (global.fetch) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: postData
      });
      return await response.json();
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
            if (res.statusCode === 302 || res.statusCode === 301 || res.statusCode === 307 || res.statusCode === 308) {
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
                    resolve({ success: true, message: 'Redirect followed, response read.' });
                  }
                });
              }).on('error', (err) => {
                reject(err);
              });
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
    console.error('Google Sheet Sync Error:', error.message);
  }
};

exports.syncUserLog = async (user, eventType) => {
  const payload = {
    sheetName: 'UserLogs',
    eventType,
    name: user.name,
    email: user.email,
    phone: user.phone || 'N/A',
    role: user.role,
    aadhar: user.aadhar || '',
    license: user.license || '',
    verificationStatus: user.verificationStatus || ''
  };
  return postToSheet(payload);
};

exports.syncBooking = async (booking, eventType) => {
  const payload = {
    sheetName: 'Bookings',
    eventType,
    bookingId: booking.id,
    name: booking.name,
    phone: booking.phone,
    serviceType: booking.serviceType,
    vehicle: booking.vehicle,
    details: booking.details || '',
    status: booking.status,
    userId: booking.userId,
    driverId: booking.driverId || '',
    driverName: booking.driverName || ''
  };
  return postToSheet(payload);
};
