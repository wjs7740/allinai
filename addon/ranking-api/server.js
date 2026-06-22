import http from 'node:http'
import { URL } from 'node:url'
import { randomInt, randomUUID } from 'node:crypto'
import pg from 'pg'

const { Pool } = pg

const port = Number(process.env.PORT || 8081)
const sub2apiBaseUrl = String(process.env.SUB2API_BASE_URL || 'http://sub2api:8080').replace(/\/$/, '')
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'sub2api',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'sub2api',
  ssl: process.env.POSTGRES_SSLMODE === 'require' ? { rejectUnauthorized: false } : false,
  max: Number(process.env.POSTGRES_POOL_MAX || 4),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

const rangeDays = {
  '24h': 1,
  '3d': 3,
  '7d': 7,
  '30d': 30,
}

const lotteryConfig = {
  threshold: 100,
  minPrize: 5,
  maxPrize: 50,
  codePrefix: 'LOTTERY-',
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

function sendError(res, status, message, extra = {}) {
  sendJson(res, status, { message, ...extra })
}

function clampLimit(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 12
  return Math.min(50, Math.max(1, Math.trunc(numeric)))
}

function parseDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : value
}

function resolveDateRange(params) {
  const startDate = parseDate(params.get('start_date'))
  const endDate = parseDate(params.get('end_date'))
  if (startDate && endDate) {
    return { startDate, endDate }
  }

  const range = params.get('range') || '24h'
  const days = rangeDays[range] || 1
  const end = new Date()
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - days)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

function maskEmail(email) {
  const [name, domain] = String(email || '').split('@')
  if (!name || !domain) return 'User'
  if (name.length <= 2) return `${name.slice(0, 1)}***@${domain}`
  return `${name.slice(0, 2)}***@${domain}`
}

function displayName(row) {
  const username = String(row.username || '').trim()
  if (username) {
    return username.length <= 2 ? `${username[0]}***` : `${username.slice(0, 2)}***`
  }
  return maskEmail(row.email)
}

function isAllowedSort(value) {
  return value === 'tokens' || value === 'requests' || value === 'actual_cost'
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value
  if (!value) return []
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function modelList(row) {
  const primary = String(row.primary_model || '').trim()
  const extra = normalizeArray(row.extra_models)
    .map((item) => String(item || '').trim())
    .filter((item) => item && item !== primary)
  return primary ? [primary, ...extra] : extra
}

function statKey(monitorId, model) {
  return `${monitorId}:${model}`
}

function numberOrNull(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function numberValue(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function isoOrNull(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function authHeaders(req) {
  const headers = {}
  for (const name of ['authorization', 'cookie', 'accept-language', 'user-agent']) {
    const value = req.headers[name]
    if (typeof value === 'string' && value) headers[name] = value
  }
  return headers
}

function unwrapApiData(body) {
  if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
    return body.code === 0 ? body.data : null
  }
  return body?.data && typeof body.data === 'object' && 'id' in body.data ? body.data : body
}

async function authenticateUser(req) {
  const response = await fetch(`${sub2apiBaseUrl}/api/v1/auth/me`, {
    method: 'GET',
    headers: authHeaders(req),
  })

  if (!response.ok) {
    return null
  }

  const body = await response.json().catch(() => null)
  const user = unwrapApiData(body)
  const userId = Number(user?.id)
  if (!Number.isFinite(userId) || userId <= 0) {
    return null
  }

  return { ...user, id: userId }
}

async function getLotteryStatusForUser(db, userId) {
  const paymentResult = await db.query(
    `
      select coalesce(sum(amount), 0)::numeric as amount
      from payment_orders
      where user_id = $1
        and status = 'COMPLETED'
        and order_type = 'balance'
    `,
    [userId],
  )
  const redeemResult = await db.query(
    `
      select coalesce(sum(value), 0)::numeric as amount
      from redeem_codes
      where used_by = $1
        and status = 'used'
        and lower(type) = 'balance'
        and value > 0
        and upper(code) not like $2
    `,
    [userId, `${lotteryConfig.codePrefix}%`],
  )
  const rewardResult = await db.query(
    `
      select
        count(*)::bigint as count,
        coalesce(sum(value), 0)::numeric as amount
      from redeem_codes
      where used_by = $1
        and status = 'used'
        and upper(code) like $2
    `,
    [userId, `${lotteryConfig.codePrefix}%`],
  )

  const qualifyingPaymentAmount = numberValue(paymentResult.rows[0]?.amount)
  const qualifyingRedeemAmount = numberValue(redeemResult.rows[0]?.amount)
  const qualifyingAmount = qualifyingPaymentAmount + qualifyingRedeemAmount
  const totalChances = Math.floor(qualifyingAmount / lotteryConfig.threshold)
  const usedChances = Number.parseInt(rewardResult.rows[0]?.count || '0', 10) || 0
  const availableChances = Math.max(0, totalChances - usedChances)

  return {
    threshold: lotteryConfig.threshold,
    min_prize: lotteryConfig.minPrize,
    max_prize: lotteryConfig.maxPrize,
    qualifying_amount: qualifyingAmount,
    qualifying_payment_amount: qualifyingPaymentAmount,
    qualifying_redeem_amount: qualifyingRedeemAmount,
    total_chances: totalChances,
    used_chances: usedChances,
    available_chances: availableChances,
    reward_amount: numberValue(rewardResult.rows[0]?.amount),
  }
}

function buildLotteryCode(userId) {
  const userPart = Number(userId).toString(36).toUpperCase()
  const randomLength = Math.max(6, 32 - lotteryConfig.codePrefix.length - userPart.length - 1)
  const randomPart = randomUUID().replace(/-/g, '').slice(0, randomLength).toUpperCase()
  return `${lotteryConfig.codePrefix}${userPart}-${randomPart}`
}

function mapRedeemRow(row) {
  return {
    id: Number(row.id),
    code: row.code,
    type: row.type,
    value: numberValue(row.value),
    status: row.status,
    used_at: isoOrNull(row.used_at),
    created_at: isoOrNull(row.created_at),
    notes: row.notes || '',
  }
}

async function cleanupLotteryReservations(db) {
  await db.query(
    `
      delete from redeem_codes
      where upper(code) like $1
        and status = 'unused'
        and used_by is null
    `,
    [`${lotteryConfig.codePrefix}%`],
  )
}

async function insertLotteryReward(client, userId, prize) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = buildLotteryCode(userId)
    try {
      const result = await client.query(
        `
          insert into redeem_codes (
            code, type, value, status, used_by, used_at, created_at, notes, validity_days
          )
          values ($1, 'balance', $2, 'used', $3, now(), now(), $4, 30)
          returning id, code, type, value, status, used_by, used_at, created_at, notes
        `,
        [code, prize, userId, `AllCanCode lottery reward for user ${userId}`],
      )
      return mapRedeemRow(result.rows[0])
    } catch (error) {
      if (error?.code === '23505' && attempt < 4) continue
      throw error
    }
  }
  throw new Error('Could not generate a unique lottery reward code.')
}

async function drawLotteryForUser(userId) {
  const client = await pool.connect()
  try {
    await client.query('begin')
    await cleanupLotteryReservations(client)

    const userResult = await client.query(
      `
        select id, balance
        from users
        where id = $1
          and deleted_at is null
          and status = 'active'
        for update
      `,
      [userId],
    )

    if (!userResult.rows.length) {
      await client.query('rollback')
      return { statusCode: 403, body: { message: 'Account is not active.' } }
    }

    const beforeStatus = await getLotteryStatusForUser(client, userId)
    if (beforeStatus.available_chances <= 0) {
      await client.query('rollback')
      return {
        statusCode: 200,
        body: {
          state: 'no_chance',
          message: 'No lottery chance available.',
          status: beforeStatus,
        },
      }
    }

    const prize = randomInt(lotteryConfig.minPrize, lotteryConfig.maxPrize + 1)
    const reward = await insertLotteryReward(client, userId, prize)
    const balanceResult = await client.query(
      `
        update users
        set balance = balance + $2,
            updated_at = now()
        where id = $1
        returning balance
      `,
      [userId, prize],
    )

    await client.query('commit')
    const status = await getLotteryStatusForUser(pool, userId)

    return {
      statusCode: 200,
      body: {
        state: 'won',
        prize,
        code: reward.code,
        new_balance: numberValue(balanceResult.rows[0]?.balance),
        reward,
        status,
      },
    }
  } catch (error) {
    await client.query('rollback').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

function roundPercent(ok, total) {
  const totalCount = Number(total || 0)
  if (!totalCount) return null
  return Number(((Number(ok || 0) / totalCount) * 100).toFixed(2))
}

function roundedAverage(sum, count) {
  const sampleCount = Number(count || 0)
  if (!sampleCount) return null
  return Math.round(Number(sum || 0) / sampleCount)
}

function compactHistoryPoint(row) {
  return {
    status: row.status || 'error',
    latency_ms: numberOrNull(row.latency_ms),
    ping_latency_ms: numberOrNull(row.ping_latency_ms),
    checked_at: isoOrNull(row.checked_at),
  }
}

function mergeStats(rollup, history) {
  const total7d = Number(rollup?.total_7d || 0) || Number(history?.total_7d || 0)
  const ok7d = Number(rollup?.ok_7d || 0) || Number(history?.ok_7d || 0)
  const total15d = Number(rollup?.total_15d || 0) || Number(history?.total_15d || 0)
  const ok15d = Number(rollup?.ok_15d || 0) || Number(history?.ok_15d || 0)
  const total30d = Number(rollup?.total_30d || 0) || Number(history?.total_30d || 0)
  const ok30d = Number(rollup?.ok_30d || 0) || Number(history?.ok_30d || 0)
  const latencySum7d = Number(rollup?.sum_latency_7d_ms || 0) || Number(history?.sum_latency_7d_ms || 0)
  const latencyCount7d = Number(rollup?.count_latency_7d || 0) || Number(history?.count_latency_7d || 0)

  return {
    availability_7d: roundPercent(ok7d, total7d),
    availability_15d: roundPercent(ok15d, total15d),
    availability_30d: roundPercent(ok30d, total30d),
    avg_latency_7d_ms: roundedAverage(latencySum7d, latencyCount7d),
  }
}

function rowsByStatKey(rows) {
  const map = new Map()
  for (const row of rows) {
    map.set(statKey(row.monitor_id, row.model), row)
  }
  return map
}

async function getMonitorRows(ids = null) {
  const params = []
  let where = 'where enabled = true'
  if (ids?.length) {
    params.push(ids)
    where += ` and id = any($${params.length}::bigint[])`
  }
  const result = await pool.query(
    `
      select id, name, provider, primary_model, extra_models, group_name
      from channel_monitors
      ${where}
      order by id asc
    `,
    params,
  )
  return result.rows
}

async function getLatestHistory(monitorIds) {
  if (!monitorIds.length) return new Map()
  const result = await pool.query(
    `
      select distinct on (monitor_id, model)
        monitor_id, model, status, latency_ms, ping_latency_ms, checked_at
      from channel_monitor_histories
      where monitor_id = any($1::bigint[])
      order by monitor_id, model, checked_at desc
    `,
    [monitorIds],
  )
  return rowsByStatKey(result.rows)
}

async function getTimeline(monitorIds) {
  const map = new Map()
  if (!monitorIds.length) return map

  const result = await pool.query(
    `
      select monitor_id, model, status, latency_ms, ping_latency_ms, checked_at
      from (
        select
          monitor_id,
          model,
          status,
          latency_ms,
          ping_latency_ms,
          checked_at,
          row_number() over (partition by monitor_id, model order by checked_at desc) as rn
        from channel_monitor_histories
        where monitor_id = any($1::bigint[])
      ) ranked
      where rn <= 60
      order by monitor_id, model, checked_at desc
    `,
    [monitorIds],
  )

  for (const row of result.rows) {
    const key = statKey(row.monitor_id, row.model)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(compactHistoryPoint(row))
  }
  return map
}

async function getMonitorStats(monitorIds) {
  if (!monitorIds.length) return new Map()

  const rollupResult = await pool.query(
    `
      select
        monitor_id,
        model,
        coalesce(sum(case when bucket_date >= current_date - interval '6 days' then
          case when ok_count > 0 then ok_count else operational_count + degraded_count end
        else 0 end), 0)::bigint as ok_7d,
        coalesce(sum(case when bucket_date >= current_date - interval '6 days' then total_checks else 0 end), 0)::bigint as total_7d,
        coalesce(sum(case when bucket_date >= current_date - interval '14 days' then
          case when ok_count > 0 then ok_count else operational_count + degraded_count end
        else 0 end), 0)::bigint as ok_15d,
        coalesce(sum(case when bucket_date >= current_date - interval '14 days' then total_checks else 0 end), 0)::bigint as total_15d,
        coalesce(sum(case when bucket_date >= current_date - interval '29 days' then
          case when ok_count > 0 then ok_count else operational_count + degraded_count end
        else 0 end), 0)::bigint as ok_30d,
        coalesce(sum(case when bucket_date >= current_date - interval '29 days' then total_checks else 0 end), 0)::bigint as total_30d,
        coalesce(sum(case when bucket_date >= current_date - interval '6 days' then sum_latency_ms else 0 end), 0)::bigint as sum_latency_7d_ms,
        coalesce(sum(case when bucket_date >= current_date - interval '6 days' then count_latency else 0 end), 0)::bigint as count_latency_7d
      from channel_monitor_daily_rollups
      where monitor_id = any($1::bigint[])
        and bucket_date >= current_date - interval '29 days'
      group by monitor_id, model
    `,
    [monitorIds],
  )

  const historyResult = await pool.query(
    `
      select
        monitor_id,
        model,
        count(*) filter (where checked_at >= now() - interval '7 days' and status in ('operational', 'degraded'))::bigint as ok_7d,
        count(*) filter (where checked_at >= now() - interval '7 days')::bigint as total_7d,
        count(*) filter (where checked_at >= now() - interval '15 days' and status in ('operational', 'degraded'))::bigint as ok_15d,
        count(*) filter (where checked_at >= now() - interval '15 days')::bigint as total_15d,
        count(*) filter (where checked_at >= now() - interval '30 days' and status in ('operational', 'degraded'))::bigint as ok_30d,
        count(*) filter (where checked_at >= now() - interval '30 days')::bigint as total_30d,
        coalesce(sum(latency_ms) filter (where checked_at >= now() - interval '7 days' and latency_ms is not null), 0)::bigint as sum_latency_7d_ms,
        count(latency_ms) filter (where checked_at >= now() - interval '7 days')::bigint as count_latency_7d
      from channel_monitor_histories
      where monitor_id = any($1::bigint[])
        and checked_at >= now() - interval '30 days'
      group by monitor_id, model
    `,
    [monitorIds],
  )

  const rollupMap = rowsByStatKey(rollupResult.rows)
  const historyMap = rowsByStatKey(historyResult.rows)
  const keys = new Set([...rollupMap.keys(), ...historyMap.keys()])
  const stats = new Map()
  for (const key of keys) {
    stats.set(key, mergeStats(rollupMap.get(key), historyMap.get(key)))
  }
  return stats
}

async function getChannelMonitors() {
  const monitors = await getMonitorRows()
  const monitorIds = monitors.map((row) => Number(row.id))
  const [latestMap, timelineMap, statsMap] = await Promise.all([
    getLatestHistory(monitorIds),
    getTimeline(monitorIds),
    getMonitorStats(monitorIds),
  ])

  const items = monitors.map((row) => {
    const primaryModel = String(row.primary_model || '')
    const extras = modelList(row).filter((model) => model !== primaryModel)
    const primaryKey = statKey(row.id, primaryModel)
    const latest = latestMap.get(primaryKey)
    const stats = statsMap.get(primaryKey) || {}

    return {
      id: Number(row.id),
      name: row.name,
      provider: row.provider,
      group_name: row.group_name || '',
      primary_model: primaryModel,
      primary_status: latest?.status || 'error',
      primary_latency_ms: numberOrNull(latest?.latency_ms),
      primary_ping_latency_ms: numberOrNull(latest?.ping_latency_ms),
      availability_7d: stats.availability_7d ?? null,
      extra_models: extras.map((model) => {
        const extraLatest = latestMap.get(statKey(row.id, model))
        return {
          model,
          status: extraLatest?.status || 'error',
          latency_ms: numberOrNull(extraLatest?.latency_ms),
        }
      }),
      timeline: timelineMap.get(primaryKey) || [],
    }
  })

  return { items }
}

async function getChannelMonitorStatus(id) {
  const monitors = await getMonitorRows([id])
  const monitor = monitors[0]
  if (!monitor) return null

  const monitorIds = [Number(monitor.id)]
  const [latestMap, statsMap] = await Promise.all([
    getLatestHistory(monitorIds),
    getMonitorStats(monitorIds),
  ])

  return {
    id: Number(monitor.id),
    name: monitor.name,
    provider: monitor.provider,
    group_name: monitor.group_name || '',
    models: modelList(monitor).map((model) => {
      const key = statKey(monitor.id, model)
      const latest = latestMap.get(key)
      const stats = statsMap.get(key) || {}
      return {
        model,
        latest_status: latest?.status || 'error',
        latest_latency_ms: numberOrNull(latest?.latency_ms),
        availability_7d: stats.availability_7d ?? null,
        availability_15d: stats.availability_15d ?? null,
        availability_30d: stats.availability_30d ?? null,
        avg_latency_7d_ms: stats.avg_latency_7d_ms ?? null,
      }
    }),
  }
}

async function getRanking(params) {
  const limit = clampLimit(params.get('limit'))
  const sortBy = isAllowedSort(params.get('sort_by')) ? params.get('sort_by') : 'actual_cost'
  const { startDate, endDate } = resolveDateRange(params)
  const orderColumn = sortBy === 'tokens' ? 'tokens' : sortBy === 'requests' ? 'requests' : 'actual_cost'

  const sql = `
    with user_usage as (
      select
        u.id as user_id,
        u.email,
        u.username,
        count(l.id)::bigint as requests,
        coalesce(sum(
          l.input_tokens
          + l.output_tokens
          + l.cache_creation_tokens
          + l.cache_read_tokens
          + l.cache_creation_5m_tokens
          + l.cache_creation_1h_tokens
          + l.image_output_tokens
        ), 0)::bigint as tokens,
        coalesce(sum(l.actual_cost), 0)::numeric as actual_cost
      from usage_logs l
      join users u on u.id = l.user_id
      where l.created_at >= $1::date
        and l.created_at < ($2::date + interval '1 day')
        and u.deleted_at is null
      group by u.id, u.email, u.username
    ),
    totals as (
      select
        coalesce(sum(actual_cost), 0)::numeric as total_actual_cost,
        coalesce(sum(requests), 0)::bigint as total_requests,
        coalesce(sum(tokens), 0)::bigint as total_tokens
      from user_usage
    )
    select
      user_usage.*,
      totals.total_actual_cost,
      totals.total_requests,
      totals.total_tokens
    from user_usage
    cross join totals
    order by ${orderColumn} desc, user_id asc
    limit $3
  `

  const result = await pool.query(sql, [startDate, endDate, limit])
  const totals = result.rows[0] || {}
  const totalActualCost = Number(totals.total_actual_cost || 0)
  const totalRequests = Number(totals.total_requests || 0)
  const totalTokens = Number(totals.total_tokens || 0)

  const ranking = result.rows.map((row, index) => {
    const actualCost = Number(row.actual_cost || 0)
    const requests = Number(row.requests || 0)
    const tokens = Number(row.tokens || 0)
    return {
      rank: index + 1,
      user_id: Number(row.user_id),
      display_name: displayName(row),
      actual_cost: actualCost,
      requests,
      tokens,
      usage_share: totalActualCost > 0 ? actualCost / totalActualCost : 0,
      request_share: totalRequests > 0 ? requests / totalRequests : 0,
      token_share: totalTokens > 0 ? tokens / totalTokens : 0,
    }
  })

  return {
    ranking,
    total_actual_cost: totalActualCost,
    total_requests: totalRequests,
    total_tokens: totalTokens,
    start_date: startDate,
    end_date: endDate,
    sort_by: sortBy,
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'ok' })
      return
    }

    if (req.method === 'GET' && url.pathname === '/public/storefront/ranking') {
      const data = await getRanking(url.searchParams)
      sendJson(res, 200, data)
      return
    }

    if (req.method === 'GET' && url.pathname === '/public/channel-monitors') {
      const data = await getChannelMonitors()
      sendJson(res, 200, data)
      return
    }

    if (req.method === 'GET' && url.pathname === '/lottery/status') {
      const user = await authenticateUser(req)
      if (!user) {
        sendError(res, 401, 'Unauthorized')
        return
      }
      await cleanupLotteryReservations(pool)
      const data = await getLotteryStatusForUser(pool, user.id)
      sendJson(res, 200, data)
      return
    }

    if (req.method === 'POST' && url.pathname === '/lottery/draw') {
      const user = await authenticateUser(req)
      if (!user) {
        sendError(res, 401, 'Unauthorized')
        return
      }
      const result = await drawLotteryForUser(user.id)
      sendJson(res, result.statusCode, result.body)
      return
    }

    const monitorStatusMatch = url.pathname.match(/^\/public\/channel-monitors\/(\d+)\/status$/)
    if (req.method === 'GET' && monitorStatusMatch) {
      const data = await getChannelMonitorStatus(Number(monitorStatusMatch[1]))
      if (!data) {
        sendJson(res, 404, { message: 'monitor not found' })
        return
      }
      sendJson(res, 200, data)
      return
    }

    sendJson(res, 404, { message: 'not found' })
  } catch (error) {
    console.error('ranking api error', error)
    sendJson(res, 500, { message: 'failed to load data' })
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`ranking api listening on ${port}`)
})

process.on('SIGTERM', async () => {
  server.close()
  await pool.end()
})
