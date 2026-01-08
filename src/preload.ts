/**
 * Preload script for secure Electron IPC communication
 * This script runs in a safe context and exposes only necessary APIs
 */

// import { contextBridge, ipcRenderer } from 'electron';

// Define the safe API exposed to the renderer process
const electronAPI = {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      // Whitelist allowed channels
      const allowedChannels = [
        'download-history:fetch',
        'download-history:delete',
        'download-history:open',
        'download-history:show',
      ];
      if (allowedChannels.includes(channel)) {
        // ipcRenderer.send(channel, ...args);
      }
    },
    once: (channel: string, func: (...args: any[]) => void) => {
      // Whitelist allowed response channels
      const allowedChannels = [
        'download-history:fetch-response',
        'download-history:delete-response',
        'download-history:open-response',
        'download-history:show-response',
        'download-history:error',
      ];
      if (allowedChannels.includes(channel)) {
        // ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      // Whitelist allowed listening channels
      const allowedChannels = [
        'download-history:error',
      ];
      if (allowedChannels.includes(channel)) {
        // ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    off: (channel: string, func: (...args: any[]) => void) => {
      // ipcRenderer.off(channel, (event, ...args) => func(...args));
    },
  },
};

// Expose the API to the renderer process
// contextBridge.exposeInMainWorld('electron', electronAPI);
