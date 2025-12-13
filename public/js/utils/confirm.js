'use strict';

let dialogOverlay = null;
let dialogContainer = null;

function initDialog() {
  if (dialogOverlay) return;
  
  dialogOverlay = document.createElement('div');
  dialogOverlay.id = 'confirmDialogOverlay';
  dialogOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10001;
    display: none;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
  `;
  
  dialogContainer = document.createElement('div');
  dialogContainer.id = 'confirmDialog';
  dialogContainer.style.cssText = `
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-width: 500px;
    width: 90%;
    padding: 24px;
    animation: slideUp 0.3s ease-out;
  `;
  
  dialogOverlay.appendChild(dialogContainer);
  document.body.appendChild(dialogOverlay);
  
  if (!document.getElementById('confirmDialogStyles')) {
    const style = document.createElement('style');
    style.id = 'confirmDialogStyles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * @param {string} message
 * @param {string} title
 * @returns {Promise<boolean>}
 */
export function showConfirm(message, title = 'Confirm') {
  return new Promise((resolve) => {
    initDialog();
    
    dialogContainer.innerHTML = '';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    `;
    
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      margin: 0 0 24px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #4b5563;
    `;
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn btn--secondary';
    cancelBtn.style.cssText = `
      padding: 10px 20px;
      border: 1px solid #d1d5db;
      background: white;
      color: #374151;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    `;
    cancelBtn.onmouseover = () => {
      cancelBtn.style.background = '#f9fafb';
      cancelBtn.style.borderColor = '#9ca3af';
    };
    cancelBtn.onmouseout = () => {
      cancelBtn.style.background = 'white';
      cancelBtn.style.borderColor = '#d1d5db';
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirm';
    confirmBtn.className = 'btn btn--primary';
    confirmBtn.style.cssText = `
      padding: 10px 20px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `;
    confirmBtn.onmouseover = () => confirmBtn.style.background = '#dc2626';
    confirmBtn.onmouseout = () => confirmBtn.style.background = '#ef4444';
    
    const closeDialog = (confirmed) => {
      dialogOverlay.style.display = 'none';
      resolve(confirmed);
    };
    
    cancelBtn.addEventListener('click', () => closeDialog(false));
    confirmBtn.addEventListener('click', () => closeDialog(true));
    
    dialogOverlay.addEventListener('click', (e) => {
      if (e.target === dialogOverlay) {
        closeDialog(false);
      }
    });
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeDialog(false);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    buttonsContainer.appendChild(cancelBtn);
    buttonsContainer.appendChild(confirmBtn);
    
    dialogContainer.appendChild(titleEl);
    dialogContainer.appendChild(messageEl);
    dialogContainer.appendChild(buttonsContainer);
    
    dialogOverlay.style.display = 'flex';
    
    setTimeout(() => confirmBtn.focus(), 100);
  });
}
