import mongoose from 'mongoose'

/**
 * Connect to MongoDB using Mongoose.
 * Reads the connection URI from process.env.MONGODB_URI.
 * Provides clear logging for both success and failure cases.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('\n❌ [MongoDB Error] MONGODB_URI is not defined in environment variables.')
    console.error('👉 Please configure MONGODB_URI in your server/.env file.')
    console.error('   - For local MongoDB: MONGODB_URI=mongodb://127.0.0.1:27017/taskflow')
    console.error('   - For MongoDB Atlas: MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskflow\n')
    return null
  }

  try {
    const conn = await mongoose.connect(uri)
    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error(`\n❌ [MongoDB Connection Error] Failed to connect: ${error.message}`)
    console.error('👉 Troubleshooting steps:')
    console.error('   1. For local MongoDB: Ensure the MongoDB service is running (e.g. `net start MongoDB` on Windows).')
    console.error('   2. For MongoDB Atlas: Ensure network access / IP whitelist (0.0.0.0/0 or your current IP) and credentials are valid.\n')
    // We do not silently exit or swallow the error
    return null
  }
}
