import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Input,
  Button,
  Spinner,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogBody,
  DialogActions,
  Checkbox,
  DialogSurface,
} from '@fluentui/react-components';
import {
  SearchRegular,
  DeleteRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import type { DownloadItem, FetchDownloadsResponse } from '../types/download';

import { DownloadCard } from './DownloadCard';
import '../styles/DownloadHistoryWindow.css';

const PAGE_SIZE = 20;

export const DownloadHistoryWindow: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number|null>(null);

  // Fetch downloads
  const fetchDownloads = useCallback(
    async (page: number, query: string, append: boolean = false) => {
      try {
        setLoading(true);
        const response: FetchDownloadsResponse = await window.engine.fetchResult({
          page,
          pageSize: PAGE_SIZE,
          searchQuery: query || undefined,
        });

        setDownloads((prev) =>
          append ? [...prev, ...response.items] : response.items
        );
        setHasMore(response.hasMore);
        setTotalDownloads(response.total);
      } catch (error) {
        console.error('Failed to fetch downloads:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    setCurrentPage(0);
    setDownloads([]);
    setSelectedIds(new Set());
    fetchDownloads(0, searchQuery);
    
    const handler = (update:DownloadItem) => {
      setDownloads(prev =>{
        let f=false;
        const p=prev.map(d =>{

            if(d.id == update.id){
              f=true
              return { ...d, ...update }
            }else{
              return d
            }
          })
        if(!f) p.unshift(update) 
        return p
      }
      );
    };

    window.engine.onDownloadUpdate(handler);
  }, [fetchDownloads,searchQuery]); // Only on mount

  // Handle search with debounce
  useEffect(() => {
    if(initialLoad){
      if (!searchQuery) return;
      setInitialLoad(false)
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(0);
      setDownloads([]);
      setSelectedIds(new Set());
      fetchDownloads(0, searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchDownloads,initialLoad]);
  


  // Infinite scroll handler
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if scrolled to bottom (with 300px threshold)
      if (scrollHeight - scrollTop - clientHeight < 300 && !loading && hasMore) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchDownloads(nextPage, searchQuery, true);
      }
    },
    [currentPage, loading, hasMore, searchQuery, fetchDownloads]
  );

  // Selection handlers
  const handleSelectItem = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(downloads.map((d) => d.id)));
  }, [downloads]);
  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Delete handlers
  const handleDeleteItem = useCallback(
    async (id: string) => {
      try {
        await window.engine.deleteDownload([id]);

        setDownloads((prev) => prev.filter((d) => d.id !== id));
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } catch (error) {
        console.error('Failed to delete download:', error);
      }
    },
    []
  );

  const handleDeleteSelected = useCallback(async () => {
    try {
      await window.engine.deleteDownload(Array.from(selectedIds));

      setDownloads((prev) =>
        prev.filter((d) => !selectedIds.has(d.id))
      );
      setSelectedIds(new Set());
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete downloads:', error);
    }
  }, [selectedIds]);

  const handleOpenFile = useCallback(async (id: string) => {
    try {
      await window.engine.openDownload({id:id,action:'open'});
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }, []);

  const handleShowInFolder = useCallback(async (id: string) => {
    try {
      await window.engine.openDownload({id:id,action:'show'});
    } catch (error) {
      console.error('Failed to show in folder:', error);
    }
  }, []);

  return (
    <div className="download-history-window">
      {/* Header */}
      <div className="dhw-header">
        <h1 className="dhw-title">Downloads</h1>
      </div>

      {/* <Divider inset={true} /> */}

      {/* Controls */}
      <div className="dhw-controls">
        <Input
          placeholder="Search downloads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          contentBefore={<SearchRegular />}
          className="dhw-search"
        />

        {selectedIds.size > 0 && (
          <div className="dhw-selected-actions">
            <span className="dhw-selected-count">
              {selectedIds.size} selected
            </span>
            <Button
              appearance="subtle"
              onClick={() => handleDeselectAll()}
              title="Deselect all"
            >
              <DismissRegular fontSize={16} />
            </Button>
            <Dialog open={deleteDialogOpen} onOpenChange={(_, data) => setDeleteDialogOpen(data.open)}>
              <DialogTrigger>
                <Button
                  appearance="primary"
                  icon={<DeleteRegular />}
                  >
                  Delete
                </Button>
              </DialogTrigger>

              <DialogSurface>
                <DialogContent>
                  <DialogBody>
                    <p>
                      Delete {selectedIds.size} download{selectedIds.size !== 1 ? 's' : ''} from history?
                    </p>
                  
                  </DialogBody>
                  <DialogActions>
                    <Button appearance="secondary" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      appearance="primary"
                      onClick={() => {
                        handleDeleteSelected();
                      }}
                    >
                      Remove from History
                    </Button>
                  </DialogActions>
                </DialogContent>
              </DialogSurface>
            </Dialog>

          </div>
        )}
        {/* Download Selector */}
        {downloads.length > 0 && selectedIds.size === 0 && (
          <div className="dhw-selected-actions">
            <Button
              appearance="subtle"
              onClick={handleSelectAll}
              // className="dhw-select-all"
            >
              <Checkbox
                checked={false}
                aria-label="Select all downloads"
              />
              <span className="dhw-selected-count">Select all on this page</span>
            </Button>
          </div>
        )}

      </div>


      <div
        ref={scrollContainerRef}
        className="dhw-list"
        onScroll={handleScroll}
      >
        {downloads.length === 0 && !loading ? (
          <div className="dhw-empty">
            <p>No downloads yet</p>
            {searchQuery && (
              <p className="dhw-empty-hint">
                No results for "{searchQuery}"
              </p>
            )}
          </div>
        ) : (
          <div className="dhw-cards">
            {downloads.map((item) => (
              <DownloadCard
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                onSelect={handleSelectItem}
                onDelete={handleDeleteItem}
                onOpen={handleOpenFile}
                onShowInFolder={handleShowInFolder}
              />
            ))}
          </div>
        )}

        {loading && (
          <div className="dhw-loading">
            <Spinner label="Loading downloads..." />
          </div>
        )}

        {!hasMore && downloads.length > 0 && !loading && (
          <div className="dhw-end-message">
            <p>Showing {downloads.length} of {totalDownloads} downloads</p>
          </div>
        )}
      </div>
    </div>
  );
};
