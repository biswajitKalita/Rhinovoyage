const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DB_DIR = process.env.DATABASE_DIR || path.join(__dirname, '../../database');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (e) {}
}

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.collections = {
      users: path.join(DB_DIR, 'users.json'),
      bookings: path.join(DB_DIR, 'bookings.json'),
      notifications: path.join(DB_DIR, 'notifications.json'),
      cars: path.join(DB_DIR, 'cars.json')
    };

    // Initialize files if they don't exist
    Object.keys(this.collections).forEach(name => {
      const filePath = this.collections[name];
      if (!fs.existsSync(filePath)) {
        try { fs.writeFileSync(filePath, JSON.stringify([], null, 2)); } catch (e) {}
      }
    });

    this.connect();
  }

  async connect() {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://rhinovoyage_db_user:rhinovoyage_db_user@cluster0.ugudnsi.mongodb.net/rhinovoyage?appName=Cluster0';
    try {
      await mongoose.connect(mongoUri);
      this.isConnected = true;
      console.log('MongoDB successfully connected.');
    } catch (error) {
      console.warn('MongoDB connection notice:', error.message, '— Running on filesystem JSON database fallback.');
      this.isConnected = false;
    }
  }

  async _ensureConnection() {
    if (!this.isConnected && process.env.MONGO_URI) {
      await this.connect();
    }
  }

  getCollection(name) {
    if (this.isConnected && mongoose.connection && mongoose.connection.db) {
      return mongoose.connection.db.collection(name);
    }
    return null;
  }

  _readJson(collection) {
    try {
      const filePath = this.collections[collection];
      if (!filePath || !fs.existsSync(filePath)) return [];
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content || '[]');
    } catch (e) {
      return [];
    }
  }

  _writeJson(collection, data) {
    try {
      const filePath = this.collections[collection];
      if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async _getNextUserId() {
    if (this.isConnected) {
      try {
        const col = this.getCollection('users');
        if (col) {
          const users = await col.find({ id: { $regex: '^RV' } }).toArray();
          let maxNum = 0;
          users.forEach(item => {
            if (item && item.id) {
              const numPart = parseInt(item.id.replace('RV', ''), 10);
              if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
            }
          });
          return `RV${String(maxNum + 1).padStart(8, '0')}`;
        }
      } catch (e) {}
    }
    const users = this._readJson('users');
    let maxNum = 0;
    users.forEach(item => {
      if (item && item.id && typeof item.id === 'string' && item.id.startsWith('RV')) {
        const numPart = parseInt(item.id.replace('RV', ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
      }
    });
    return `RV${String(maxNum + 1).padStart(8, '0')}`;
  }

  async insert(collection, doc) {
    let docId = doc.id;
    if (!docId) {
      if (collection === 'users') {
        docId = await this._getNextUserId();
      } else {
        docId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      }
    }

    const newDoc = {
      id: docId,
      createdAt: new Date().toISOString(),
      ...doc
    };

    if (this.isConnected) {
      try {
        const col = this.getCollection(collection);
        if (col) {
          await col.insertOne(newDoc);
          return newDoc;
        }
      } catch (e) {
        console.warn('Mongo insert notice, using JSON fallback:', e.message);
      }
    }

    const data = this._readJson(collection);
    data.push(newDoc);
    this._writeJson(collection, data);
    return newDoc;
  }

  async find(collection, query = {}) {
    if (this.isConnected) {
      try {
        const col = this.getCollection(collection);
        if (col) {
          return await col.find(query).toArray();
        }
      } catch (e) {
        console.warn('Mongo find notice, using JSON fallback:', e.message);
      }
    }

    const data = this._readJson(collection);
    return data.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async findOne(collection, query = {}) {
    if (this.isConnected) {
      try {
        const col = this.getCollection(collection);
        if (col) {
          return await col.findOne(query);
        }
      } catch (e) {
        console.warn('Mongo findOne notice, using JSON fallback:', e.message);
      }
    }

    const data = this._readJson(collection);
    return data.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  async update(collection, query, updateData) {
    if (this.isConnected) {
      try {
        const col = this.getCollection(collection);
        if (col) {
          const updatePayload = {
            $set: {
              ...updateData,
              updatedAt: new Date().toISOString()
            }
          };
          const result = await col.updateMany(query, updatePayload);
          return result.modifiedCount;
        }
      } catch (e) {
        console.warn('Mongo update notice, using JSON fallback:', e.message);
      }
    }

    const data = this._readJson(collection);
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
      this._writeJson(collection, updatedData);
    }
    return updatedCount;
  }

  async delete(collection, query) {
    if (this.isConnected) {
      try {
        const col = this.getCollection(collection);
        if (col) {
          const result = await col.deleteMany(query);
          return result.deletedCount;
        }
      } catch (e) {
        console.warn('Mongo delete notice, using JSON fallback:', e.message);
      }
    }

    const data = this._readJson(collection);
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
      this._writeJson(collection, filteredData);
    }
    return deletedCount;
  }
}

module.exports = new DatabaseManager();
