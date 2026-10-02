const db = require('../config/db');

// @desc    Get Current User's Notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = (req, res) => {
  try {
    const notifications = await ('notifications', { userId: req.user.id });
    res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    console.error('Get notifications controller error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications.' });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    const exists = await One('notifications', { id, userId: req.user.id });
    
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Notification not found or access denied.' });
    }

    await ('notifications', { id }, { read: true });

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ success: false, message: 'Server error marking notification as read.' });
  }
};

// @desc    Delete Notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = (req, res) => {
  try {
    const { id } = req.params;
    const exists = await One('notifications', { id, userId: req.user.id });
    
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Notification not found or access denied.' });
    }

    await ('notifications', { id });

    res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting notification.' });
  }
};
