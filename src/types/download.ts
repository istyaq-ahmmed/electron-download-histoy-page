export interface DownloadItem {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  fileExists:0|1;
  downloadedSize: number;
  downloadedAt: number;
  state:string;
  downloadTime?: number; // in milliseconds
}

export interface FetchDownloadsRequest {
  page: number;
  pageSize: number;
  searchQuery?: string;
}

export interface FetchDownloadsResponse {
  items: DownloadItem[];
  total: number;
  hasMore: boolean;
}

export interface DeleteDownloadRequest {
  ids: string[];
  deleteFile?: boolean;
}
