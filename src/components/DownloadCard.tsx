'use client';
import React, {  useCallback } from 'react';
import {
  Checkbox,
  Card,
  Button,
} from '@fluentui/react-components';
import {
  DeleteRegular,
  FolderOpenRegular,
  OpenRegular,
} from '@fluentui/react-icons';
import type { DownloadItem } from '../types/download';
import { formatFileSize, formatDate, getIconForMimeType } from '../utils/helpers';
import '../styles/DownloadCard.css';

interface DownloadCardProps {
  item: DownloadItem;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  onOpen: (id: string) => Promise<void>;
  onShowInFolder: (id: string) => Promise<void>;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  item,
  isSelected,
  onSelect,
  onDelete,
  onOpen,
  onShowInFolder,
}) => {
  // const [isDeleting, setIsDeleting] = useState(false);
  // const [isOpening, setIsOpening] = useState(false);

  const handleDelete = useCallback(
    async () => {
      try {
        await onDelete(item.id);
      } catch{
        console.log()
      }
    },
    [item.id, onDelete]
  );

  const handleOpen = useCallback(async () => {
    try {
      await onOpen(item.id);
    } finally {
      console.log()
    }
  }, [item.id, onOpen]);

  const handleShowInFolder = useCallback(async () => {
    try {
      await onShowInFolder(item.id);
    } finally {
      console.log()
    }
  }, [item.id, onShowInFolder]);

  const icon = getIconForMimeType(item.mimeType, item.fileName);

  return (
    <Card className="download-card" appearance="outline">
      <div className="download-card__content">
        <div className="download-card__checkbox">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(item.id, e.currentTarget.checked)}
            aria-label="Select download"
          />
        </div>
        <div className='download-card__content' style={
          { filter: item.state !== "completed" || item.fileExists == 0 ? "grayscale(1)" : 'none' }
        }>
          <div className="download-card__icon">{icon}</div>

          <div className="download-card__info">
            <div className="download-card__filename">
              <span style={{ paddingRight: "15px" }} className={item.fileExists == 0 ? "download-card__filename download-card__filename--invalid" : 'download-card__filename'}> {item.fileName} </span>
              <span style={{ textTransform: 'capitalize' }} className=''>{item.fileExists == 0 ? "deleted" : item.state}</span>
            </div>
            <div className="download-card__metadata">
              <span className="download-card__size">{formatFileSize(item.downloadedSize)}/{formatFileSize(item.fileSize)}</span>
              <span className="download-card__separator">•</span>
              <span className="download-card__date">{formatDate(item.downloadedAt * 1000)}</span>
            </div>
          </div>

          <div className="download-card__actions">
            {!(item.state !== "completed" || item.fileExists == 0) && (<><Button
              appearance="subtle"
              icon={<OpenRegular />}
              title="Open file"
              onClick={handleOpen}
              // disabled={isOpening}
            ></Button>

              <Button
                appearance="subtle"
                icon={<FolderOpenRegular />}
                title="Show in folder"
                onClick={handleShowInFolder}
              ></Button></>)
            }
            <Button
              appearance="subtle"
              icon={<DeleteRegular />}
              title="Delete"
              onClick={() => handleDelete()}
              // disabled={isDeleting}
            >
              
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
