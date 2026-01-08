import type { DownloadItem, FetchDownloadsRequest, FetchDownloadsResponse, DeleteDownloadRequest } from '../types/download';

const MAIN_WINDOW_CHANNEL = 'download-history';

class DownloadHistoryAPI {
  /**
   * Fetch downloads with pagination and search
   */
  async fetchDownloads(request: FetchDownloadsRequest): Promise<FetchDownloadsResponse> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(`${MAIN_WINDOW_CHANNEL}:fetch-response`, (response: FetchDownloadsResponse) => {
        resolve(response);
      });

      window.electron.ipcRenderer.once(`${MAIN_WINDOW_CHANNEL}:error`, (error: any) => {
        reject(new Error(error.message || 'Failed to fetch downloads'));
      });

      window.electron.ipcRenderer.send(`${MAIN_WINDOW_CHANNEL}:fetch`, request);
    });
  }

  /**
   * Delete downloads and optionally delete files from disk
   */
  async deleteDownloads(request: DeleteDownloadRequest): Promise<{ success: boolean; deletedCount: number }> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(`${MAIN_WINDOW_CHANNEL}:delete-response`, (response: any) => {
        resolve(response);
      });

      window.electron.ipcRenderer.once(`${MAIN_WINDOW_CHANNEL}:error`, (error: any) => {
        reject(new Error(error.message || 'Failed to delete downloads'));
      });

      window.electron.ipcRenderer.send(`${MAIN_WINDOW_CHANNEL}:delete`, request);
    });
  }

  /**
   * Open a file on disk
   */
  async openFile(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(`${MAIN_WINDOW_CHANNEL}:open-response`, (response: any) => {
        resolve(response.success);
      });

      window.electron.ipcRenderer.send(`${MAIN_WINDOW_CHANNEL}:open`, { filePath });
    });
  }

  /**
   * Show file in explorer/finder
   */
  async showInFolder(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(`${MAIN_WINDOW_CHANNEL}:show-response`, (response: any) => {
        resolve(response.success);
      });

      window.electron.ipcRenderer.send(`${MAIN_WINDOW_CHANNEL}:show`, { filePath });
    });
  }
}

export const downloadAPI = new DownloadHistoryAPI();
