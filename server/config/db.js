const mongoose = require('mongoose');

class MongoDatabase {
  constructor() {
    this.isConnected = false;
    this.connect();
  }

  async connect() {
    if (this.isConnected) return;
    try {
      if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is missing in .env file. Database will fail to connect.');
        return;
      }
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      this.isConnected = true;
      console.log('MongoDB successfully connected.');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  async _ensureConnection() {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  getCollection(name) {
    if (!mongoose.connection.db) throw new Error('Database not initialized');
    return mongoose.connection.db.collection(name);
  }

  async _getNextUserId() {
    await this._ensureConnection();
    const col = this.getCollection('users');
    const users = await col.find({ id: { $regex: '^RV' } }).toArray();
    let maxNum = 0;
    users.forEach(item => {
      if (item && item.id) {
        const numPart = parseInt(item.id.replace('RV', ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `RV${String(nextNum).padStart(8, '0')}`;
  }

  async insert(collection, doc) {
    await this._ensureConnection();
    const col = this.getCollection(collection);
    
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
    
    await col.insertOne(newDoc);
    return newDoc;
  }

  async find(collection, query = {}) {
    await this._ensureConnection();
    const col = this.getCollection(collection);
    return await col.find(query).toArray();
  }

  async findOne(collection, query = {}) {
    await this._ensureConnection();
    const col = this.getCollection(collection);
    return await col.findOne(query);
  }

  async update(collection, query, updateData) {
    await this._ensureConnection();
    const col = this.getCollection(collection);
    const updatePayload = {
      $set: {
        ...updateData,
        updatedAt: new Date().toISOString()
      }
    };
    const result = await col.updateMany(query, updatePayload);
    return result.modifiedCount;
  }

  async delete(collection, query) {
    await this._ensureConnection();
    const col = this.getCollection(collection);
    const result = await col.deleteMany(query);
    return result.deletedCount;
  }
}

module.exports = new MongoDatabase();
