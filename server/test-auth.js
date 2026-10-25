import mongoose from 'mongoose'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

const BASE_URL = 'http://localhost:5000/api'

async function runTests() {
  console.log('🧪 Starting Phase 2 Backend Auth Verification Suite...\n')
  let passed = 0
  let failed = 0

  function assert(condition, testName, extraInfo = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${extraInfo ? '(' + extraInfo + ')' : ''}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${testName} ${extraInfo ? '(' + extraInfo + ')' : ''}`)
      failed++
    }
  }

  // Generate unique test email to avoid colliding across multiple test runs
  const uniqueId = Date.now()
  const testUser = {
    name: 'Alex Chen',
    email: `alex.${uniqueId}@example.com`,
    password: 'SecurePassword123!',
  }

  let authToken = ''

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`)
    const healthData = await healthRes.json()
    assert(healthRes.status === 200 && healthData.status === 'ok' && healthData.database?.status === 'connected', '1. GET /api/health works and DB is connected')

    // 2. Register new user
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    })
    const regData = await regRes.json()
    authToken = regData.token
    assert(
      regRes.status === 201 &&
      regData.success === true &&
      Boolean(regData.token) &&
      regData.user.email === testUser.email.toLowerCase() &&
      regData.user.password === undefined,
      '2. POST /api/auth/register registers user, returns JWT and safe user object'
    )

    // 3. Reject invalid registration: short password
    const shortPassRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob', email: `bob.${uniqueId}@example.com`, password: 'short' }),
    })
    const shortPassData = await shortPassRes.json()
    assert(shortPassRes.status === 400 && shortPassData.success === false, '3a. Reject registration with short password (< 8 chars)')

    // 3b. Reject invalid registration: invalid email format
    const badEmailRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob', email: 'notanemail', password: 'ValidPass123!' }),
    })
    assert(badEmailRes.status === 400, '3b. Reject registration with invalid email format')

    // 3c. Reject invalid registration: missing name
    const noNameRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: `bob.${uniqueId}@example.com`, password: 'ValidPass123!' }),
    })
    assert(noNameRes.status === 400, '3c. Reject registration with missing name')

    // 4. Reject duplicate email registration
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    })
    const dupData = await dupRes.json()
    assert(dupRes.status === 409 && dupData.success === false, '4. Reject duplicate email registration with 409 Conflict')

    // 5. Verify direct database record contains bcrypt hash, not plain text
    await mongoose.connect(process.env.MONGODB_URI)
    const rawUser = await mongoose.connection.db.collection('users').findOne({ email: testUser.email.toLowerCase() })
    const isBcrypt = typeof rawUser.password === 'string' && rawUser.password.startsWith('$2')
    const plainTextNotPresent = rawUser.password !== testUser.password
    assert(isBcrypt && plainTextNotPresent, '5. Database record contains bcrypt hash ($2...) and no plain text', `Hash prefix: ${rawUser.password.substring(0, 7)}...`)

    // 6. Log in with correct credentials
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    })
    const loginData = await loginRes.json()
    assert(
      loginRes.status === 200 &&
      loginData.success === true &&
      Boolean(loginData.token) &&
      loginData.user.name === testUser.name &&
      loginData.user.password === undefined,
      '6. POST /api/auth/login succeeds with valid credentials'
    )

    // 7. Reject login with wrong password (generic message)
    const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'WrongPassword999!' }),
    })
    const wrongPassData = await wrongPassRes.json()
    assert(
      wrongPassRes.status === 401 &&
      wrongPassData.message === 'Invalid email or password',
      '7. Reject incorrect password with generic 401 error'
    )

    // 8. Reject login with non-existent email (generic message)
    const noUserRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `nonexistent.${uniqueId}@example.com`, password: 'SomePassword123!' }),
    })
    const noUserData = await noUserRes.json()
    assert(
      noUserRes.status === 401 &&
      noUserData.message === 'Invalid email or password',
      '8. Reject non-existent email with generic 401 error'
    )

    // 9. Access protected /api/auth/me with valid Bearer token
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    const meData = await meRes.json()
    assert(
      meRes.status === 200 &&
      meData.success === true &&
      meData.user.email === testUser.email.toLowerCase() &&
      meData.user.password === undefined,
      '9. GET /api/auth/me succeeds with valid Bearer token'
    )

    // 10. Reject /api/auth/me without token
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`)
    assert(noTokenRes.status === 401, '10. Reject GET /api/auth/me without token (401)')

    // 11. Reject /api/auth/me with invalid / malformed token
    const badTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' },
    })
    assert(badTokenRes.status === 401, '11. Reject GET /api/auth/me with invalid token (401)')

    // 11b. Reject /api/auth/me with expired token
    const expiredToken = jwt.sign({ id: regData.user.id }, process.env.JWT_SECRET, { expiresIn: -10 })
    const expiredTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    })
    const expiredTokenData = await expiredTokenRes.json()
    assert(
      expiredTokenRes.status === 401 &&
      expiredTokenData.message.includes('expired'),
      '11b. Reject GET /api/auth/me with expired token (401 Expired)'
    )

    // 12. Test logout endpoint
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' })
    const logoutData = await logoutRes.json()
    assert(logoutRes.status === 200 && logoutData.success === true, '12. POST /api/auth/logout acknowledges client logout')

  } catch (err) {
    console.error('Test execution error:', err)
    failed++
  } finally {
    await mongoose.disconnect()
    console.log(`\n========================================`)
    console.log(`Results: ${passed} passed, ${failed} failed`)
    console.log(`========================================\n`)
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
