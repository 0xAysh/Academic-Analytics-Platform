'use strict';

let notificationContainer = null;

function initNotificationContainer() {
  if (notificationContainer) return notificationContainer;
  
  notificationContainer = document.createElement('div');
  notificationContainer.id = 'notificationContainer';
  notificationContainer.className = 'notification-container';
  document.body.appendChild(notificationContainer);
  return notificationContainer;
}

/**
 * @param {string} message
 * @param {string} type
 * @param {number} duration
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
  
  if (duration > 0) {
    setTimeout(removeNotification, duration);
  }
  
  return notification;
}

/**
 * @param {string} message
 * @param {number} duration
 */
export function showSuccess(message, duration = 5000) {
  return showNotification(message, 'success', duration);
}

/**
 * @param {string} message
 * @param {number} duration
 */
export function showError(message, duration = 7000) {
  return showNotification(message, 'error', duration);
}

/**
 * @param {string} message
 * @param {number} duration
 */
export function showWarning(message, duration = 6000) {
  return showNotification(message, 'warning', duration);
}

/**
 * @param {string} message
 * @param {number} duration
 */
export function showInfo(message, duration = 5000) {
  return showNotification(message, 'info', duration);
}
