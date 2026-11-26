/**
 * RhinoVoyage Email Notification Service powered by Brevo (Sendinblue) REST API v3
 * Free Tier: 300 emails/day
 * Endpoint: POST https://api.brevo.com/v3/smtp/email
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Base layout template for luxury RhinoVoyage emails
function wrapEmailHtml({ title, preheader = '', contentHtml, actionUrl = '', actionText = '' }) {
  const brandGreen = '#0f382c';
  const brandDark = '#071d16';
  const brandGold = '#d4af37';
  const currentYear = new Date().getFullYear();

  const buttonHtml = (actionUrl && actionText) ? `
    <div style="text-align: center; margin: 36px 0 24px 0;">
      <a href="${actionUrl}" style="background: linear-gradient(135deg, ${brandGreen} 0%, #1a5742 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 15px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(15, 56, 44, 0.25);">
        ${actionText} &rarr;
      </a>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d3748; line-height: 1.6; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8;">
  <span style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; mso-hide: all;">
    ${preheader || title}
  </span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table role="presentation" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e8ecf1;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandDark} 0%, ${brandGreen} 100%); padding: 36px 32px; text-align: center; border-bottom: 3px solid ${brandGold};">
              <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                RHINO<span style="color: ${brandGold};">VOYAGE</span>
              </div>
              <div style="font-size: 11px; letter-spacing: 3px; color: #b7d6cb; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
                Premium Northeast Journeys & Rentals
              </div>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 40px 36px;">
              ${contentHtml}
              ${buttonHtml}
            </td>
          </tr>

          <!-- Help / Concierge Notice -->
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <div style="background-color: #f7faf9; border-left: 4px solid ${brandGreen}; border-radius: 8px; padding: 16px 20px; font-size: 13px; color: #4a5568;">
                <strong style="color: ${brandGreen};">Need assistance?</strong> Our luxury concierge is available 24/7.<br>
                Reply directly to this email or reach us at <a href="mailto:info@rhinovoyage.com" style="color: ${brandGreen}; text-decoration: underline; font-weight: 600;">info@rhinovoyage.com</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #edf2f7; font-size: 12px; color: #718096;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #4a5568;">
                RhinoVoyage Travel & Car Rental Operations
              </p>
              <p style="margin: 0 0 10px 0;">
                Guwahati &bull; Kaziranga &bull; Shillong &bull; All Northeast India
              </p>
              <p style="margin: 0; font-size: 11px; color: #a0aec0;">
                &copy; ${currentYear} RhinoVoyage. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Core function to send transactional email via Brevo REST API v3
 */
async function sendBrevoEmail({ to, toName = '', subject, htmlContent, textContent = '' }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM || 'info@rhinovoyage.com';
  const senderName = process.env.EMAIL_FROM_NAME || 'RhinoVoyage';

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('PASTE_YOUR_BREVO_API_KEY')) {
    console.warn(`[RhinoVoyage Mailer] Brevo API Key not configured. Simulated email to: ${to} | Subject: "${subject}"`);
    return {
      success: true,
      simulated: true,
      message: 'Email simulated because BREVO_API_KEY is not set in server/.env'
    };
  }

  if (!to || !to.includes('@')) {
    console.warn(`[RhinoVoyage Mailer] Invalid recipient email address: "${to}"`);
    return { success: false, message: 'Invalid recipient email' };
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: to.trim().toLowerCase(),
        name: toName || to.split('@')[0]
      }
    ],
    subject,
    htmlContent,
    textContent: textContent || subject
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey.trim(),
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`[RhinoVoyage Mailer] Brevo API Error (${response.status}):`, data);
      return {
        success: false,
        status: response.status,
        error: data.message || 'Failed to dispatch email via Brevo API'
      };
    }

    console.log(`[RhinoVoyage Mailer] Email dispatched successfully to ${to}. MessageId: ${data.messageId || 'OK'}`);
    return {
      success: true,
      messageId: data.messageId
    };
  } catch (error) {
    console.error('[RhinoVoyage Mailer] Network or Dispatch Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 1. Send Welcome Email upon registration with complete user details
 */
async function sendWelcomeEmail(user) {
  if (!user || !user.email) return;

  const isDriver = user.role === 'driver';
  const userName = user.name || (isDriver ? 'Driver Partner' : 'Valued Traveler');
  const userPhone = user.phone || 'Not specified';
  const userRef = user.id ? user.id.toUpperCase() : `RV-${Math.floor(100000 + Math.random() * 900000)}`;
  const regDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subject = isDriver 
    ? 'Official Driver Partner Registration Details — RhinoVoyage 🚗'
    : 'Welcome to RhinoVoyage — Your Account Registration Details 🌿';

  const detailsTable = isDriver ? `
    <div style="background: #ffffff; border: 1px solid #d4dfdb; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <div style="background: #0f382c; color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
        DRIVER PARTNER REGISTRATION DOSSIER
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096; width: 42%;">Full Legal Name</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${userName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Registered Email</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${user.email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">WhatsApp / Mobile</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${userPhone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Driving License No.</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${user.license || 'Provided on File'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Aadhar Card No.</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${user.aadhar ? `${user.aadhar.substring(0, 4)} XXXX ${user.aadhar.substring(user.aadhar.length - 4)}` : 'Provided on File'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Partner Reference</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">#${userRef}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Registration Date</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${regDate}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; color: #718096;">Verification Status</td>
          <td style="padding: 12px 20px;">
            <span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; text-transform: uppercase;">
              Pending Fleet Review
            </span>
          </td>
        </tr>
      </table>
    </div>
  ` : `
    <div style="background: #ffffff; border: 1px solid #d4dfdb; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <div style="background: #0f382c; color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
        TRAVELER MEMBERSHIP DETAILS
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096; width: 42%;">Member Name</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${userName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Registered Email</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${user.email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Contact Phone</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${userPhone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Membership Tier</td>
          <td style="padding: 12px 20px; color: #0f382c; font-weight: 700;">Valued Traveler &bull; VIP Member</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Member Reference ID</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">#${userRef}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; color: #718096;">Joined On</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${regDate}</td>
        </tr>
      </table>
    </div>
  `;

  const contentHtml = isDriver ? `
    <h2 style="margin-top: 0; color: #0f382c; font-size: 22px; font-weight: 700;">Welcome to the RhinoVoyage Fleet Family, ${userName}!</h2>
    <p style="color: #4a5568; font-size: 15px;">Your driver partner registration has been recorded successfully. Below are the details of your registered profile:</p>
    
    ${detailsTable}

    <div style="background: #f7faf8; border-left: 4px solid #0f382c; border-radius: 8px; padding: 16px 20px; margin: 20px 0; font-size: 14px; color: #2d3748;">
      <strong>Next Steps for Dispatch:</strong> Our fleet operations team will review your submitted Aadhar card and driving license photos within 24 hours. Once verified, you will immediately begin receiving trip assignments across Assam and Northeast India.
    </div>

    <p style="color: #4a5568; font-size: 14px;">Sign in to your Driver Portal anytime to track approval status, active journeys, and trip payouts:</p>
  ` : `
    <h2 style="margin-top: 0; color: #0f382c; font-size: 22px; font-weight: 700;">Welcome to RhinoVoyage, ${userName}!</h2>
    <p style="color: #4a5568; font-size: 15px;">Your account has been created successfully. Below are the details of your new traveler membership:</p>
    
    ${detailsTable}

    <div style="background: #f7faf8; border: 1px solid #d4dfdb; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin-top: 0; font-size: 15px; color: #0f382c; text-transform: uppercase; letter-spacing: 0.5px;">Your Traveler Privileges:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
        <li><strong>Bespoke Holiday Packages:</strong> Kaziranga wildlife safaris, Meghalaya waterfalls, Shillong, and Tawang tours.</li>
        <li><strong>Premium Fleet Bookings:</strong> Executive Sedans, Innova Crysta, Fortuner, and Tempo Travelers.</li>
        <li><strong>Live Updates & Invoices:</strong> Real-time booking status, driver dispatch alerts, and downloadable invoices.</li>
      </ul>
    </div>

    <p style="color: #4a5568; font-size: 14px;">Visit your personalized dashboard to manage your upcoming adventures:</p>
  `;

  const dashboardUrl = isDriver 
    ? 'https://rhinovoyage.com/driver-dashboard.html'
    : 'https://rhinovoyage.com/user-dashboard.html';

  const html = wrapEmailHtml({
    title: subject,
    preheader: isDriver ? `Driver Partner registration received for ${userName}. Review credentials.` : `Your RhinoVoyage traveler account is ready. Details inside.`,
    contentHtml,
    actionUrl: dashboardUrl,
    actionText: isDriver ? 'Access Driver Portal' : 'Open My Dashboard'
  });

  return sendBrevoEmail({
    to: user.email,
    toName: userName,
    subject,
    htmlContent: html
  });
}

/**
 * 2. Send Admin Notification Email when someone joins the platform
 */
async function sendAdminNewUserAlert(user) {
  if (!user) return;

  const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'rhinovoyage@gmail.com';
  const isDriver = user.role === 'driver';
  const userName = user.name || 'New Member';
  const userPhone = user.phone || 'Not provided';
  const userRole = isDriver ? 'Driver Partner' : 'Traveler';
  const userRef = user.id ? user.id.toUpperCase() : `RV-${Math.floor(100000 + Math.random() * 900000)}`;
  const regDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const subject = `🔔 New ${userRole} Registered: ${userName} — RhinoVoyage Platform`;

  const detailsTable = isDriver ? `
    <div style="background: #ffffff; border: 1px solid #d4dfdb; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <div style="background: #0f382c; color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 14px;">
        NEW DRIVER PARTNER APPLICATION
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096; width: 40%;">Name</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 700;">${userName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Email Address</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${user.email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">WhatsApp / Mobile</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${userPhone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Driving License No.</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${user.license || 'Provided on File'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Aadhar Card No.</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${user.aadhar || 'Provided on File'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Documents Uploaded</td>
          <td style="padding: 12px 20px; color: #166534; font-weight: 600;">Aadhar Card & Driving License Photos Uploaded</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Partner Reference</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">#${userRef}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; color: #718096;">Registration Timestamp</td>
          <td style="padding: 12px 20px; color: #2d3748;">${regDate} (IST)</td>
        </tr>
      </table>
    </div>
    <p style="color: #4a5568; font-size: 14px;"><strong>Action Required:</strong> Please log in to the Admin Operations Dashboard to verify documents and approve this driver partner.</p>
  ` : `
    <div style="background: #ffffff; border: 1px solid #d4dfdb; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <div style="background: #0f382c; color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 14px;">
        NEW TRAVELER REGISTRATION DOSSIER
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096; width: 40%;">Name</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 700;">${userName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Email Address</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${user.email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Contact Phone</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${userPhone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Role</td>
          <td style="padding: 12px 20px; color: #0f382c; font-weight: 700;">Traveler / Customer</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Member ID</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">#${userRef}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; color: #718096;">Registration Timestamp</td>
          <td style="padding: 12px 20px; color: #2d3748;">${regDate} (IST)</td>
        </tr>
      </table>
    </div>
  `;

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f382c; font-size: 22px; font-weight: 700;">New ${userRole} Registered!</h2>
    <p style="color: #4a5568; font-size: 15px;">A new account was just created on the RhinoVoyage platform. Below are the submitted details:</p>
    ${detailsTable}
  `;

  const html = wrapEmailHtml({
    title: subject,
    preheader: `New ${userRole} ${userName} registered on RhinoVoyage. Review details.`,
    contentHtml,
    actionUrl: 'https://rhinovoyage.com/admin-dashboard.html',
    actionText: 'Open Admin Dashboard'
  });

  return sendBrevoEmail({
    to: adminEmail,
    toName: 'RhinoVoyage Operations',
    subject,
    htmlContent: html
  });
}

/**
 * 2. Send Booking Request Confirmation (sent to customer upon booking creation)
 */
async function sendBookingReceivedEmail(booking) {
  const recipientEmail = booking.userEmail || booking.email;
  if (!recipientEmail) return { success: false, message: 'No recipient email' };

  const ref = (booking.id || '').toUpperCase().substring(0, 8);
  const customerName = booking.name || 'Valued Traveler';
  const subject = `Booking Request Received #${ref} — RhinoVoyage`;

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f382c; font-size: 22px; font-weight: 700;">We've Received Your Booking Request!</h2>
    <p style="color: #4a5568; font-size: 15px;">Dear <strong>${customerName}</strong>, thank you for choosing RhinoVoyage. Our operations team is currently reviewing your journey schedule and preparing the vehicle.</p>
    
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <div style="background: #0f382c; color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
        JOURNEY SUMMARY &bull; REF #${ref}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096; width: 40%;">Service / Trip</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.serviceType || 'Chauffeured Rental'} ${booking.packageName ? `(${booking.packageName})` : ''}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Vehicle Type</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.vehicle || 'Standard Vehicle'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Pickup Date & Time</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupDate || 'Scheduled'} &bull; ${booking.pickupTime || 'Morning'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Pickup Location</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupLocation || 'Guwahati'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Destination / Route</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.dropLocation || booking.packageName || 'As requested'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; color: #718096;">Current Status</td>
          <td style="padding: 12px 20px;">
            <span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; text-transform: uppercase;">
              ${booking.status || 'Pending'}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <p style="color: #4a5568; font-size: 14px;">We will notify you immediately once your booking is confirmed and a dedicated chauffeur is assigned.</p>
  `;

  const html = wrapEmailHtml({
    title: subject,
    preheader: `Booking #${ref} received. Our concierge is preparing your journey.`,
    contentHtml,
    actionUrl: 'https://rhinovoyage.com/user-dashboard.html',
    actionText: 'View Booking Status'
  });

  return sendBrevoEmail({
    to: recipientEmail,
    toName: customerName,
    subject,
    htmlContent: html
  });
}

/**
 * Send Admin New Booking Alert
 */
async function sendAdminNewBookingAlert(booking) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'rhinovoyage@gmail.com';
  const ref = (booking.id || '').toUpperCase().substring(0, 8);
  const customerName = booking.name || 'Traveler';
  const subject = `🔔 New Booking Request #${ref} from ${customerName} — RhinoVoyage`;

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f382c; font-size: 22px; font-weight: 700;">New Journey Reservation #${ref}</h2>
    <p style="color: #4a5568; font-size: 15px;">A new booking request has been submitted. Review journey details below:</p>
    
    <div style="background: #ffffff; border: 1px solid #d4dfdb; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <div style="background: #0f382c; color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 14px;">
        BOOKING DOSSIER &bull; REF #${ref}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096; width: 40%;">Customer Name</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 700;">${customerName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Customer Email</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.userEmail || booking.email || 'Not provided'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Customer Phone</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.phone || 'Not provided'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Pickup Schedule</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupDate} &bull; ${booking.pickupTime || 'Morning'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Route</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupLocation || 'Guwahati'} &rarr; ${booking.dropLocation || booking.packageName || 'Destination'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Vehicle / Service</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.vehicle} (${booking.serviceType})</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; color: #718096;">Payment Method</td>
          <td style="padding: 12px 20px; color: #0f382c; font-weight: 700;">${booking.paymentMethod || 'Flexible'}</td>
        </tr>
      </table>
    </div>

    <p style="color: #4a5568; font-size: 14px;"><strong>Action Required:</strong> Log in to the Admin Dashboard to assign an available chauffeur and confirm the reservation.</p>
  `;

  const html = wrapEmailHtml({
    title: subject,
    preheader: `New booking request #${ref} received from ${customerName}.`,
    contentHtml,
    actionUrl: 'https://rhinovoyage.com/admin-dashboard.html',
    actionText: 'Assign Driver & Approve'
  });

  return sendBrevoEmail({
    to: adminEmail,
    toName: 'RhinoVoyage Operations',
    subject,
    htmlContent: html
  });
}

/**
 * 3. Send Booking Status Update (Approved, Completed, Cancelled)
 */
async function sendBookingStatusEmail(booking, status) {
  const recipientEmail = booking.userEmail || booking.email;
  if (!recipientEmail) return;

  const ref = (booking.id || '').toUpperCase().substring(0, 8);
  const customerName = booking.name || 'Valued Traveler';

  let subject = `Booking Update #${ref} — RhinoVoyage`;
  let statusBadgeColor = '#fef3c7';
  let statusBadgeText = '#92400e';
  let messageContent = '';

  if (status === 'Approved') {
    subject = `Booking Confirmed! 🎉 #${ref} — RhinoVoyage`;
    statusBadgeColor = '#dcfce7';
    statusBadgeText = '#166534';
    messageContent = `
      <p style="color: #4a5568; font-size: 15px;">Great news, <strong>${customerName}</strong>! Your booking for <strong>${booking.dropLocation || booking.packageName || 'your upcoming trip'}</strong> has been officially confirmed.</p>
      <p style="color: #4a5568; font-size: 14px;">Your luxury vehicle and professional chauffeur are reserved for <strong>${booking.pickupDate}</strong> at <strong>${booking.pickupTime || 'scheduled time'}</strong>.</p>
    `;
  } else if (status === 'Completed') {
    const invNumber = booking.invoice ? booking.invoice.invoiceNumber : `INV-${ref}`;
    const totalAmount = booking.invoice ? `₹${booking.invoice.totalAmount}` : (booking.totalAmount ? `₹${booking.totalAmount}` : 'Paid');
    subject = `Journey Completed & Invoice Ready #${ref} — RhinoVoyage`;
    statusBadgeColor = '#e0e7ff';
    statusBadgeText = '#3730a3';
    messageContent = `
      <p style="color: #4a5568; font-size: 15px;">Dear <strong>${customerName}</strong>, we hope you had a safe and memorable journey with RhinoVoyage.</p>
      <p style="color: #4a5568; font-size: 14px;">Your official trip invoice has been generated. You can view or download the itemized invoice directly from your traveler dashboard.</p>
      
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 14px 18px; margin: 18px 0; font-size: 14px;">
        <strong>Invoice Number:</strong> ${invNumber}<br>
        <strong>Total Amount:</strong> <span style="font-size: 16px; font-weight: 700; color: #0f382c;">${totalAmount}</span><br>
        <strong>Payment Status:</strong> <span style="color: #166534; font-weight: 700;">Paid</span>
      </div>
    `;
  } else if (status === 'Cancelled') {
    subject = `Booking Cancelled #${ref} — RhinoVoyage`;
    statusBadgeColor = '#fee2e2';
    statusBadgeText = '#991b1b';
    messageContent = `
      <p style="color: #4a5568; font-size: 15px;">Dear <strong>${customerName}</strong>, your booking #${ref} for ${booking.pickupDate} has been cancelled.</p>
      <p style="color: #4a5568; font-size: 14px;">If you did not request this cancellation or if you have questions regarding refunds, please contact our 24/7 concierge right away.</p>
    `;
  }

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f382c; font-size: 22px; font-weight: 700;">Trip Status: ${status}</h2>
    ${messageContent}

    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <div style="background: #0f382c; color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 14px;">
        TRIP DETAILS &bull; REF #${ref}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096; width: 40%;">Vehicle</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.vehicle || 'Standard'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Date</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupDate || 'Scheduled'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Route</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupLocation || 'Guwahati'} &rarr; ${booking.dropLocation || booking.packageName || 'Trip Destination'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; color: #718096;">Status</td>
          <td style="padding: 12px 20px;">
            <span style="background: ${statusBadgeColor}; color: ${statusBadgeText}; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; text-transform: uppercase;">
              ${status}
            </span>
          </td>
        </tr>
      </table>
    </div>
  `;

  const html = wrapEmailHtml({
    title: subject,
    preheader: `Booking #${ref} status updated to ${status}.`,
    contentHtml,
    actionUrl: 'https://rhinovoyage.com/user-dashboard.html',
    actionText: 'Open Dashboard'
  });

  return sendBrevoEmail({
    to: recipientEmail,
    toName: customerName,
    subject,
    htmlContent: html
  });
}

/**
 * 4. Send Driver Trip Dispatch Email (sent to driver when assigned to a journey)
 */
async function sendDriverTripDispatchEmail(driver, booking) {
  if (!driver || !driver.email) return;

  const ref = (booking.id || '').toUpperCase().substring(0, 8);
  const driverName = driver.name || 'Driver Partner';
  const subject = `New Trip Assigned #${ref} — RhinoVoyage Fleet`;

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f382c; font-size: 22px; font-weight: 700;">New Journey Assigned, ${driverName}! 🛣️</h2>
    <p style="color: #4a5568; font-size: 15px;">You have been assigned as the official chauffeur for journey <strong>#${ref}</strong>.</p>
    
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <div style="background: #0f382c; color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 14px;">
        ASSIGNED JOURNEY SPECIFICATIONS
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096; width: 40%;">Customer Name</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.name || 'Guest Traveler'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Pickup Date & Time</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupDate} &bull; ${booking.pickupTime || '08:00 AM'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Pickup Location</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupLocation || 'Guwahati'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Drop Destination</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.dropLocation || booking.packageName || 'Tour Destination'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Vehicle Type</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.vehicle}</td>
        </tr>
      </table>
    </div>

    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 14px 18px; margin: 18px 0; font-size: 13px; color: #1e40af;">
      <strong>Driver Privacy Notice:</strong> Per safety regulations, customer contact numbers unlock automatically 2 hours prior to scheduled departure on your Driver Portal.
    </div>

    <p style="color: #4a5568; font-size: 14px;">Please open your Driver Dashboard to review and accept the journey:</p>
  `;

  const html = wrapEmailHtml({
    title: subject,
    preheader: `New Trip #${ref} assigned to you. Review on Driver Portal.`,
    contentHtml,
    actionUrl: 'https://rhinovoyage.com/driver-dashboard.html',
    actionText: 'Open Driver Portal'
  });

  return sendBrevoEmail({
    to: driver.email,
    toName: driverName,
    subject,
    htmlContent: html
  });
}

/**
 * 5. Send Customer notification that driver is assigned
 */
async function sendCustomerDriverAssignedEmail(booking, driver) {
  const recipientEmail = booking.userEmail || booking.email;
  if (!recipientEmail) return;

  const ref = (booking.id || '').toUpperCase().substring(0, 8);
  const customerName = booking.name || 'Valued Traveler';
  const driverName = driver ? driver.name : (booking.driverName || 'RhinoVoyage Executive Chauffeur');
  const subject = `Driver Assigned for Your Journey #${ref} 🚗 — RhinoVoyage`;

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f382c; font-size: 22px; font-weight: 700;">Your Chauffeur Has Been Assigned!</h2>
    <p style="color: #4a5568; font-size: 15px;">Dear <strong>${customerName}</strong>, your designated driver for journey #${ref} has been dispatched.</p>
    
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <div style="background: #0f382c; color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 14px;">
        CHAUFFEUR & VEHICLE DETAILS
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096; width: 40%;">Assigned Chauffeur</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 700;">${driverName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Vehicle</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.vehicle}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 20px; color: #718096;">Pickup Schedule</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupDate} &bull; ${booking.pickupTime || 'Morning'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; color: #718096;">Pickup Point</td>
          <td style="padding: 12px 20px; color: #2d3748; font-weight: 600;">${booking.pickupLocation || 'Guwahati'}</td>
        </tr>
      </table>
    </div>

    <p style="color: #4a5568; font-size: 14px;">Your driver will reach out prior to departure. You can also view live trip status anytime on your Traveler Dashboard:</p>
  `;

  const html = wrapEmailHtml({
    title: subject,
    preheader: `Chauffeur ${driverName} assigned to your journey #${ref}.`,
    contentHtml,
    actionUrl: 'https://rhinovoyage.com/user-dashboard.html',
    actionText: 'View in Dashboard'
  });

  return sendBrevoEmail({
    to: recipientEmail,
    toName: customerName,
    subject,
    htmlContent: html
  });
}

module.exports = {
  sendBrevoEmail,
  sendWelcomeEmail,
  sendAdminNewUserAlert,
  sendBookingReceivedEmail,
  sendAdminNewBookingAlert,
  sendBookingStatusEmail,
  sendDriverTripDispatchEmail,
  sendCustomerDriverAssignedEmail
};

