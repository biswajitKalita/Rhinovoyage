/**
 * RhinoVoyage Luxury Notification Center & Animated Toast System
 * Industry-standard real-time notifications for User, Admin & Driver dashboards.
 */

(function() {
  'use strict';

  // API base resolver
  const getApiUrl = () => {
    if (typeof window.getRhinoApiUrl === 'function') return window.getRhinoApiUrl();
    if (window.API_BASE_URL) return window.API_BASE_URL;
    return 'https://rhinovoyage.onrender.com/api';
  };

  const state = {
    notifications: [],
    unreadCount: 0,
    currentFilter: 'all', // 'all' | 'unread'
    isOpen: false,
    pollTimer: null,
    seenIds: new Set(JSON.parse(sessionStorage.getItem('rv_seen_notifs') || '[]'))
  };

  // Icon mapping helper
  function getIconForType(type) {
    switch (type) {
      case 'driver':
        return '<i class="ph-bold ph-steering-wheel"></i>';
      case 'payment':
        return '<i class="ph-bold ph-coins"></i>';
      case 'alert':
        return '<i class="ph-bold ph-warning-circle"></i>';
      case 'admin':
        return '<i class="ph-bold ph-shield-check"></i>';
      case 'booking':
      default:
        return '<i class="ph-bold ph-calendar-check"></i>';
    }
  }

  // Relative time formatter
  function formatRelativeTime(dateStr) {
    if (!dateStr) return 'Just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // DOM Mount: Notification Bell & Dropdown Panel
  function mountUI() {
    // 1. Locate container in header
    let mountPoint = document.getElementById('rhino-notif-mount');

    if (!mountPoint) {
      // Look for standard navbar user groups
      const targets = ['.nav-user', '.nav-right-actions', '.header-right'];
      for (const sel of targets) {
        const found = document.querySelector(sel);
        if (found) {
          const wrapper = document.createElement('div');
          wrapper.id = 'rhino-notif-mount';
          found.insertBefore(wrapper, found.firstChild);
          mountPoint = wrapper;
          break;
        }
      }
    }

    if (!mountPoint) return;

    // Check if already mounted
    if (document.getElementById('rhino-notif-btn')) return;

    mountPoint.classList.add('rhino-notif-btn-wrap');
    mountPoint.innerHTML = `
      <button class="rhino-notif-btn" id="rhino-notif-btn" onclick="RhinoNotification.toggleDropdown()" title="Notifications & Alerts" aria-label="Notifications">
        <i class="ph-bold ph-bell"></i>
        <span class="rhino-notif-badge" id="rhino-notif-badge" style="display: none;">0</span>
      </button>

      <!-- Flyout Dropdown Panel -->
      <div class="rhino-notif-panel" id="rhino-notif-panel">
        <div class="rhino-panel-head">
          <div class="rhino-panel-title-wrap">
            <span class="rhino-panel-title"><i class="ph-bold ph-bell-ringing" style="color: #10B981;"></i> Notifications</span>
            <span class="rhino-panel-count-pill" id="rhino-panel-count">0 Unread</span>
          </div>
          <div class="rhino-panel-actions">
            <button class="rhino-btn-read-all" onclick="RhinoNotification.markAllAsRead()">Mark all read</button>
            <button class="rhino-btn-close-panel" onclick="RhinoNotification.closeDropdown()" title="Close"><i class="ph-bold ph-x"></i></button>
          </div>
        </div>

        <div class="rhino-panel-tabs">
          <button class="rhino-tab-filter active" id="rhino-tab-all" onclick="RhinoNotification.setFilter('all')">All</button>
          <button class="rhino-tab-filter" id="rhino-tab-unread" onclick="RhinoNotification.setFilter('unread')">Unread</button>
        </div>

        <div class="rhino-notif-list" id="rhino-notif-list">
          <div class="rhino-notif-empty">
            <i class="ph-bold ph-spinner ph-spin"></i>
            <h4>Loading alerts...</h4>
          </div>
        </div>
      </div>
    `;

    // 2. Ensure Backdrop and Toast Container exist on document.body
    if (!document.getElementById('rhino-notif-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'rhino-notif-backdrop';
      backdrop.className = 'rhino-notif-backdrop';
      backdrop.onclick = () => RhinoNotification.closeDropdown();
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById('rhino-toast-container')) {
      const toastContainer = document.createElement('div');
      toastContainer.id = 'rhino-toast-container';
      toastContainer.className = 'rhino-toast-container';
      document.body.appendChild(toastContainer);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) {
        RhinoNotification.closeDropdown();
      }
    });

    // Close when clicking outside on desktop
    document.addEventListener('click', (e) => {
      if (state.isOpen) {
        const panel = document.getElementById('rhino-notif-panel');
        const btn = document.getElementById('rhino-notif-btn');
        if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
          RhinoNotification.closeDropdown();
        }
      }
    });
  }

  // Fetch notifications from server
  async function fetchNotifications(isPoll = false) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const api = getApiUrl();
      const res = await fetch(`${api}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!data.success) return;

      const newNotifs = Array.isArray(data.notifications) ? data.notifications : [];
      const prevUnread = state.unreadCount;

      state.notifications = newNotifs;
      state.unreadCount = data.unreadCount || newNotifs.filter(n => !n.read).length;

      updateBadge();
      renderList();

      // Check for fresh unread notifications to pop up a toast alert
      const unreadList = newNotifs.filter(n => !n.read);
      if (unreadList.length > 0) {
        // If it's initial load or poll, check for new items not yet seen
        const freshUnseen = unreadList.filter(n => !state.seenIds.has(n.id));

        if (freshUnseen.length > 0) {
          // Toast the latest one
          const latest = freshUnseen[0];
          showToast(latest);

          freshUnseen.forEach(n => state.seenIds.add(n.id));
          sessionStorage.setItem('rv_seen_notifs', JSON.stringify(Array.from(state.seenIds)));
        } else if (!isPoll && sessionStorage.getItem('rv_toast_shown') !== 'true') {
          // Show toast on page load for the most recent unread alert
          showToast(unreadList[0]);
          sessionStorage.setItem('rv_toast_shown', 'true');
        }
      }

    } catch (err) {
      console.warn('RhinoNotification fetch error:', err.message);
    }
  }

  // Update Bell Badge
  function updateBadge() {
    const badge = document.getElementById('rhino-notif-badge');
    const pill = document.getElementById('rhino-panel-count');
    if (!badge) return;

    const count = state.unreadCount;
    if (count > 0) {
      badge.innerText = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
      badge.classList.add('pulse');
    } else {
      badge.style.display = 'none';
      badge.classList.remove('pulse');
    }

    if (pill) {
      pill.innerText = count > 0 ? `${count} Unread` : 'All Read';
    }
  }

  // Render List into Dropdown
  function renderList() {
    const listEl = document.getElementById('rhino-notif-list');
    if (!listEl) return;

    let items = state.notifications;
    if (state.currentFilter === 'unread') {
      items = items.filter(n => !n.read);
    }

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="rhino-notif-empty">
          <i class="ph-bold ph-check-circle" style="color: #10B981;"></i>
          <h4>All Caught Up!</h4>
          <p>${state.currentFilter === 'unread' ? 'No unread notifications.' : 'You have no new alerts at this time.'}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items.map(n => {
      const icon = getIconForType(n.type);
      const timeAgo = formatRelativeTime(n.createdAt);
      const unreadClass = n.read ? '' : 'unread';

      return `
        <div class="rhino-notif-item ${unreadClass}" onclick="RhinoNotification.handleClickItem('${n.id}', '${n.link || ''}')">
          <div class="rhino-notif-icon-wrap ${n.type || 'booking'}">
            ${icon}
          </div>
          <div class="rhino-notif-content">
            <div class="rhino-notif-top">
              <span class="rhino-notif-title">${escapeHtml(n.title)}</span>
              <span class="rhino-notif-time">${timeAgo}</span>
            </div>
            <div class="rhino-notif-msg">${escapeHtml(n.message)}</div>
          </div>
          ${!n.read ? '<span class="rhino-notif-dot"></span>' : ''}
          <button class="rhino-notif-del" onclick="event.stopPropagation(); RhinoNotification.deleteItem('${n.id}')" title="Dismiss">
            <i class="ph-bold ph-trash"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  // Helper to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Floating Pop-Up Toast Alert (Slides in, displays for 5s with progress bar, then smoothly hides)
  function showToast(notif) {
    const container = document.getElementById('rhino-toast-container');
    if (!container || !notif) return;

    const toast = document.createElement('div');
    const type = notif.type || 'booking';
    toast.className = `rhino-toast ${type}`;

    const icon = getIconForType(type);

    toast.innerHTML = `
      <div class="rhino-toast-body">
        <div class="rhino-toast-icon-circle ${type}">
          ${icon}
        </div>
        <div class="rhino-toast-text">
          <div class="rhino-toast-header">
            <div class="rhino-toast-title">${escapeHtml(notif.title)}</div>
            <button class="rhino-toast-close" onclick="event.stopPropagation(); this.closest('.rhino-toast').dismiss()" title="Close">
              <i class="ph-bold ph-x"></i>
            </button>
          </div>
          <div class="rhino-toast-msg">${escapeHtml(notif.message)}</div>
        </div>
      </div>
      <div class="rhino-toast-progress-bar"></div>
    `;

    // Dismiss animation logic
    toast.dismiss = () => {
      if (toast.classList.contains('hiding')) return;
      toast.classList.add('hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    // Clicking toast opens notification panel or links
    toast.onclick = () => {
      toast.dismiss();
      RhinoNotification.toggleDropdown();
      if (!notif.read) {
        RhinoNotification.markAsRead(notif.id);
      }
    };

    container.appendChild(toast);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.dismiss();
    }, 5000);
  }

  // Public Interface
  window.RhinoNotification = {
    init: function() {
      mountUI();
      fetchNotifications();

      // Poll every 20 seconds for new alerts
      if (!state.pollTimer) {
        state.pollTimer = setInterval(() => {
          fetchNotifications(true);
        }, 20000);
      }
    },

    toggleDropdown: function() {
      state.isOpen = !state.isOpen;
      const panel = document.getElementById('rhino-notif-panel');
      const btn = document.getElementById('rhino-notif-btn');
      const backdrop = document.getElementById('rhino-notif-backdrop');

      if (state.isOpen) {
        if (panel) panel.classList.add('open');
        if (btn) btn.classList.add('active');
        if (backdrop && window.innerWidth <= 600) backdrop.classList.add('open');
        renderList();
      } else {
        if (panel) panel.classList.remove('open');
        if (btn) btn.classList.remove('active');
        if (backdrop) backdrop.classList.remove('open');
      }
    },

    closeDropdown: function() {
      state.isOpen = false;
      const panel = document.getElementById('rhino-notif-panel');
      const btn = document.getElementById('rhino-notif-btn');
      const backdrop = document.getElementById('rhino-notif-backdrop');
      if (panel) panel.classList.remove('open');
      if (btn) btn.classList.remove('active');
      if (backdrop) backdrop.classList.remove('open');
    },

    setFilter: function(filter) {
      state.currentFilter = filter;
      document.querySelectorAll('.rhino-tab-filter').forEach(t => t.classList.remove('active'));
      const activeTab = document.getElementById(`rhino-tab-${filter}`);
      if (activeTab) activeTab.classList.add('active');
      renderList();
    },

    handleClickItem: async function(id, link) {
      await this.markAsRead(id);
      this.closeDropdown();
      if (link && !window.location.pathname.includes(link)) {
        window.location.href = link;
      }
    },

    markAsRead: async function(id) {
      const token = localStorage.getItem('token');
      if (!token) return;

      const item = state.notifications.find(n => n.id === id);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        updateBadge();
        renderList();
      }

      try {
        const api = getApiUrl();
        await fetch(`${api}/notifications/${id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {}
    },

    markAllAsRead: async function() {
      const token = localStorage.getItem('token');
      if (!token) return;

      state.notifications.forEach(n => { n.read = true; });
      state.unreadCount = 0;
      updateBadge();
      renderList();

      try {
        const api = getApiUrl();
        await fetch(`${api}/notifications/read-all`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {}
    },

    deleteItem: async function(id) {
      const token = localStorage.getItem('token');
      if (!token) return;

      const idx = state.notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        if (!state.notifications[idx].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(idx, 1);
        updateBadge();
        renderList();
      }

      try {
        const api = getApiUrl();
        await fetch(`${api}/notifications/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {}
    },

    showToast: function(notif) {
      showToast(notif);
    },

    refresh: function() {
      return fetchNotifications();
    }
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RhinoNotification.init());
  } else {
    RhinoNotification.init();
  }

})();
