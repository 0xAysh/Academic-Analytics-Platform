'use strict';

/**
 * Notification/Toast system for displaying messages to users
 * Replaces browser alert() calls with inline UI messages
 */

let notificationContainer = null;

/**
 * Initialize notification container
 */
function initNotificationContainer() {
  if (notificationContainer) return notificationContainer;
  
  notificationContainer = document.createElement('div');
  notificationContainer.id = 'notificationContainer';
  notificationContainer.className = 'notification-container';
  document.body.appendChild(notificationContainer);
  return notificationContainer;
}

/**
 * Show a notification message
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', 'warning', or 'info'
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export function showNotification(message, type = 'info', duration = 5000) {
  const container = initNotificationContainer();
  
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  
  const messageText = document.createElement('div');
  messageText.className = 'notification__message';
  messageText.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'notification__close';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Close notification');
  
  const removeNotification = () => {
    notification.classList.add('notification--closing');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  };
  
  closeBtn.addEventListener('click', removeNotification);
  
  notification.appendChild(messageText);
  notification.appendChild(closeBtn);
  container.appendChild(notification);
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(removeNotification, duration);
  }
  
  return notification;
}

/**
 * Show success notification
 */
export function showSuccess(message, duration = 5000) {
  return showNotification(message, 'success', duration);
}

/**
 * Show error notification
 */
export function showError(message, duration = 7000) {
  return showNotification(message, 'error', duration);
}

/**
 * Show warning notification
 */
export function showWarning(message, duration = 6000) {
  return showNotification(message, 'warning', duration);
}

/**
 * Show info notification
 */
export function showInfo(message, duration = 5000) {
  return showNotification(message, 'info', duration);
}


