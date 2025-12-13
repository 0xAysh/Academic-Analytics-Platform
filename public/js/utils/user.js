'use strict';

/**
 * @returns {object|null}
 */
export function getUserInfo() {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      return null;
    }
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('[User] Error reading userInfo from localStorage:', error);
    return null;
  }
}

/**
 * @param {object} userInfo
 */
export function setUserInfo(userInfo) {
  try {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  } catch (error) {
    console.error('[User] Error storing userInfo in localStorage:', error);
  }
}

/**
 */
export function clearUserInfo() {
  try {
    localStorage.removeItem('userInfo');
  } catch (error) {
    console.error('[User] Error clearing userInfo from localStorage:', error);
  }
}
