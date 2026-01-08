interface FetchDownloadsResponse {
  items: DownloadItem[];
  total: number;
  hasMore: boolean;
}
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
interface FetchDownloadsRequest {
  page: number,
  pageSize: number,
  searchQuery?: string;
}
declare global {
  interface Window {
    engine: {
      fetchResult:(q:FetchDownloadsRequest) => Promise<FetchDownloadsResponse>
      onDownloadUpdate:(func: (item:DownloadItem) => void) => void;
      
      deleteDownload:(ids:string[]) => Promise<boolean>
      openDownload:(payload:{id:string,action:"open"|"show"}) => Promise<boolean>
      
    };
  }
}

export {};
