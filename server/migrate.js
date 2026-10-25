import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()

const localUri = 'mongodb://127.0.0.1:27017/taskflow'
const targetUri = process.env.TARGET_MONGODB_URI || process.argv[2] || process.env.MONGODB_URI

if (!targetUri || targetUri.includes('127.0.0.1') || targetUri.includes('localhost')) {
  console.error('❌ Please provide target MongoDB Atlas URI as an argument or set TARGET_MONGODB_URI / MONGODB_URI in server/.env.')
  console.error('Usage: node migrate.js "<atlas-connection-string>"')
  process.exit(1)
}

// Ensure database name is included in target URI
let normalizedTargetUri = targetUri
if (normalizedTargetUri.includes('?') && !normalizedTargetUri.split('?')[0].includes('/', 10)) {
  normalizedTargetUri = normalizedTargetUri.replace('?', 'taskflow?')
}

async function migrate() {
  console.log('🔄 [Migration] Connecting to local MongoDB:', localUri)
  const localConn = await mongoose.createConnection(localUri).asPromise()
  console.log('✅ Connected to local MongoDB.')

  console.log('🔄 [Migration] Connecting to destination MongoDB Atlas...')
  const targetConn = await mongoose.createConnection(normalizedTargetUri).asPromise()
  console.log(`✅ Connected to destination MongoDB Atlas! Database: ${targetConn.name}`)

  const localUsersCol = localConn.collection('users')
  const localTasksCol = localConn.collection('tasks')

  const targetUsersCol = targetConn.collection('users')
  const targetTasksCol = targetConn.collection('tasks')

  // Fetch local data
  const users = await localUsersCol.find({}).toArray()
  const tasks = await localTasksCol.find({}).toArray()

  console.log(`\n📦 Found ${users.length} users and ${tasks.length} tasks in local database.`)

  // Migrate Users (upsert by _id)
  if (users.length > 0) {
    console.log(`⏳ Migrating ${users.length} users...`)
    const userOps = users.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: user },
        upsert: true,
      },
    }))
    const userResult = await targetUsersCol.bulkWrite(userOps)
    console.log(`✅ Users migrated: ${userResult.upsertedCount} inserted, ${userResult.modifiedCount} updated.`)
  }

  // Migrate Tasks (upsert by _id)
  if (tasks.length > 0) {
    console.log(`⏳ Migrating ${tasks.length} tasks...`)
    const taskOps = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task._id },
        update: { $set: task },
        upsert: true,
      },
    }))
    const taskResult = await targetTasksCol.bulkWrite(taskOps)
    console.log(`✅ Tasks migrated: ${taskResult.upsertedCount} inserted, ${taskResult.modifiedCount} updated.`)
  }

  // Verification
  const destUserCount = await targetUsersCol.countDocuments()
  const destTaskCount = await targetTasksCol.countDocuments()

  console.log('\n📊 [Verification in Destination Atlas DB]:')
  console.log(`   - Users count: ${destUserCount}`)
  console.log(`   - Tasks count: ${destTaskCount}`)

  await localConn.close()
  await targetConn.close()
  console.log('\n🎉 Migration completed successfully!')
}

migrate().catch((err) => {
  console.error('\n❌ Migration failed:', err.message)
  process.exit(1)
})
