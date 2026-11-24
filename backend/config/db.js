const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let connectionPromise;
let memoryServer;

async function connectDB() {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set in the environment');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .then(() => {
        console.log(
          `MongoDB Atlas connected: ${mongoose.connection.host}/${mongoose.connection.name}`,
        );
      })
      .catch(async (atlasError) => {
        console.warn(`MongoDB Atlas unavailable: ${atlasError.message}`);

        if (!memoryServer) {
          memoryServer = await MongoMemoryServer.create({
            instance: { dbName: 'employeeDB' },
          });
        }

        await mongoose.connect(memoryServer.getUri(), {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 8000,
        });
        console.log('MongoDB Memory Server connected for local development');
      })
      .finally(() => {
        connectionPromise = undefined;
      });
  }

  await connectionPromise;
}

module.exports = connectDB;