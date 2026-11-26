const db = require('../config/db');

// @desc    Helper to create notifications from any controller/action
exports.createNotification = async ({ userId = null, forRole = null, title, message, type = 'booking', link = '', meta = {} }) => {
  try {
    const newNotif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: userId || null,
      forRole: forRole || null,
      title: title || 'Notification',
      message: message || '',
      type: type || 'booking', // 'booking' | 'driver' | 'payment' | 'admin' | 'system'
      link: link || '',
      meta: meta || {},
      read: false,
      createdAt: new Date().toISOString()
    };
    await db.insert('notifications', newNotif);
    return newNotif;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// @desc    Get Current User's Notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role || 'client';
    const userId = req.user.id;
    const userEmail = req.user.email;

    let allNotifs = await db.find('notifications', {});

    // Filter notifications relevant to this user
    let userNotifs = allNotifs.filter(n => {
      if (n.userId && n.userId === userId) return true;
      if (userRole === 'admin') {
        if (n.forRole === 'admin' || n.recipient === 'admin') return true;
      }
      if (userRole === 'driver') {
        if (n.forRole === 'driver' || n.driverEmail === userEmail || n.driverId === userId) return true;
      }
      if (userRole === 'client') {
        if (n.userEmail === userEmail || (!n.forRole && n.userId === userId)) return true;
      }
      return false;
    });

    // If zero notifications exist, seed contextual starter notifications from existing bookings
    if (userNotifs.length === 0) {
      const bookings = await db.find('bookings', {});
      const now = new Date();

      if (userRole === 'admin') {
        // Seed recent admin alerts based on latest bookings
        const sampleBookings = bookings.slice(-5).reverse();
        if (sampleBookings.length > 0) {
          for (let i = 0; i < sampleBookings.length; i++) {
            const b = sampleBookings[i];
            const bRef = (b.id || '').toUpperCase().substring(0, 8);
            const timeOffset = new Date(now.getTime() - (i * 3600000 * 3 + 900000)).toISOString();
            
            let title = `New Booking Request #${bRef}`;
            let msg = `${b.name || 'Traveler'} booked ${b.dropLocation || b.packageName || 'Tour'} for ${b.pickupDate || 'upcoming date'}.`;
            let type = 'booking';

            if (b.status === 'Completed') {
              title = `Trip Completed #${bRef}`;
              msg = `Journey with ${b.name || 'Traveler'} completed. Payout verification ready.`;
              type = 'driver';
            } else if (b.driverStatus === 'Accepted') {
              title = `Driver Assigned #${bRef}`;
              msg = `${b.driverName || 'Assigned Driver'} accepted the journey.`;
              type = 'driver';
            }

            const seeded = {
              id: 'notif_init_' + (i + 1) + '_' + Math.random().toString(36).substring(2, 6),
              userId: null,
              forRole: 'admin',
              title,
              message: msg,
              type,
              link: 'admin-dashboard.html',
              read: i > 1, // First 2 unread
              createdAt: timeOffset
            };
            await db.insert('notifications', seeded);
            userNotifs.push(seeded);
          }
        } else {
          // Default initial operational alerts for admin
          const defaultAdminNotifs = [
            {
              id: 'notif_adm_welcome',
              userId: null,
              forRole: 'admin',
              title: 'Operations Notification Center Ready 🛡️',
              message: 'Real-time alert engine active. You will receive live pop-up notifications for all customer bookings, driver assignments, journey completions, and payouts.',
              type: 'admin',
              link: 'admin-dashboard.html',
              read: false,
              createdAt: now.toISOString()
            },
            {
              id: 'notif_adm_dispatch',
              userId: null,
              forRole: 'admin',
              title: 'Dispatch Desk & Fleet Active 🚗',
              message: 'Verified drivers and vehicles are ready for dispatch. New traveler reservations will appear here with instant alerts.',
              type: 'booking',
              link: 'admin-dashboard.html',
              read: true,
              createdAt: new Date(now.getTime() - 7200000).toISOString()
            }
          ];
          for (const item of defaultAdminNotifs) {
            await db.insert('notifications', item);
            userNotifs.push(item);
          }
        }
      } else if (userRole === 'driver') {
        // Seed driver notifications from their assigned bookings
        const driverTrips = bookings.filter(b => b.driverEmail === userEmail || b.driverId === userId || b.driverPhone === req.user.phone);
        if (driverTrips.length > 0) {
          for (let i = 0; i < Math.min(driverTrips.length, 4); i++) {
            const b = driverTrips[i];
            const bRef = (b.id || '').toUpperCase().substring(0, 8);
            const timeOffset = new Date(now.getTime() - (i * 3600000 * 2 + 1800000)).toISOString();

            let title = `New Trip Assigned #${bRef}`;
            let msg = `You have been assigned to drive ${b.pickupLocation || 'Pickup'} to ${b.dropLocation || 'Destination'} on ${b.pickupDate || 'scheduled date'}.`;
            let type = 'driver';

            if (b.status === 'Completed' && b.driverPayment > 0) {
              title = `Driver Payout Processed #${bRef}`;
              msg = `Your payout of ₹${Number(b.driverPayment).toLocaleString('en-IN')} has been ${b.driverPayStatus === 'Paid' ? 'credited' : 'approved'}.`;
              type = 'payment';
            }

            const seeded = {
              id: 'notif_drv_init_' + (i + 1) + '_' + Math.random().toString(36).substring(2, 6),
              userId: userId,
              forRole: 'driver',
              title,
              message: msg,
              type,
              link: 'driver-dashboard.html',
              read: i > 0,
              createdAt: timeOffset
            };
            await db.insert('notifications', seeded);
            userNotifs.push(seeded);
          }
        } else {
          const defaultDriverNotifs = [
            {
              id: 'notif_drv_welcome',
              userId: userId,
              forRole: 'driver',
              title: 'Driver Portal Alerts Active 🚗',
              message: 'Welcome to RhinoVoyage Driver Portal! You will receive live notification pop-ups for new dispatches, customer contact unlock, and payout releases.',
              type: 'driver',
              link: 'driver-dashboard.html',
              read: false,
              createdAt: now.toISOString()
            },
            {
              id: 'notif_drv_kyc',
              userId: userId,
              forRole: 'driver',
              title: 'Profile & Credentials Verified 🛡️',
              message: 'Your driving partner KYC and vehicle eligibility are verified. Keep status On Duty to receive trips.',
              type: 'admin',
              link: 'driver-dashboard.html',
              read: true,
              createdAt: new Date(now.getTime() - 14400000).toISOString()
            }
          ];
          for (const item of defaultDriverNotifs) {
            await db.insert('notifications', item);
            userNotifs.push(item);
          }
        }
      } else {
        // Client/User notifications
        const myBookings = bookings.filter(b => b.userId === userId || b.email === userEmail);
        if (myBookings.length > 0) {
          for (let i = 0; i < Math.min(myBookings.length, 4); i++) {
            const b = myBookings[i];
            const bRef = (b.id || '').toUpperCase().substring(0, 8);
            const timeOffset = new Date(now.getTime() - (i * 3600000 * 4 + 1200000)).toISOString();

            let title = `Booking Confirmed #${bRef}`;
            let msg = `Your journey for ${b.dropLocation || b.packageName || 'Tour'} on ${b.pickupDate || 'scheduled date'} has been confirmed!`;
            let type = 'booking';

            if (b.status === 'Completed') {
              title = `Journey Completed #${bRef}`;
              msg = `Thank you for traveling with RhinoVoyage! Your official invoice is ready.`;
              type = 'payment';
            }

            const seeded = {
              id: 'notif_usr_init_' + (i + 1) + '_' + Math.random().toString(36).substring(2, 6),
              userId: userId,
              forRole: 'client',
              title,
              message: msg,
              type,
              link: 'user-dashboard.html',
              read: i > 0,
              createdAt: timeOffset
            };
            await db.insert('notifications', seeded);
            userNotifs.push(seeded);
          }
        } else {
          const defaultClientNotifs = [
            {
              id: 'notif_client_welcome',
              userId: userId,
              forRole: 'client',
              title: 'Welcome to RhinoVoyage! 🦏',
              message: 'Explore our luxury heritage tours, airport transfers, and car rentals. Your booking confirmations and trip alerts will appear right here.',
              type: 'booking',
              link: 'user-dashboard.html',
              read: false,
              createdAt: now.toISOString()
            }
          ];
          for (const item of defaultClientNotifs) {
            await db.insert('notifications', item);
            userNotifs.push(item);
          }
        }
      }
    }

    // Sort descending by date
    userNotifs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const unreadCount = userNotifs.filter(n => !n.read).length;

    res.status(200).json({
      success: true,
      count: userNotifs.length,
      unreadCount,
      notifications: userNotifs
    });
  } catch (error) {
    console.error('Get notifications controller error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications.' });
  }
};

// @desc    Mark All Notifications as Read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userRole = req.user.role || 'client';
    const userId = req.user.id;
    const userEmail = req.user.email;

    const allNotifs = await db.find('notifications', {});
    let updatedCount = 0;

    for (const n of allNotifs) {
      if (n.read) continue;

      let isForUser = false;
      if (n.userId && n.userId === userId) isForUser = true;
      if (userRole === 'admin' && (n.forRole === 'admin' || n.recipient === 'admin')) isForUser = true;
      if (userRole === 'driver' && (n.forRole === 'driver' || n.driverEmail === userEmail || n.driverId === userId)) isForUser = true;
      if (userRole === 'client' && (n.userEmail === userEmail || n.userId === userId)) isForUser = true;

      if (isForUser) {
        await db.update('notifications', { id: n.id }, { read: true });
        updatedCount++;
      }
    }

    res.status(200).json({ success: true, message: `Marked ${updatedCount} notifications as read.` });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error marking notifications as read.' });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await db.findOne('notifications', { id });
    
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    // Verify access
    const userRole = req.user.role || 'client';
    const isOwner = exists.userId === req.user.id || 
                    (userRole === 'admin' && exists.forRole === 'admin') ||
                    (userRole === 'driver' && exists.forRole === 'driver');

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await db.update('notifications', { id }, { read: true });

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ success: false, message: 'Server error marking notification as read.' });
  }
};

// @desc    Delete Notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await db.findOne('notifications', { id });
    
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    // Verify access
    const userRole = req.user.role || 'client';
    const isOwner = exists.userId === req.user.id || 
                    (userRole === 'admin' && exists.forRole === 'admin') ||
                    (userRole === 'driver' && exists.forRole === 'driver');

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await db.delete('notifications', { id });

    res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting notification.' });
  }
};
