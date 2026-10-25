import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = 'http://localhost:5000/api'

async function runTaskTests() {
  console.log('🧪 Starting Phase 3 Task Model & Secure CRUD Verification Suite...\n')
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

  const timestamp = Date.now()

  // User 1
  const user1Data = {
    name: 'Alice User1',
    email: `alice.${timestamp}@example.com`,
    password: 'Password123!',
  }

  // User 2 (to verify strict user isolation)
  const user2Data = {
    name: 'Bob User2',
    email: `bob.${timestamp}@example.com`,
    password: 'Password123!',
  }

  let token1 = ''
  let token2 = ''
  let user1TaskId = ''
  let user2TaskId = ''

  try {
    // -------------------------------------------------------------
    // Setup: Register User 1 & User 2
    // -------------------------------------------------------------
    const reg1Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user1Data),
    })
    const reg1Json = await reg1Res.json()
    token1 = reg1Json.token

    const reg2Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user2Data),
    })
    const reg2Json = await reg2Res.json()
    token2 = reg2Json.token

    // =============================================================
    // 1. Unauthenticated requests cannot create or retrieve tasks
    // =============================================================
    const unauthGetRes = await fetch(`${BASE_URL}/tasks`)
    assert(unauthGetRes.status === 401, '1a. Unauthenticated GET /api/tasks is rejected with 401')

    const unauthPostRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauthorized Task',
        category: 'Work',
        priority: 'High',
        dueDate: '2026-12-31',
      }),
    })
    assert(unauthPostRes.status === 401, '1b. Unauthenticated POST /api/tasks is rejected with 401')

    // =============================================================
    // 2. An authenticated user can create a valid task
    // =============================================================
    const validTaskPayload = {
      title: 'Design Database Schemas',
      description: 'Review Mongoose models for TaskFlow Phase 3',
      category: 'Engineering',
      priority: 'High',
      dueDate: '2026-11-15T18:00:00.000Z',
    }

    const createTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify(validTaskPayload),
    })
    const createTaskData = await createTaskRes.json()
    user1TaskId = createTaskData.task?._id || createTaskData.task?.id

    assert(
      createTaskRes.status === 201 &&
      createTaskData.success === true &&
      createTaskData.task?.title === validTaskPayload.title &&
      createTaskData.task?.status === 'Pending' &&
      createTaskData.task?.priority === 'High' &&
      Boolean(user1TaskId),
      '2. Authenticated user can create a valid task (returns 201 and task object)'
    )

    // Create a task for User 2 as well
    const createU2TaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`,
      },
      body: JSON.stringify({
        title: "Bob's Private Task",
        category: 'Personal',
        priority: 'Medium',
        dueDate: '2026-12-01',
      }),
    })
    const createU2TaskData = await createU2TaskRes.json()
    user2TaskId = createU2TaskData.task?._id || createU2TaskData.task?.id

    // =============================================================
    // 3. Missing required fields and invalid enum values are rejected
    // =============================================================
    // 3a. Missing title
    const noTitleRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ category: 'Work', priority: 'High', dueDate: '2026-12-01' }),
    })
    assert(noTitleRes.status === 400, '3a. Reject task creation with missing title (400)')

    // 3b. Blank title ("   ")
    const blankTitleRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ title: '   ', category: 'Work', priority: 'High', dueDate: '2026-12-01' }),
    })
    assert(blankTitleRes.status === 400, '3b. Reject task creation with blank title (400)')

    // 3c. Missing category
    const noCatRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ title: 'Task without category', priority: 'High', dueDate: '2026-12-01' }),
    })
    assert(noCatRes.status === 400, '3c. Reject task creation with missing category (400)')

    // 3d. Blank category
    const blankCatRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ title: 'Task with blank category', category: '   ', priority: 'High', dueDate: '2026-12-01' }),
    })
    assert(blankCatRes.status === 400, '3d. Reject task creation with blank category (400)')

    // 3e. Invalid priority
    const badPriorityRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ title: 'Task with bad priority', category: 'Work', priority: 'UltraUrgent', dueDate: '2026-12-01' }),
    })
    assert(badPriorityRes.status === 400, '3e. Reject task creation with invalid priority enum (400)')

    // 3f. Missing dueDate
    const noDateRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ title: 'Task without dueDate', category: 'Work', priority: 'Low' }),
    })
    assert(noDateRes.status === 400, '3f. Reject task creation with missing dueDate (400)')

    // 3g. Invalid dueDate
    const badDateRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ title: 'Task with bad dueDate', category: 'Work', priority: 'Low', dueDate: 'not-a-valid-date' }),
    })
    assert(badDateRes.status === 400, '3g. Reject task creation with invalid dueDate (400)')

    // 3h. Invalid status on creation
    const badStatusCreateRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ title: 'Task with bad status', category: 'Work', priority: 'Low', dueDate: '2026-12-01', status: 'Archived' }),
    })
    assert(badStatusCreateRes.status === 400, '3h. Reject task creation with invalid status enum (400)')

    // =============================================================
    // 4. A user can retrieve only their own tasks
    // =============================================================
    const user1ListRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token1}` },
    })
    const user1ListData = await user1ListRes.json()
    const allBelongToUser1 = user1ListData.tasks?.every(t => t.title !== "Bob's Private Task")
    const containsUser1Task = user1ListData.tasks?.some(t => (t.id || t._id) === user1TaskId)

    assert(
      user1ListRes.status === 200 &&
      user1ListData.success === true &&
      containsUser1Task &&
      allBelongToUser1,
      "4. User 1 retrieves only their own tasks (User 2's tasks are excluded)"
    )

    // =============================================================
    // 5. A user can retrieve, update, complete, and delete their own task
    // =============================================================
    // 5a. Retrieve own task by ID
    const getOwnTaskRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}`, {
      headers: { Authorization: `Bearer ${token1}` },
    })
    const getOwnTaskData = await getOwnTaskRes.json()
    assert(
      getOwnTaskRes.status === 200 &&
      getOwnTaskData.success === true &&
      (getOwnTaskData.task?.id || getOwnTaskData.task?._id) === user1TaskId,
      '5a. User can retrieve their own task by ID (200 OK)'
    )

    // 5b. Update allowed fields (title, priority, description)
    const updateRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        title: 'Design Database Schemas (Updated)',
        priority: 'Medium',
        description: 'Updated description for Phase 3 review',
      }),
    })
    const updateData = await updateRes.json()
    assert(
      updateRes.status === 200 &&
      updateData.success === true &&
      updateData.task?.title === 'Design Database Schemas (Updated)' &&
      updateData.task?.priority === 'Medium',
      '5b. User can update allowed fields of their own task via PUT (200 OK)'
    )

    // 5c. Complete task via PATCH /api/tasks/:id/status
    const patchStatusRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ status: 'Completed' }),
    })
    const patchStatusData = await patchStatusRes.json()
    assert(
      patchStatusRes.status === 200 &&
      patchStatusData.success === true &&
      patchStatusData.task?.status === 'Completed',
      '5c. User can mark task Completed via PATCH /api/tasks/:id/status (200 OK)'
    )

    // =============================================================
    // 6. User 2 cannot retrieve User 1's task by ID (returns 404)
    // =============================================================
    const crossGetRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}`, {
      headers: { Authorization: `Bearer ${token2}` },
    })
    const crossGetData = await crossGetRes.json()
    assert(
      crossGetRes.status === 404 &&
      crossGetData.message === 'Task not found',
      "6. User 2 cannot retrieve User 1's task by ID (returns unified 404 Task not found)"
    )

    // =============================================================
    // 7. User 2 cannot edit, complete, or delete User 1's task by ID
    // =============================================================
    // 7a. User 2 tries to PUT User 1's task
    const crossPutRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({ title: 'Hacked Title by User 2' }),
    })
    const crossPutData = await crossPutRes.json()
    assert(
      crossPutRes.status === 404 &&
      crossPutData.message === 'Task not found',
      "7a. User 2 cannot edit User 1's task via PUT (returns 404 Task not found)"
    )

    // 7b. User 2 tries to PATCH status of User 1's task
    const crossPatchRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({ status: 'Pending' }),
    })
    const crossPatchData = await crossPatchRes.json()
    assert(
      crossPatchRes.status === 404 &&
      crossPatchData.message === 'Task not found',
      "7b. User 2 cannot complete or update status of User 1's task (returns 404 Task not found)"
    )

    // 7c. User 2 tries to DELETE User 1's task
    const crossDeleteRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token2}` },
    })
    const crossDeleteData = await crossDeleteRes.json()
    assert(
      crossDeleteRes.status === 404 &&
      crossDeleteData.message === 'Task not found',
      "7c. User 2 cannot delete User 1's task (returns 404 Task not found)"
    )

    // Verify User 1's task is still intact after User 2's failed delete attempt
    const verifyStillExistsRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}`, {
      headers: { Authorization: `Bearer ${token1}` },
    })
    assert(verifyStillExistsRes.status === 200, "7d. User 1's task remains intact after unauthorized delete attempt")

    // =============================================================
    // 8. Nonexistent or malformed task ID is handled safely
    // =============================================================
    // 8a. Malformed ObjectId on GET
    const malformedGetRes = await fetch(`${BASE_URL}/tasks/malformed-id-123`, {
      headers: { Authorization: `Bearer ${token1}` },
    })
    const malformedGetData = await malformedGetRes.json()
    assert(
      malformedGetRes.status === 400 &&
      malformedGetData.message === 'Invalid task ID format',
      '8a. Malformed task ID on GET returns 400 Invalid task ID format'
    )

    // 8b. Malformed ObjectId on PUT
    const malformedPutRes = await fetch(`${BASE_URL}/tasks/bad-id`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ title: 'Test' }),
    })
    assert(malformedPutRes.status === 400, '8b. Malformed task ID on PUT returns 400')

    // 8c. Malformed ObjectId on PATCH
    const malformedPatchRes = await fetch(`${BASE_URL}/tasks/bad-id/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ status: 'Completed' }),
    })
    assert(malformedPatchRes.status === 400, '8c. Malformed task ID on PATCH status returns 400')

    // 8d. Malformed ObjectId on DELETE
    const malformedDeleteRes = await fetch(`${BASE_URL}/tasks/bad-id`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    })
    assert(malformedDeleteRes.status === 400, '8d. Malformed task ID on DELETE returns 400')

    // 8e. Nonexistent valid ObjectId returns 404
    const nonexistentValidId = new mongoose.Types.ObjectId().toString()
    const nonexistentRes = await fetch(`${BASE_URL}/tasks/${nonexistentValidId}`, {
      headers: { Authorization: `Bearer ${token1}` },
    })
    const nonexistentData = await nonexistentRes.json()
    assert(
      nonexistentRes.status === 404 &&
      nonexistentData.message === 'Task not found',
      '8e. Nonexistent valid ObjectId returns 404 Task not found'
    )

    // =============================================================
    // 9. Invalid dates and invalid status updates are rejected
    // =============================================================
    // 9a. Invalid date on PUT
    const badDatePutRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ dueDate: 'invalid-date-format' }),
    })
    assert(badDatePutRes.status === 400, '9a. Invalid due date on PUT returns 400')

    // 9b. Invalid status on PATCH
    const badStatusPatchRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ status: 'InProgress' }),
    })
    assert(badStatusPatchRes.status === 400, '9b. Invalid status on PATCH returns 400')

    // 9c. Missing status on PATCH
    const noStatusPatchRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({}),
    })
    assert(noStatusPatchRes.status === 400, '9c. Missing status on PATCH returns 400')

    // =============================================================
    // 5d. Delete own task by ID (Clean deletion by true owner)
    // =============================================================
    const deleteOwnRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    })
    const deleteOwnData = await deleteOwnRes.json()
    assert(
      deleteOwnRes.status === 200 &&
      deleteOwnData.success === true,
      '5d. User 1 can delete their own task (200 OK)'
    )

    // Verify task is now 404 for User 1
    const verifyDeletedRes = await fetch(`${BASE_URL}/tasks/${user1TaskId}`, {
      headers: { Authorization: `Bearer ${token1}` },
    })
    assert(verifyDeletedRes.status === 404, '5e. Task is no longer found after deletion (404)')

    // =============================================================
    // 10. Existing registration, login, /api/auth/me, logout, /api/health still work
    // =============================================================
    // 10a. Health check
    const healthRes = await fetch(`${BASE_URL}/health`)
    const healthData = await healthRes.json()
    assert(
      healthRes.status === 200 &&
      healthData.status === 'ok' &&
      healthData.database?.status === 'connected',
      '10a. Existing GET /api/health still works'
    )

    // 10b. Login check
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user1Data.email, password: user1Data.password }),
    })
    const loginData = await loginRes.json()
    assert(
      loginRes.status === 200 &&
      loginData.success === true &&
      Boolean(loginData.token),
      '10b. Existing POST /api/auth/login still works'
    )

    // 10c. Auth Me check
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token1}` },
    })
    const meData = await meRes.json()
    assert(
      meRes.status === 200 &&
      meData.success === true &&
      meData.user?.email === user1Data.email.toLowerCase(),
      '10c. Existing GET /api/auth/me still works'
    )

    // 10d. Logout check
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' })
    const logoutData = await logoutRes.json()
    assert(
      logoutRes.status === 200 &&
      logoutData.success === true,
      '10d. Existing POST /api/auth/logout still works'
    )

  } catch (err) {
    console.error('Test execution error:', err)
    failed++
  } finally {
    console.log(`\n========================================`)
    console.log(`Phase 3 Task Results: ${passed} passed, ${failed} failed`)
    console.log(`========================================\n`)
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTaskTests()
