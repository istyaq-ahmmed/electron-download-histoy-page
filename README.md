# Download List Window

A feature-rich download manager built with Electron and React. This application provides a beautiful UI for managing file downloads, tracking download history, searching downloads, and managing downloaded files.

## Features

- 📥 **Download Management** - Seamlessly integrate with Electron's download events
- 📊 **Download History** - View all your downloads with detailed information (file name, size, download time, status)
- 🔍 **Search Functionality** - Quickly find downloads by file name
- 💾 **SQLite Database** - Persistent storage of download history using better-sqlite3
- 🎨 **Modern UI** - Built with React and Fluent UI components
- 📄 **Pagination** - Efficiently browse large download lists
- ⚡ **Real-time Updates** - Track download progress in real-time
- 🗑️ **Download Management** - Delete downloads and manage downloaded files

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Framework**: Fluent UI (Microsoft's design system)
- **Desktop**: Electron
- **Database**: SQLite (better-sqlite3)
- **Build Tool**: Vite
- **Styling**: CSS3

## Project Structure

```
.
├── src/
│   ├── components/          # React components
│   │   ├── DownloadCard.tsx     # Individual download item component
│   │   └── DownloadHistoryWindow.tsx # Main download history window
│   ├── styles/              # CSS stylesheets
│   ├── types/               # TypeScript type definitions
│   │   ├── download.ts      # Download data interfaces
│   │   └── electron.d.ts    # Electron type definitions
│   ├── utils/               # Utility functions
│   │   ├── helpers.ts       # Helper functions
│   │   └── mimeTypeIcons.ts # MIME type to icon mapping
│   ├── api/                 # API communication
│   │   └── downloadAPI.ts   # Download API calls
│   ├── App.tsx              # Root React component
│   ├── main.tsx             # React entry point
│   └── preload.ts           # Electron preload script
├── backend_concept/
│   └── history.manager.js   # Database operations and download event handling
├── public/                  # Static assets
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control ([Download](https://git-scm.com/))

Verify installations:
```bash
node --version
npm --version
```

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/download-list-window.git
cd download-list-window
```

### Step 2: Install Dependencies

Install all required packages:

```bash
yarn install
```

Or if you prefer npm:

```bash
npm install
```

### Step 3: Install Additional Backend Dependencies

The project uses `better-sqlite3` for database operations. Install it if it's not already included:

```bash
yarn add better-sqlite3
```

If you encounter compilation issues with better-sqlite3, make sure you have build tools installed:

**On Windows:**
```bash
npm install --global windows-build-tools
```

**On macOS:**
Ensure you have Xcode Command Line Tools installed:
```bash
xcode-select --install
```

**On Linux:**
```bash
sudo apt-get install python3 make g++
```

### Step 4: Configure Your Application

Update the database path and other configuration in `backend_concept/history.manager.js`:

```javascript
const dbPath = path.join(appConfig.root, 'common_user_data.db');
```

### Step 5: Start Development Server

Run the development server:

```bash
yarn dev
```

This will start:
- Vite development server (typically on http://localhost:5173)
- Hot module replacement (HMR) for instant updates

### Step 6: Build for Production

Create an optimized production build:

```bash
yarn build
```

The built files will be in the `dist/` directory.

### Step 7: Preview Production Build

Preview the production build locally:

```bash
yarn preview
```

## Integration with Electron

To integrate this download manager into your Electron application, follow these steps:

### 1. Import the download manager in your main Electron process:

```javascript
const { onWillDownload } = require('./backend_concept/history.manager.js');
```

### 2. Register download update callback (optional):

```javascript
const { SetToFireOnUpdate } = require('./backend_concept/history.manager.js');

SetToFireOnUpdate((downloadRecord) => {
  console.log('Download updated:', downloadRecord);
  // Handle download updates here
});
```

### 3. Hook into the download event:

```javascript
this.dashboardView.webContents.session.on('will-download', (event, item, webContents) => {
  onWillDownload(event, item, webContents);
});
```

## API Reference

### Download Manager Functions

#### `onWillDownload(event, item, webContents)`
Handles download initialization and tracking. Call this in the Electron `will-download` event handler.

**Parameters:**
- `event` - Electron download event
- `item` - Electron DownloadItem object
- `webContents` - Electron webContents object

#### `SetToFireOnUpdate(callback)`
Registers a callback function that fires when a download is updated.

**Parameters:**
- `callback(downloadRecord)` - Function to call with updated download record

**Example:**
```javascript
SetToFireOnUpdate((record) => {
  console.log('Download progress:', record.downloadedSize, '/', record.fileSize);
});
```

#### `getDownloadsPaginated(page, pageSize)`
Retrieves paginated list of downloads.

**Parameters:**
- `page` (default: 1) - Page number
- `pageSize` (default: 10) - Items per page

**Returns:**
```javascript
{
  success: boolean,
  items: DownloadItem[],
  total: number,
  hasMore: boolean
}
```

#### `searchDownloadsByFileName(query, page, pageSize)`
Searches downloads by file name.

**Parameters:**
- `query` - Search string
- `page` (default: 1) - Page number
- `pageSize` (default: 10) - Items per page

**Returns:**
```javascript
{
  success: boolean,
  items: DownloadItem[],
  total: number,
  hasMore: boolean
}
```

#### `deleteDownloadsByIds(ids)`
Deletes downloads by their IDs.

**Parameters:**
- `ids` - Array of download IDs

**Returns:** Number of deleted records

#### `getDownloadById(id)`
Retrieves a specific download record.

**Parameters:**
- `id` - Download ID

**Returns:** DownloadItem or null

## TypeScript Interfaces

### DownloadItem
```typescript
interface DownloadItem {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  downloadedSize: number;
  downloadedAt: number;
  state: string;
  fileExists: 0 | 1;
  downloadTime?: number;
}
```

## Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn lint` - Run ESLint code quality checks
- `yarn preview` - Preview production build locally

## Database Schema

The application uses SQLite with the following schema:

```sql
CREATE TABLE downloads (
  id TEXT PRIMARY KEY,
  fileName TEXT,
  filePath TEXT,
  mimeType TEXT,
  fileSize INTEGER,
  downloadedSize INTEGER,
  state TEXT,
  fileExists INTEGER DEFAULT 1,
  downloadedAt INTEGER NOT NULL,
  downloadTime INTEGER
);
```

**Indexes:**
- `idx_downloads_fileName` - For faster file name searches
- `idx_downloads_downloadedAt` - For sorting by download date

## Troubleshooting

### Issue: better-sqlite3 compilation fails

**Solution:** Ensure you have build tools installed for your operating system (see Prerequisites section).

### Issue: Downloads not being tracked

**Solution:** Verify that the `onWillDownload` callback is properly hooked into the Electron `will-download` event and that the database path is correct.

### Issue: UI not updating in real-time

**Solution:** Check that the `downloadStateUpdated` callback is properly bound and that the React component state is being updated correctly.

### Issue: Database file not being created

**Solution:** Ensure that the directory specified by `appConfig.root` exists and has write permissions.

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows the existing style
- TypeScript types are properly defined
- New features include appropriate documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## Roadmap

- [ ] Export download history (CSV, JSON)
- [ ] Download retry functionality
- [ ] Pause/resume download support
- [ ] File preview for common types
- [ ] Download speed analytics
- [ ] Custom folder organization

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [Fluent UI](https://react.fluentui.dev/)
- Database managed with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

---

**Happy downloading!** 🎉
