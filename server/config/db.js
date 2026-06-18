const fs = require('fs');
const path = require('path');

const DB_DIR = process.env.DATABASE_DIR || path.join(__dirname, '../../database');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class JsonDatabase {
  constructor() {
    this.collections = {
      users: path.join(DB_DIR, 'users.json'),
      bookings: path.join(DB_DIR, 'bookings.json'),
      notifications: path.join(DB_DIR, 'notifications.json')
    };

    // Initialize files if they don't exist
    Object.keys(this.collections).forEach(name => {
      const filePath = this.collections[name];
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    });
  }

  _read(collection) {
    try {
      const filePath = this.collections[collection];
      if (!filePath) throw new Error(`Collection '${collection}' does not exist.`);
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content || '[]');
    } catch (error) {
      console.error(`Error reading collection ${collection}:`, error);
      return [];
    }
  }

  _write(collection, data) {
    try {
      const filePath = this.collections[collection];
      if (!filePath) throw new Error(`Collection '${collection}' does not exist.`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing collection ${collection}:`, error);
      return false;
    }
  }

  // Insert a new document
  insert(collection, doc) {
    const data = this._read(collection);
    const newDoc = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...doc
    };
    data.push(newDoc);
    this._write(collection, data);
    return newDoc;
  }

  // Find all documents matching query
  find(collection, query = {}) {
    const data = this._read(collection);
    return data.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  // Find single document
  findOne(collection, query = {}) {
    const data = this._read(collection);
    return data.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  // Update documents matching query
  update(collection, query, updateData) {
    const data = this._read(collection);
    let updatedCount = 0;
    
    const updatedData = data.map(item => {
      let matches = true;
      for (let key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        return { ...item, ...updateData, updatedAt: new Date().toISOString() };
      }
      return item;
    });

    if (updatedCount > 0) {
      this._write(collection, updatedData);
    }
    return updatedCount;
  }

  // Delete documents matching query
  delete(collection, query) {
    const data = this._read(collection);
    const initialLength = data.length;
    
    const filteredData = data.filter(item => {
      let matches = true;
      for (let key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      return !matches;
    });

    const deletedCount = initialLength - filteredData.length;
    if (deletedCount > 0) {
      this._write(collection, filteredData);
    }
    return deletedCount;
  }
}

module.exports = new JsonDatabase();
