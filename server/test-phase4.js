import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = 'http://localhost:5000/api'

// Helper mirroring client date overdue logic
function isOverdue(dueDateString, status) {
  if (status === 'Completed' || !dueDateString) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(dueDateString)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate.getTime() < today.getTime()
}

async function runPhase4Tests() {
  console.log('🧪 Starting Phase 4 End-to-End Verification Suite...\n')
  let passed = 0
  let failed = 0

  function assert(condition, testName, extra = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${extra ? '(' + extra + ')' : ''}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${testName} ${extra ? '(' + extra + ')' : ''}`)
      failed++
    }
  }

  const timestamp = Date.now()

  const userA = {
    name: 'Ada Lovelace',
    email: `ada.${timestamp}@example.com`,
    password: 'Password123!',
  }

  const userB = {
    name: 'Charles Babbage',
    email: `charles.${timestamp}@example.com`,
    password: 'Password123!',
  }

  try {
    // 1. Register User A & User B
    const regARes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userA),
    })
    const regA = await regARes.json()
    const tokenA = regA.token

    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userB),
    })
    const regB = await regBRes.json()
    const tokenB = regB.token

    assert(Boolean(tokenA && tokenB), '1. Both User A and User B registered successfully with valid JWTs')

    // 2. Initial empty task list
    const initialListRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    const initialList = await initialListRes.json()
    assert(initialList.count === 0 && initialList.tasks.length === 0, '2. Initial task list for new user is empty (count: 0)')

    // 3. User A creates 4 distinct tasks:
    // Future due date (tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // 3 days ago (definitely overdue when pending)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    // Today (due today, MUST NOT be counted as overdue!)
    const todayDate = new Date()

    // Task 1: Pending, due tomorrow
    const t1Res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Complete Project Proposal',
        description: 'Draft initial architecture spec',
        category: 'Work',
        priority: 'High',
        dueDate: tomorrow.toISOString(),
      }),
    })
    const t1Data = await t1Res.json()
    const task1Id = t1Data.task?.id || t1Data.task?._id

    // Task 2: Completed, due yesterday (Completed tasks must never be overdue)
    const t2Res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Review Security Architecture',
        description: 'Check bcrypt and JWT settings',
        category: 'Engineering',
        priority: 'Medium',
        dueDate: yesterday.toISOString(),
        status: 'Completed',
      }),
    })
    const t2Data = await t2Res.json()
    const task2Id = t2Data.task?.id || t2Data.task?._id

    // Task 3: Pending, due 3 days ago (OVERDUE)
    const t3Res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Overdue Audit Checklist',
        description: 'Compliance verification',
        category: 'Finance',
        priority: 'Low',
        dueDate: threeDaysAgo.toISOString(),
      }),
    })
    const t3Data = await t3Res.json()
    const task3Id = t3Data.task?.id || t3Data.task?._id

    // Task 4: Pending, due TODAY (Must NOT be overdue!)
    const t4Res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Today Deadline Task',
        description: 'Must finish before midnight',
        category: 'Work',
        priority: 'High',
        dueDate: todayDate.toISOString(),
      }),
    })
    const t4Data = await t4Res.json()
    const task4Id = t4Data.task?.id || t4Data.task?._id

    assert(Boolean(task1Id && task2Id && task3Id && task4Id), '3. User A successfully created 4 tasks with varied dates, priorities, and statuses')

    // 4. Statistics calculation check for User A
    const listARes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    const listAData = await listARes.json()
    const allA = listAData.tasks

    const totalA = allA.length
    const pendingA = allA.filter(t => t.status === 'Pending').length
    const completedA = allA.filter(t => t.status === 'Completed').length
    const overdueA = allA.filter(t => isOverdue(t.dueDate, t.status)).length

    assert(totalA === 4, '4a. Total Tasks statistic correctly equals 4', `Actual: ${totalA}`)
    assert(pendingA === 3, '4b. Pending Tasks statistic correctly equals 3', `Actual: ${pendingA}`)
    assert(completedA === 1, '4c. Completed Tasks statistic correctly equals 1', `Actual: ${completedA}`)
    assert(overdueA === 1, '4d. Overdue Tasks statistic correctly equals 1 (excludes completed tasks and tasks due today)', `Actual: ${overdueA}`)

    // 5. User B isolation check
    const tBRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({
        title: "Charles's Secret Analysis",
        category: 'Research',
        priority: 'High',
        dueDate: tomorrow.toISOString(),
      }),
    })
    const tBData = await tBRes.json()
    const taskBId = tBData.task?.id || tBData.task?._id

    const listBRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    const listBData = await listBRes.json()

    assert(listBData.count === 1 && listBData.tasks[0].title === "Charles's Secret Analysis", "5a. User B's task list contains only 1 task belonging to User B")
    const userASeesUserB = listAData.tasks.some(t => (t.id || t._id) === taskBId)
    assert(!userASeesUserB, "5b. User A does not see User B's task")

    // 6. Edit task details via PUT
    const updateRes = await fetch(`${BASE_URL}/tasks/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Complete Project Proposal (Final Draft)',
        priority: 'Medium',
      }),
    })
    const updateData = await updateRes.json()
    assert(
      updateRes.status === 200 &&
      updateData.task?.title === 'Complete Project Proposal (Final Draft)' &&
      updateData.task?.priority === 'Medium',
      '6. Editing task updates title and priority'
    )

    // 7. Status Toggle & Statistics dynamic recalculation
    // Mark Task 3 (the overdue task) as Completed
    const completeT3Res = await fetch(`${BASE_URL}/tasks/${task3Id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ status: 'Completed' }),
    })
    const completeT3 = await completeT3Res.json()
    assert(completeT3.status === 200 || completeT3.success, '7a. Mark Task 3 as Completed via PATCH')

    // Fetch updated list and check overdue count dropped to 0
    const listAfterCompRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    const listAfterComp = await listAfterCompRes.json()
    const overdueAfterComp = listAfterComp.tasks.filter(t => isOverdue(t.dueDate, t.status)).length
    const compAfterComp = listAfterComp.tasks.filter(t => t.status === 'Completed').length

    assert(overdueAfterComp === 0, '7b. Overdue count dynamically dropped from 1 to 0 after completing overdue task', `Overdue: ${overdueAfterComp}`)
    assert(compAfterComp === 2, '7c. Completed count dynamically increased from 1 to 2', `Completed: ${compAfterComp}`)

    // Reopen Task 3 as Pending
    const reopenT3Res = await fetch(`${BASE_URL}/tasks/${task3Id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ status: 'Pending' }),
    })
    const reopenT3 = await reopenT3Res.json()
    assert(reopenT3.status === 200 || reopenT3.success, '7d. Reopen Task 3 as Pending via PATCH')

    // Verify overdue count returned to 1
    const listAfterReopenRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    const listAfterReopen = await listAfterReopenRes.json()
    const overdueAfterReopen = listAfterReopen.tasks.filter(t => isOverdue(t.dueDate, t.status)).length
    assert(overdueAfterReopen === 1, '7e. Overdue count returned to 1 after reopening overdue task', `Overdue: ${overdueAfterReopen}`)

    // 8. Delete task
    const delRes = await fetch(`${BASE_URL}/tasks/${task4Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    assert(delRes.status === 200, '8a. Delete task succeeds with 200 OK')

    // Verify task is gone and total tasks count decreased
    const listAfterDelRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    const listAfterDel = await listAfterDelRes.json()
    assert(listAfterDel.count === 3, '8b. Total tasks count decreased from 4 to 3 after deletion', `Total: ${listAfterDel.count}`)

    // 9. Search & Filter simulation on active tasks
    // Active tasks: Task 1 (Proposal, Work, Medium, Pending), Task 2 (Security, Engineering, Medium, Completed), Task 3 (Audit, Finance, Low, Pending)
    const currentTasks = listAfterDel.tasks

    // 9a. Case-insensitive search
    const searchMatch = currentTasks.filter(t => t.title.toLowerCase().includes('proposal'))
    assert(searchMatch.length === 1 && searchMatch[0].id === task1Id, '9a. Case-insensitive search matches "proposal"')

    // 9b. Status filter: Completed
    const completedFilter = currentTasks.filter(t => t.status === 'Completed')
    assert(completedFilter.length === 1 && completedFilter[0].id === task2Id, '9b. Status filter "Completed" matches 1 task')

    // 9c. Priority filter: Medium
    const priorityFilter = currentTasks.filter(t => t.priority === 'Medium')
    assert(priorityFilter.length === 2, '9c. Priority filter "Medium" matches 2 tasks (Tasks 1 & 2)')

    // 9d. Combined filter: Search "Proposal" + Priority "Medium" + Status "Pending"
    const combinedFilter = currentTasks.filter(t =>
      t.title.toLowerCase().includes('proposal') &&
      t.priority === 'Medium' &&
      t.status === 'Pending'
    )
    assert(combinedFilter.length === 1 && combinedFilter[0].id === task1Id, '9d. Combined Search + Status + Priority filter matches exact task')

    // 10. Existing auth & health regression checks
    const healthRes = await fetch(`${BASE_URL}/health`)
    const healthJson = await healthRes.json()
    assert(healthRes.status === 200 && healthJson.status === 'ok', '10a. GET /api/health returns 200 OK')

    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    const meJson = await meRes.json()
    assert(meRes.status === 200 && meJson.user?.email === userA.email.toLowerCase(), '10b. GET /api/auth/me returns authenticated profile')

    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' })
    assert(logoutRes.status === 200, '10c. POST /api/auth/logout returns 200 OK')

  } catch (err) {
    console.error('Test execution error:', err)
    failed++
  } finally {
    console.log(`\n========================================`)
    console.log(`Phase 4 Results: ${passed} passed, ${failed} failed`)
    console.log(`========================================\n`)
    process.exit(failed > 0 ? 1 : 0)
  }
}

runPhase4Tests()
