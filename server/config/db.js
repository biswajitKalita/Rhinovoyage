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
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('MONGO_URI is missing in environment. Running on filesystem JSON database fallback.');
      this.isConnected = false;
      return;
    }
    try {
      await mongoose.connect(mongoUri);
      this.isConnected = true;
      console.log('MongoDB successfully connected.');
      await this._seedInitialData();
    } catch (error) {
      console.warn('MongoDB connection notice:', error.message, '— Running on filesystem JSON database fallback.');
      this.isConnected = false;
    }
  }

  async _seedInitialData() {
    try {
      if (!this.isConnected || !mongoose.connection || !mongoose.connection.db) return;

      // Seed users if collection is empty
      const userCol = this.getCollection('users');
      if (userCol && (await userCol.countDocuments()) === 0) {
        const jsonUsers = this._readJson('users');
        if (jsonUsers.length > 0) {
          await userCol.insertMany(jsonUsers);
          console.log(`Synced ${jsonUsers.length} initial users to MongoDB.`);
        }
      }

      // Seed fleet cars if collection is empty
      const carCol = this.getCollection('cars');
      if (carCol && (await carCol.countDocuments()) === 0) {
        const jsonCars = this._readJson('cars');
        if (jsonCars.length > 0) {
          await carCol.insertMany(jsonCars);
          console.log(`Synced ${jsonCars.length} initial cars to MongoDB.`);
        }
      }
    } catch (err) {
      console.warn('Initial MongoDB sync notice:', err.message);
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

  _normalizeMongoQuery(query) {
    if (!query) return {};
    const normalized = { ...query };
    if (normalized.id && mongoose.Types.ObjectId.isValid(normalized.id)) {
      const objId = new mongoose.Types.ObjectId(normalized.id);
      normalized.$or = [{ id: normalized.id }, { _id: objId }];
      delete normalized.id;
    }
    return normalized;
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
        }
      } catch (e) {
        console.warn('Mongo insert notice, using JSON fallback:', e.message);
      }
    }

    // Always mirror to disk so local storage and fallback remain 100% in sync
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
          const mQuery = this._normalizeMongoQuery(query);
          return await col.find(mQuery).toArray();
        }
      } catch (e) {
        console.warn('Mongo find notice, using JSON fallback:', e.message);
      }
    }

    const data = this._readJson(collection);
    return data.filter(item => {
      for (let key in query) {
        if (key === 'id') {
          if (item.id !== query.id && item._id !== query.id) return false;
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(collection, query = {}) {
    if (this.isConnected) {
      try {
        const col = this.getCollection(collection);
        if (col) {
          const mQuery = this._normalizeMongoQuery(query);
          return await col.findOne(mQuery);
        }
      } catch (e) {
        console.warn('Mongo findOne notice, using JSON fallback:', e.message);
      }
    }

    const data = this._readJson(collection);
    return data.find(item => {
      for (let key in query) {
        if (key === 'id') {
          if (item.id !== query.id && item._id !== query.id) return false;
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  }

  async update(collection, query, updateData) {
    let mongoModified = 0;
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
          const mQuery = this._normalizeMongoQuery(query);
          const result = await col.updateMany(mQuery, updatePayload);
          mongoModified = result.modifiedCount;
        }
      } catch (e) {
        console.warn('Mongo update notice, using JSON fallback:', e.message);
      }
    }

    // Always mirror update to disk
    const data = this._readJson(collection);
    let updatedCount = 0;
    const updatedData = data.map(item => {
      let matches = true;
      for (let key in query) {
        if (key === 'id') {
          if (item.id !== query.id && item._id !== query.id) {
            matches = false;
            break;
          }
        } else if (item[key] !== query[key]) {
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
    return this.isConnected ? mongoModified : updatedCount;
  }

  async delete(collection, query) {
    let mongoDeleted = 0;
    if (this.isConnected) {
      try {
        const col = this.getCollection(collection);
        if (col) {
          const mQuery = this._normalizeMongoQuery(query);
          const result = await col.deleteMany(mQuery);
          mongoDeleted = result.deletedCount;
        }
      } catch (e) {
        console.warn('Mongo delete notice, using JSON fallback:', e.message);
      }
    }

    // Always mirror deletion to disk
    const data = this._readJson(collection);
    const initialLength = data.length;
    const filteredData = data.filter(item => {
      let matches = true;
      for (let key in query) {
        if (key === 'id') {
          if (item.id !== query.id && item._id !== query.id) {
            matches = false;
            break;
          }
        } else if (item[key] !== query[key]) {
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
    return this.isConnected ? mongoDeleted : deletedCount;
  }
}

module.exports = new DatabaseManager();
