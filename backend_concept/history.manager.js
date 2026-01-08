const Database = require('better-sqlite3');
const { appConfig } = require('../../../App_Config')
const path = require('path');
const { randomString } = require('../../../utils/common');
const _ = require("lodash");
// Open or create the database
const dbPath = path.join(appConfig.root, 'common_user_data.db');
const db = new Database(dbPath);

// db.prepare(`DROP TABLE IF EXISTS downloads`).run();
// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS downloads (
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
  )
`).run();

// Add index for faster filename search
db.prepare(`CREATE INDEX IF NOT EXISTS idx_downloads_fileName ON downloads(fileName)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_downloads_downloadedAt ON downloads(downloadedAt)`).run();

function addDownload(item) {
    const stmt = db.prepare(`
    INSERT INTO downloads (id, fileName, filePath, mimeType, fileSize, state, downloadedAt, fileExists, downloadTime)
    VALUES (@id, @fileName, @filePath, @mimeType, @fileSize, @state, @downloadedAt, @fileExists, @downloadTime)
  `);
    stmt.run(item);
}
let toFireOnUpdate
function SetToFireOnUpdate(fun){
    toFireOnUpdate=fun
}

function getDownloadsPaginated(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    // Count total rows
    const totalStmt = db.prepare(`SELECT COUNT(*) as count FROM downloads`);
    const total = totalStmt.get().count;

    // Fetch paginated rows
    const stmt = db.prepare(`
        SELECT * FROM downloads
        ORDER BY downloadedAt DESC
        LIMIT ? OFFSET ?
    `);
    const items = stmt.all(pageSize, offset);

    return {
        success: true,
        items,
        total,
        hasMore: offset + items.length < total
    };
}

function searchDownloadsByFileName(query, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const searchTerm = `%${query}%`;

    // Count total rows matching search
    const totalStmt = db.prepare(`
        SELECT COUNT(*) as count
        FROM downloads
        WHERE fileName LIKE ?
    `);
    const total = totalStmt.get(searchTerm).count;

    // Fetch paginated rows
    const stmt = db.prepare(`
        SELECT * FROM downloads
        WHERE fileName LIKE ?
        ORDER BY downloadedAt DESC
        LIMIT ? OFFSET ?
    `);
    const items = stmt.all(searchTerm, pageSize, offset);

    return {
        success: true,
        items,
        total,
        hasMore: offset + items.length < total
    };
}

function updateDownload(id, updates) {
    const stmt = db.prepare(`
    UPDATE downloads
    SET fileName       = @fileName,
        filePath       = @filePath,
        mimeType       = @mimeType,
        fileSize       = @fileSize,
        downloadedSize = @downloadedSize,
        fileExists     = @fileExists,
        state          = @state,
        downloadedAt   = @downloadedAt,
        downloadTime   = @downloadTime
    WHERE id = @id AND state != 'completed'
  `);
    try {
        console.log("Called to be fired on update")
        if(toFireOnUpdate)toFireOnUpdate(updates)
    } catch (error) {
        console.log(error)    
    }
    try {
        // delete updates.id
        const result = stmt.run(updates);
        if (result.changes > 0) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.error('Error updating download:', err);
        return false
    }
}
function updateFileExistDownload(id, fileExists) {
    const stmt = db.prepare(`
    UPDATE downloads
    SET fileExists     = @fileExists
    WHERE id = @id
  `);
    try {
        // delete updates.id
        const result = stmt.run({id:id,fileExists:fileExists});
        if (result.changes > 0) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.error('Error updating download:', err);
        return false
    }
}

function createDBRecordObj(id, item) {
    return {
        id: id,
        fileName: item.getFilename(),
        filePath: item.getSavePath(),
        mimeType: item.getMimeType(),
        fileSize: item.getTotalBytes(),
        downloadedSize:item.getReceivedBytes(),
        state: item.getState(),
        fileExists:1,
        downloadedAt: item.getStartTime(),
        downloadTime: item.getEndTime()
    }
}

function deleteDownloadsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return 0; // nothing to delete
  }

  // Create placeholders for each id
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM downloads WHERE id IN (${placeholders})`);

  const result = stmt.run(...ids);
  return result.changes; // number of rows deleted
}
function getDownloadById(id) {
  const stmt = db.prepare(`SELECT * FROM downloads WHERE id = ?`);
  const record = stmt.get(id);
  return record || null; // returns null if no match
}


const onWillDownload = (event, item, webContents) => {
    try {
        const id = randomString(18)
        // console.log(1)
        const debouncedUpdateDownload = _.debounce(
            updateDownload
            , 500, { trailing: true })
        addDownload(createDBRecordObj(id, item))
        item.on('updated', (event, state) => {
            debouncedUpdateDownload(id, createDBRecordObj(id, item))
        })
        item.once('done', (event, state) => {
            debouncedUpdateDownload.cancel();
            updateDownload(id, createDBRecordObj(id, item))
        })
    } catch (e) {
        console.log(e)
    }
}


module.exports = {
    onWillDownload,
    getDownloadsPaginated,
    searchDownloadsByFileName,
    SetToFireOnUpdate,
    deleteDownloadsByIds,
    getDownloadById,
    updateFileExistDownload
}