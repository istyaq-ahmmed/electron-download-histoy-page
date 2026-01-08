/**
 * Returns an icon emoji or string based on MIME type
 * This uses Fluent UI icons or emojis for visual representation
 */
export function getMimeTypeIcon(mimeType: string, fileName?: string): string {
  if (!mimeType) {
    return '📄'; // default document icon
  }

  const [type, subtype] = mimeType.split('/');

  // Images
  if (type === 'image') {
    return '🖼️';
  }

  // Video
  if (type === 'video') {
    return '🎬';
  }

  // Audio
  if (type === 'audio') {
    return '🎵';
  }

  // Archives
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('7z') ||
    mimeType.includes('tar') ||
    mimeType.includes('gzip')
  ) {
    return '📦';
  }

  // PDFs
  if (mimeType.includes('pdf')) {
    return '📕';
  }

  // Documents
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('officedocument.wordprocessingml')
  ) {
    return '📝';
  }

  // Spreadsheets
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('officedocument.spreadsheetml') ||
    mimeType.includes('sheet')
  ) {
    return '📊';
  }

  // Presentations
  if (
    mimeType.includes('presentation') ||
    mimeType.includes('officedocument.presentationml')
  ) {
    return '🎞️';
  }

  // Code/Text
  if (type === 'text') {
    if (subtype === 'html' || subtype === 'xml') {
      return '💻';
    }
    if (
      subtype === 'javascript' ||
      subtype === 'typescript' ||
      subtype === 'jsx' ||
      subtype === 'tsx'
    ) {
      return '⚙️';
    }
    if (subtype === 'css') {
      return '🎨';
    }
    return '📄';
  }

  // Applications
  if (type === 'application') {
    if (subtype === 'json' || subtype === 'xml') {
      return '💻';
    }
    if (subtype.includes('json')) {
      return '💻';
    }
    if (subtype.includes('pdf')) {
      return '📕';
    }
    if (subtype.includes('executable') || subtype.includes('msdownload')) {
      return '⚙️';
    }
  }

  // Executables/Apps
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const exeExts = ['exe', 'msi', 'app', 'dmg', 'deb', 'rpm'];
    if (exeExts.includes(ext)) {
      return '⚙️';
    }
  }

  return '📄'; // default
}

/**
 * Get a Fluent UI icon name if needed instead of emoji
 * Can be used with Icon component from @fluentui/react-components
 */
export function getMimeTypeFluentIcon(mimeType: string): string {
  if (!mimeType) {
    return 'Document';
  }

  const [type] = mimeType.split('/');

  if (type === 'image') return 'ImageSearch';
  if (type === 'video') return 'Video';
  if (type === 'audio') return 'Music';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'ZipFolder';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'WordDocument';
  if (mimeType.includes('spreadsheet') || mimeType.includes('sheet')) return 'ExcelDocument';
  if (mimeType.includes('presentation')) return 'PowerPointDocument';

  return 'Document';
}
