/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {HistoryItem} from '../types';

function getHistoryKey(email: string | null): string | null {
  if (!email) {
    return null;
  }
  return `cinegen-ai-history-${email}`;
}

/**
 * Retrieves all history items for a specific user from localStorage.
 * @returns {HistoryItem[]} An array of history items.
 */
export function getHistory(email: string | null): HistoryItem[] {
  const key = getHistoryKey(email);
  if (!key) return [];

  try {
    const rawHistory = localStorage.getItem(key);
    if (rawHistory) {
      const history = JSON.parse(rawHistory) as HistoryItem[];
      // Sort by most recent first
      return history.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error('Failed to parse history from localStorage', error);
    return [];
  }
}

/**
 * Saves a new item to the generation history for a specific user.
 * @param {Omit<HistoryItem, 'id' | 'timestamp'>} itemData - The data for the new history item.
 * @param {string | null} email - The email of the logged-in user.
 * @returns {HistoryItem | null} The newly created history item, or null if user is not logged in.
 */
export function saveToHistory(
  itemData: Omit<HistoryItem, 'id' | 'timestamp'>,
  email: string | null,
): HistoryItem | null {
  const key = getHistoryKey(email);
  if (!key) {
    console.warn('Cannot save to history, user is not logged in.');
    return null;
  }

  const history = getHistory(email);
  const newItem: HistoryItem = {
    ...itemData,
    id: self.crypto.randomUUID(),
    timestamp: Date.now(),
  };

  // Add new item to the beginning of the array
  const updatedHistory = [newItem, ...history];

  localStorage.setItem(key, JSON.stringify(updatedHistory));
  return newItem;
}

/**
 * Deletes a specific item from the history for a specific user.
 * @param {string} id - The ID of the history item to delete.
 * @param {string | null} email - The email of the logged-in user.
 */
export function deleteFromHistory(id: string, email: string | null): void {
  const key = getHistoryKey(email);
  if (!key) return;

  let history = getHistory(email);
  history = history.filter((item) => item.id !== id);
  localStorage.setItem(key, JSON.stringify(history));
}

/**
 * Clears all items from the generation history for a specific user.
 * @param {string | null} email - The email of the logged-in user.
 */
export function clearHistory(email: string | null): void {
  const key = getHistoryKey(email);
  if (!key) return;
  localStorage.removeItem(key);
}
