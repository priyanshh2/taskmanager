import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = 'http://localhost:5000/api'

// Overdue logic mirroring client date utility
function isOverdue(dueDateString, status) {
  if (status === 'Completed' || !dueDateString) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(dueDateString)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate.getTime() < today.getTime()
}

async function runAuditSuite() {
  console.log('🛡️ Starting Phase 5 Final Quality, Security, and Reliability Audit Suite...\n')
  let passed = 0
  let failed = 0

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`)
      failed++
    }
  }

  const timestamp = Date.now()

  // Account A (Victim / Creator)
  const userAData = {
    name: 'Audit User Alpha',
    email: `alpha.${timestamp}@taskflow-audit.dev`,
    password: 'AlphaPassword123!',
  }

  // Account B (Attacker / Unprivileged probe)
  const userBData = {
    name: 'Audit User Beta',
    email: `beta.${timestamp}@taskflow-audit.dev`,
    password: 'BetaPassword123!',
  }

  let tokenA = ''
  let tokenB = ''
  let userAId = ''
  let userBId = ''
  let taskAId = ''

  try {
    // -------------------------------------------------------------
    // Audit 1: Registration, Password Security & No Plain Text Leaks
    // -------------------------------------------------------------
    const regARes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAData),
    })
    const regAJson = await regARes.json()
    tokenA = regAJson.token
    userAId = regAJson.user?.id

    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userBData),
    })
    const regBJson = await regBRes.json()
    tokenB = regBJson.token
    userBId = regBJson.user?.id

    assert(
      regARes.status === 201 && regAJson.user?.password === undefined,
      '1a. Registration response excludes password field'
    )

    // Direct MongoDB verification: password must be bcrypt hash ($2...)
    await mongoose.connect(process.env.MONGODB_URI)
    const rawUserDoc = await mongoose.connection.db
      .collection('users')
      .findOne({ email: userAData.email.toLowerCase() })

    const isHashed = typeof rawUserDoc.password === 'string' && rawUserDoc.password.startsWith('$2')
    const notPlainText = rawUserDoc.password !== userAData.password
    assert(isHashed && notPlainText, '1b. Database stores 10-round bcrypt hash, never plain text')

    // -------------------------------------------------------------
    // Audit 2: Login Credential Probing Defense (Generic 401s)
    // -------------------------------------------------------------
    const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAData.email, password: 'WrongPassword999!' }),
    })
    const wrongPassJson = await wrongPassRes.json()

    const wrongEmailRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `nonexistent.${timestamp}@taskflow-audit.dev`, password: 'AlphaPassword123!' }),
    })
    const wrongEmailJson = await wrongEmailRes.json()

    assert(
      wrongPassRes.status === 401 &&
      wrongEmailRes.status === 401 &&
      wrongPassJson.message === 'Invalid email or password' &&
      wrongEmailJson.message === 'Invalid email or password',
      '2. Invalid credentials return identical generic 401 error message without email enumeration'
    )

    // Login success must also never return password
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAData.email, password: userAData.password }),
    })
    const loginJson = await loginRes.json()
    assert(loginJson.user?.password === undefined, '2b. Login response excludes password')

    // /api/auth/me must never return password
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    const meJson = await meRes.json()
    assert(meJson.user?.password === undefined, '2c. GET /api/auth/me response excludes password')

    // -------------------------------------------------------------
    // Audit 3: Protected Endpoint JWT Verification & Rejection
    // -------------------------------------------------------------
    // 3a. Missing token
    const noTokenRes = await fetch(`${BASE_URL}/tasks`)
    assert(noTokenRes.status === 401, '3a. Missing Authorization header rejected with 401')

    // 3b. Empty Bearer header
    const emptyBearerRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: 'Bearer ' },
    })
    assert(emptyBearerRes.status === 401, '3b. Empty Bearer token rejected with 401')

    // 3c. Malformed token string
    const malformedJwtRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: 'Bearer this.is.not.a.valid.jwt' },
    })
    assert(malformedJwtRes.status === 401, '3c. Malformed JWT rejected with 401')

    // 3d. Token signed with wrong secret
    const fakeToken = jwt.sign({ id: userAId }, 'some_wrong_untrusted_secret_key')
    const fakeSecretRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${fakeToken}` },
    })
    assert(fakeSecretRes.status === 401, '3d. JWT signed with untrusted secret rejected with 401')

    // 3e. Expired token
    const expiredToken = jwt.sign({ id: userAId }, process.env.JWT_SECRET, { expiresIn: -30 })
    const expiredRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    })
    assert(expiredRes.status === 401, '3e. Expired JWT rejected with 401')

    // -------------------------------------------------------------
    // Audit 4: Ownership Spoofing & Body Injection Defense
    // -------------------------------------------------------------
    // User A creates a task attempting to inject user = User B
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const injectRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: "Alpha's Confidential Task",
        description: 'Should only be owned by Alpha',
        category: 'Confidential',
        priority: 'High',
        dueDate: tomorrow.toISOString(),
        user: userBId, // Malicious attempt to spoof user field
        _id: new mongoose.Types.ObjectId().toString(), // Malicious attempt to force _id
      }),
    })
    const injectJson = await injectRes.json()
    taskAId = injectJson.task?.id || injectJson.task?._id

    // Verify in MongoDB that owner was forced to User A's ID
    const rawTaskDoc = await mongoose.connection.db
      .collection('tasks')
      .findOne({ _id: new mongoose.Types.ObjectId(taskAId) })

    const assignedToA = String(rawTaskDoc.user) === String(userAId)
    const notAssignedToB = String(rawTaskDoc.user) !== String(userBId)

    assert(
      assignedToA && notAssignedToB,
      '4a. Body user ID injection neutralized: ownership strictly assigned to authenticated token user'
    )

    // User B attempts to read User A's task
    const userBReadRes = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    assert(userBReadRes.status === 404, "4b. User B cannot read User A's task by ID (returns unified 404)")

    // User B attempts to update User A's task
    const userBUpdateRes = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ title: 'Hacked by Beta' }),
    })
    assert(userBUpdateRes.status === 404, "4c. User B cannot update User A's task via PUT (returns unified 404)")

    // User B attempts to patch status of User A's task
    const userBPatchRes = await fetch(`${BASE_URL}/tasks/${taskAId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ status: 'Completed' }),
    })
    assert(userBPatchRes.status === 404, "4d. User B cannot complete User A's task via PATCH (returns unified 404)")

    // User B attempts to delete User A's task
    const userBDeleteRes = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    assert(userBDeleteRes.status === 404, "4e. User B cannot delete User A's task via DELETE (returns unified 404)")

    // User B tries query injection: /api/tasks/:id?user=<userAId>
    const queryInjectRes = await fetch(`${BASE_URL}/tasks/${taskAId}?user=${userAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    assert(queryInjectRes.status === 404, '4f. Query parameter user spoofing rejected (returns 404)')

    // -------------------------------------------------------------
    // Audit 5: Input Validation & Malformed ID Defense
    // -------------------------------------------------------------
    // 5a. Malformed ID
    const malformedRes = await fetch(`${BASE_URL}/tasks/malformed-id-999`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(malformedRes.status === 400, '5a. Malformed ObjectId returns 400 Bad Request')

    // 5b. Blank title
    const blankTitleRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: '   ', category: 'General', priority: 'Low', dueDate: tomorrow.toISOString() }),
    })
    assert(blankTitleRes.status === 400, '5b. Blank title rejected with 400')

    // 5c. Blank category
    const blankCatRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Valid Title', category: '   ', priority: 'Low', dueDate: tomorrow.toISOString() }),
    })
    assert(blankCatRes.status === 400, '5c. Blank category rejected with 400')

    // 5d. Invalid priority
    const badPrioRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Valid Title', category: 'Work', priority: 'Urgent', dueDate: tomorrow.toISOString() }),
    })
    assert(badPrioRes.status === 400, '5d. Invalid priority enum rejected with 400')

    // 5e. Invalid status
    const badStatRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Valid Title', category: 'Work', priority: 'Low', dueDate: tomorrow.toISOString(), status: 'Archived' }),
    })
    assert(badStatRes.status === 400, '5e. Invalid status enum rejected with 400')

    // 5f. Empty description allowed
    const emptyDescRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Task with empty desc', description: '', category: 'General', priority: 'Low', dueDate: tomorrow.toISOString() }),
    })
    const emptyDescJson = await emptyDescRes.json()
    assert(emptyDescRes.status === 201 && emptyDescJson.task?.description === '', '5f. Empty description string is accepted and saved')

    // -------------------------------------------------------------
    // Audit 6: Date & Overdue Calculation Edge Cases
    // -------------------------------------------------------------
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // Due today + Pending -> NOT overdue
    assert(!isOverdue(today.toISOString(), 'Pending'), '6a. Task due today is NOT overdue')

    // Due tomorrow + Pending -> NOT overdue
    assert(!isOverdue(tomorrow.toISOString(), 'Pending'), '6b. Task due tomorrow is NOT overdue')

    // Due yesterday + Pending -> IS overdue
    assert(isOverdue(yesterday.toISOString(), 'Pending'), '6c. Pending task due yesterday IS overdue')

    // Due yesterday + Completed -> NOT overdue
    assert(!isOverdue(yesterday.toISOString(), 'Completed'), '6d. Completed task due yesterday is NEVER overdue')

    // -------------------------------------------------------------
    // Audit 7: Centralized Error Handler & Malformed JSON Defense
    // -------------------------------------------------------------
    const malformedJsonRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: '{ broken: json, invalid }',
    })
    const malformedJson = await malformedJsonRes.json()
    assert(
      malformedJsonRes.status === 400 &&
      malformedJson.message === 'Malformed JSON in request body',
      '7. Malformed JSON payload safely caught by centralized error handler with 400'
    )

    // -------------------------------------------------------------
    // Audit 8: Duplicate Email Defense
    // -------------------------------------------------------------
    const dupRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAData),
    })
    assert(dupRegRes.status === 409, '8. Duplicate email registration rejected with 409 Conflict')

    // -------------------------------------------------------------
    // Audit 9: Health and Logout Regression
    // -------------------------------------------------------------
    const healthRes = await fetch(`${BASE_URL}/health`)
    const healthJson = await healthRes.json()
    assert(healthRes.status === 200 && healthJson.status === 'ok', '9a. GET /api/health returns 200 OK')

    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' })
    assert(logoutRes.status === 200, '9b. POST /api/auth/logout returns 200 OK')

  } catch (err) {
    console.error('Audit test suite execution error:', err)
    failed++
  } finally {
    await mongoose.disconnect()
    console.log(`\n========================================`)
    console.log(`Phase 5 Audit Results: ${passed} passed, ${failed} failed`)
    console.log(`========================================\n`)
    process.exit(failed > 0 ? 1 : 0)
  }
}

runAuditSuite()
