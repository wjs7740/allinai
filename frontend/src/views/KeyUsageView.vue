<template>
  <PublicPageShell>
    <div class="lottery-page">
      <section class="lottery-hero">
        <div class="hero-copy">
          <p class="hero-kicker">{{ copy.eyebrow }}</p>
          <h1>
            <span>{{ copy.titleTop }}</span>
            <span>{{ copy.titleMain }}</span>
          </h1>
          <p class="hero-desc">{{ copy.subtitle }}</p>

          <div class="hero-actions">
            <RouterLink v-if="!isAuthenticated" :to="{ path: '/login', query: { redirect: '/key-usage' } }" class="btn-primary">
              <Icon name="login" size="sm" />
              {{ copy.loginCta }}
            </RouterLink>
            <a v-else :href="SHOP_URL" class="btn-primary">
              <Icon name="creditCard" size="sm" />
              {{ copy.rechargeCta }}
            </a>
            <button type="button" class="btn-ghost" @click="scrollToEligibility">
              <span class="green-dot"></span>
              {{ isAuthenticated ? copy.viewEligibility : copy.viewRules }}
            </button>
          </div>
        </div>

        <div class="draw-stage" aria-label="Lottery activity summary">
          <div class="logo-orbit">
            <span>{{ brandInitial }}</span>
          </div>
          <div class="prize-band">
            <span>{{ copy.guaranteed }}</span>
            <strong>$5 - $50</strong>
          </div>
          <div class="draw-rule">
            <span>{{ copy.threshold }}</span>
            <strong>$100 = 1 {{ copy.chanceUnit }}</strong>
          </div>
          <div class="pixel-prizes" aria-hidden="true">
            <i
              v-for="item in prizePixels"
              :key="item.id"
              :style="{ left: `${item.left}%`, top: `${item.top}%`, '--delay': `${item.delay}s` }"
            ></i>
          </div>
        </div>
      </section>

      <section class="rule-grid" aria-label="Lottery rules">
        <article v-for="rule in rules" :key="rule.title" class="rule-card">
          <div class="rule-icon">
            <Icon :name="rule.icon" size="lg" />
          </div>
          <span>{{ rule.kicker }}</span>
          <strong>{{ rule.title }}</strong>
          <p>{{ rule.text }}</p>
        </article>
      </section>

      <section class="content-grid">
        <article class="winners-panel">
          <div class="panel-head">
            <div>
              <p>LIVE WINNERS</p>
              <h2>{{ copy.winnersTitle }}</h2>
            </div>
            <span class="live-chip"><i></i>{{ copy.live }}</span>
          </div>

          <div class="winner-showcase">
            <transition name="winner-slide" mode="out-in">
              <div :key="activeWinner.email" class="active-winner">
                <span>{{ activeWinner.email }}</span>
                <strong>{{ formatCurrency(activeWinner.prize) }}</strong>
                <small>{{ activeWinner.time }}</small>
              </div>
            </transition>
          </div>

          <div class="winner-list">
            <div
              v-for="(winner, index) in winners"
              :key="winner.email"
              :class="['winner-row', { active: index === activeWinnerIndex }]"
            >
              <span>{{ winner.email }}</span>
              <strong>{{ formatCurrency(winner.prize) }}</strong>
            </div>
          </div>
        </article>

        <article ref="eligibilitySection" class="eligibility-panel">
          <div class="panel-head">
            <div>
              <p>MY ELIGIBILITY</p>
              <h2>{{ copy.eligibilityTitle }}</h2>
            </div>
            <button
              v-if="isAuthenticated"
              type="button"
              class="icon-button"
              :disabled="loadingUserData"
              :aria-label="copy.refresh"
              @click="loadUserActivity"
            >
              <Icon name="refresh" size="sm" :class="{ spinning: loadingUserData }" />
            </button>
          </div>

          <div v-if="!isAuthenticated" class="login-state">
            <Icon name="gift" size="xl" />
            <strong>{{ copy.publicStateTitle }}</strong>
            <span>{{ copy.publicStateText }}</span>
            <RouterLink :to="{ path: '/login', query: { redirect: '/key-usage' } }" class="panel-primary">
              {{ copy.loginCta }}
            </RouterLink>
          </div>

          <div v-else-if="userError" class="login-state error-state">
            <Icon name="exclamationCircle" size="xl" />
            <strong>{{ copy.loadFailed }}</strong>
            <span>{{ userError }}</span>
            <button type="button" class="panel-primary" @click="loadUserActivity">{{ copy.retry }}</button>
          </div>

          <div v-else class="user-eligibility">
            <div class="eligibility-badge" :class="{ qualified: availableChances > 0 }">
              <span>{{ availableChances > 0 ? copy.qualified : copy.notQualified }}</span>
              <strong v-if="availableChances > 0">{{ availableChances }} {{ copy.chanceUnit }}</strong>
              <strong v-else>{{ formatCurrency(nextRechargeNeeded) }}</strong>
              <small>{{ availableChances > 0 ? copy.readyToDraw : copy.nextNeeded }}</small>
            </div>

            <div v-if="drawResult" class="draw-result">
              <Icon name="sparkles" size="lg" />
              <div>
                <span>{{ copy.drawSuccessTitle }}</span>
                <strong>{{ formatCurrency(drawResult.prize || 0) }}</strong>
                <small>{{ copy.drawSuccessText }} · {{ maskCode(drawResult.code || '') }}</small>
              </div>
            </div>

            <div v-if="drawError" class="draw-error">{{ drawError }}</div>

            <div class="progress-block">
              <div class="progress-copy">
                <span>{{ copy.progressLabel }}</span>
                <strong>{{ formatCurrency(cycleAmount) }} / {{ formatCurrency(DRAW_THRESHOLD) }}</strong>
              </div>
              <div class="progress-track">
                <span :style="{ width: `${progressPercent}%` }"></span>
              </div>
            </div>

            <div class="metric-grid">
              <article>
                <span>{{ copy.completedRecharge }}</span>
                <strong>{{ formatCurrency(totalRecharge) }}</strong>
              </article>
              <article>
                <span>{{ copy.totalChances }}</span>
                <strong>{{ totalChances }}</strong>
              </article>
              <article>
                <span>{{ copy.usedRewards }}</span>
                <strong>{{ usedChances }}</strong>
              </article>
              <article>
                <span>{{ copy.rewardAmount }}</span>
                <strong>{{ formatCurrency(lotteryRewardTotal) }}</strong>
              </article>
            </div>

            <div class="panel-actions">
              <button
                type="button"
                class="panel-primary draw-button"
                :disabled="drawLoading || availableChances <= 0"
                @click="handleDraw"
              >
                <Icon name="sparkles" size="sm" :class="{ spinning: drawLoading }" />
                {{ drawLoading ? copy.drawing : copy.drawNow }}
              </button>
              <a :href="SHOP_URL" class="panel-ghost">{{ copy.rechargeCta }}</a>
              <RouterLink to="/redeem" class="panel-ghost">{{ copy.redeemRecords }}</RouterLink>
            </div>
          </div>
        </article>
      </section>

      <section v-if="isAuthenticated" class="records-grid">
        <article class="records-panel">
          <div class="panel-head">
            <div>
              <p>QUALIFYING</p>
              <h2>{{ copy.qualifyingRecords }}</h2>
            </div>
          </div>

          <div v-if="loadingUserData && !orders.length && !redeemRecords.length" class="compact-state">{{ copy.loading }}</div>
          <div v-else-if="!qualifyingActivityRecords.length" class="compact-state">{{ copy.emptyQualifying }}</div>
          <div v-else class="record-list">
            <div v-for="record in qualifyingActivityRecords.slice(0, 5)" :key="record.id" class="record-row">
              <div>
                <strong>{{ formatCurrency(record.amount) }}</strong>
                <span>{{ record.sourceLabel }} · {{ record.reference }}</span>
              </div>
              <small>{{ formatRecordDate(record.date) }}</small>
            </div>
          </div>
        </article>

        <article class="records-panel">
          <div class="panel-head">
            <div>
              <p>REDEEM</p>
              <h2>{{ copy.redeemRecords }}</h2>
            </div>
          </div>

          <div v-if="loadingUserData && !redeemRecords.length" class="compact-state">{{ copy.loading }}</div>
          <div v-else-if="!redeemRecords.length" class="compact-state">{{ copy.emptyRedeem }}</div>
          <div v-else class="record-list">
            <div v-for="record in redeemRecords.slice(0, 5)" :key="record.id" class="record-row">
              <div>
                <strong>{{ formatCurrency(record.value) }}</strong>
                <span>{{ maskCode(record.code) }} · {{ record.type }}</span>
              </div>
              <small>{{ formatRecordDate(record.used_at || record.created_at) }}</small>
            </div>
          </div>
        </article>
      </section>
    </div>
  </PublicPageShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PublicPageShell from '@/components/public/PublicPageShell.vue'
import Icon from '@/components/icons/Icon.vue'
import { paymentAPI } from '@/api/payment'
import lotteryAPI, { type LotteryDrawResult, type LotteryStatus } from '@/api/lottery'
import redeemAPI, { type RedeemHistoryItem } from '@/api/redeem'
import type { PaymentOrder } from '@/types/payment'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { extractApiErrorMessage } from '@/utils/apiError'
import { formatCurrency, formatDate } from '@/utils/format'

type RuleIcon = 'creditCard' | 'gift' | 'badge' | 'sparkles'

const DRAW_THRESHOLD = 100
const MIN_PRIZE = 5
const MAX_PRIZE = 50
const SHOP_URL = 'https://shop.allincode.top'

const appStore = useAppStore()
const authStore = useAuthStore()
const { locale } = useI18n()

const loadingUserData = ref(false)
const drawLoading = ref(false)
const userError = ref('')
const drawError = ref('')
const orders = ref<PaymentOrder[]>([])
const redeemRecords = ref<RedeemHistoryItem[]>([])
const lotteryStatus = ref<LotteryStatus | null>(null)
const drawResult = ref<LotteryDrawResult | null>(null)
const activeWinnerIndex = ref(0)
const eligibilitySection = ref<HTMLElement | null>(null)
let winnerTimer: number | null = null

const prizePixels = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  left: 5 + ((index * 17) % 88),
  top: 10 + ((index * 23) % 72),
  delay: index * 0.08,
}))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const brandInitial = computed(() => 'AC')

const copy = computed(() => {
  const zh = locale.value.startsWith('zh')
  if (zh) {
    return {
      eyebrow: 'ALLCANCODE ACTIVITY',
      titleTop: '充值满 $100',
      titleMain: '必中抽奖一次',
      subtitle: '本期活动为余额充值抽奖：每完成 $100 余额充值可获得 1 次抽奖资格，抽奖必中，最低中 $5，最高中 $50。',
      loginCta: '登录查看资格',
      rechargeCta: '去充值',
      viewEligibility: '查看我的资格',
      viewRules: '查看活动规则',
      guaranteed: '抽奖必中',
      threshold: '资格规则',
      chanceUnit: '次',
      winnersTitle: '中奖名单轮播',
      live: '实时滚动',
      eligibilityTitle: '我的抽奖资格',
      refresh: '刷新记录',
      publicStateTitle: '登录后自动查询资格',
      publicStateText: '系统会根据当前账号的已完成充值订单和余额兑换记录，计算可用抽奖次数与已兑换奖励额度。',
      loadFailed: '记录加载失败',
      retry: '重试',
      qualified: '已有抽奖资格',
      notQualified: '暂无抽奖资格',
      readyToDraw: '可立即抽奖，中奖后余额自动到账',
      nextNeeded: '距离下一次抽奖还差',
      progressLabel: '本轮充值/兑换进度',
      completedRecharge: '已充值/兑换',
      totalChances: '累计资格',
      usedRewards: '已中奖记录',
      rewardAmount: '中奖额度',
      redeemRecords: '兑换记录',
      qualifyingRecords: '充值/兑换资格记录',
      loading: '正在加载记录...',
      emptyQualifying: '暂无满额的余额充值或兑换记录',
      emptyRedeem: '暂无兑换记录',
      drawNow: '立即抽奖',
      drawing: '抽奖中...',
      drawSuccessTitle: '中奖已到账',
      drawSuccessText: '已写入兑换记录',
      noChanceTitle: '暂无可用抽奖机会',
      noChanceText: '本次资格可能已经使用，中奖记录可在兑换记录中查看。充值或兑换满 $100 后可再次抽奖。',
      pendingTitle: '抽奖状态已刷新',
      pendingText: '系统正在同步中奖结果，请稍后刷新兑换记录查看；如果没有新记录，本次机会不会被扣除。',
      drawFailed: '抽奖失败，请稍后重试',
    }
  }
  return {
    eyebrow: 'ALLCANCODE ACTIVITY',
    titleTop: 'Recharge $100',
    titleMain: 'Win a guaranteed draw',
    subtitle: 'For this campaign, every completed $100 balance recharge grants one draw. Every draw wins, with rewards from $5 to $50.',
    loginCta: 'Sign in to check',
    rechargeCta: 'Recharge now',
    viewEligibility: 'View eligibility',
    viewRules: 'View rules',
    guaranteed: 'Guaranteed win',
    threshold: 'Eligibility rule',
    chanceUnit: 'draw',
    winnersTitle: 'Winner carousel',
    live: 'Live',
    eligibilityTitle: 'My draw eligibility',
    refresh: 'Refresh records',
    publicStateTitle: 'Sign in to check automatically',
    publicStateText: 'We calculate draw chances from completed balance recharges and balance redeem records.',
    loadFailed: 'Could not load records',
    retry: 'Retry',
    qualified: 'Eligible now',
    notQualified: 'Not eligible yet',
    readyToDraw: 'Draw now. The prize is credited automatically.',
    nextNeeded: 'Still needed for next draw',
    progressLabel: 'Current recharge/redeem progress',
    completedRecharge: 'Recharge/redeem total',
    totalChances: 'Total chances',
    usedRewards: 'Reward records',
    rewardAmount: 'Reward amount',
    redeemRecords: 'Redeem records',
    qualifyingRecords: 'Qualifying records',
    loading: 'Loading records...',
    emptyQualifying: 'No qualifying balance recharge or redeem records yet',
    emptyRedeem: 'No redeem records yet',
    drawNow: 'Draw now',
    drawing: 'Drawing...',
    drawSuccessTitle: 'Prize credited',
    drawSuccessText: 'Added to redeem records',
    noChanceTitle: 'No draw chance available',
    noChanceText: 'This chance may already be used. Check redeem records, then recharge or redeem another $100 to draw again.',
    pendingTitle: 'Draw status refreshed',
    pendingText: 'The result is syncing. Refresh redeem records shortly; if no new record appears, this chance was not consumed.',
    drawFailed: 'Draw failed. Please try again later.',
  }
})

const rules = computed<Array<{ icon: RuleIcon; kicker: string; title: string; text: string }>>(() => [
  {
    icon: 'creditCard',
    kicker: '$100',
    title: locale.value.startsWith('zh') ? '充值满额得资格' : 'Recharge threshold',
    text: locale.value.startsWith('zh') ? '单账号每累计完成 $100 余额充值或余额兑换，可获得 1 次抽奖资格。' : 'Every completed $100 balance recharge or balance redeem grants one draw chance.',
  },
  {
    icon: 'gift',
    kicker: '100%',
    title: locale.value.startsWith('zh') ? '抽奖必中' : 'Guaranteed win',
    text: locale.value.startsWith('zh') ? '本期活动抽奖不设空奖，最低奖励 $5，最高奖励 $50。' : `No empty draws in this campaign. Rewards range from $${MIN_PRIZE} to $${MAX_PRIZE}.`,
  },
  {
    icon: 'badge',
    kicker: 'AUTO',
    title: locale.value.startsWith('zh') ? '登录后查资格' : 'Account lookup',
    text: locale.value.startsWith('zh') ? '登录后自动读取当前用户充值订单和余额兑换记录，展示可用资格。' : 'After sign-in, the page reads recharge and balance redeem records to show available chances.',
  },
  {
    icon: 'sparkles',
    kicker: '$5-$50',
    title: locale.value.startsWith('zh') ? '奖励可兑换' : 'Redeemable rewards',
    text: locale.value.startsWith('zh') ? '已中奖的余额奖励会在兑换记录中展示，方便核对活动额度。' : 'Issued balance rewards appear in redeem history for campaign reconciliation.',
  },
])

const winners = [
  { email: 'li***@gmail.com', prize: 18, time: '1 min ago' },
  { email: 'dev***@outlook.com', prize: 50, time: '4 min ago' },
  { email: 'a***@qq.com', prize: 8, time: '7 min ago' },
  { email: 'jo***@icloud.com', prize: 25, time: '12 min ago' },
  { email: 'm***@proton.me', prize: 5, time: '18 min ago' },
  { email: 'ai***@gmail.com', prize: 36, time: '23 min ago' },
]

const activeWinner = computed(() => winners[activeWinnerIndex.value] || winners[0])

const qualifyingOrders = computed(() =>
  orders.value.filter((order) => order.status === 'COMPLETED' && order.order_type === 'balance')
)

const qualifyingRedeemRecords = computed(() =>
  redeemRecords.value.filter((record) => {
    const type = String(record.type || '').toLowerCase()
    const value = safeAmount(record.value)
    return type === 'balance' && value > 0 && !isLotteryRewardRecord(record)
  })
)

const lotteryRewardRecords = computed(() =>
  redeemRecords.value.filter((record) => isLotteryRewardRecord(record))
)

const lotteryRewardTotal = computed(() =>
  lotteryStatus.value?.reward_amount ??
  lotteryRewardRecords.value.reduce((sum, record) => sum + safeAmount(record.value), 0)
)

const localQualifyingAmount = computed(() =>
  qualifyingOrders.value.reduce((sum, order) => sum + safeAmount(order.amount), 0) +
  qualifyingRedeemRecords.value.reduce((sum, record) => sum + safeAmount(record.value), 0)
)

const totalRecharge = computed(() => lotteryStatus.value?.qualifying_amount ?? localQualifyingAmount.value)
const totalChances = computed(() => lotteryStatus.value?.total_chances ?? Math.floor(totalRecharge.value / DRAW_THRESHOLD))
const usedChances = computed(() =>
  lotteryStatus.value?.used_chances ?? Math.min(totalChances.value, lotteryRewardRecords.value.length)
)
const availableChances = computed(() =>
  lotteryStatus.value?.available_chances ?? Math.max(0, totalChances.value - usedChances.value)
)

const qualifyingActivityRecords = computed(() => {
  const paymentRecords = qualifyingOrders.value.map((order) => ({
    id: `order-${order.id}`,
    amount: safeAmount(order.amount),
    date: order.completed_at || order.paid_at || order.created_at,
    sourceLabel: locale.value.startsWith('zh') ? '充值' : 'Recharge',
    reference: order.out_trade_no,
  }))
  const redeemItems = qualifyingRedeemRecords.value.map((record) => ({
    id: `redeem-${record.id}`,
    amount: safeAmount(record.value),
    date: record.used_at || record.created_at,
    sourceLabel: locale.value.startsWith('zh') ? '兑换' : 'Redeem',
    reference: maskCode(record.code),
  }))
  return [...paymentRecords, ...redeemItems].sort((a, b) => {
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  })
})

const cycleAmount = computed(() => {
  if (availableChances.value > 0) return DRAW_THRESHOLD
  return totalRecharge.value % DRAW_THRESHOLD
})

const progressPercent = computed(() => {
  if (availableChances.value > 0) return 100
  return Math.min(100, Math.round((cycleAmount.value / DRAW_THRESHOLD) * 100))
})

const nextRechargeNeeded = computed(() => {
  if (availableChances.value > 0) return 0
  const remainder = totalRecharge.value % DRAW_THRESHOLD
  return remainder === 0 ? DRAW_THRESHOLD : DRAW_THRESHOLD - remainder
})

async function loadUserActivity(): Promise<void> {
  if (!isAuthenticated.value) return
  loadingUserData.value = true
  userError.value = ''

  try {
    const [ordersResponse, history, statusResponse] = await Promise.all([
      paymentAPI.getMyOrders({ page: 1, page_size: 100, status: 'COMPLETED' }),
      redeemAPI.getHistory(),
      lotteryAPI.getStatus().catch(() => null),
    ])
    orders.value = ordersResponse.data?.items || []
    redeemRecords.value = history || []
    lotteryStatus.value = statusResponse?.data || null
  } catch (err) {
    userError.value = extractApiErrorMessage(err, 'Unable to load activity records.')
    orders.value = []
    redeemRecords.value = []
    lotteryStatus.value = null
  } finally {
    loadingUserData.value = false
  }
}

async function handleDraw(): Promise<void> {
  if (drawLoading.value || availableChances.value <= 0) return

  drawLoading.value = true
  drawError.value = ''
  drawResult.value = null

  try {
    const response = await lotteryAPI.draw()
    lotteryStatus.value = response.data.status
    if (response.data.state === 'no_chance') {
      drawError.value = copy.value.noChanceText
      appStore.showInfo(copy.value.noChanceTitle)
      await loadUserActivity()
      return
    }
    if (response.data.state === 'pending_failed') {
      drawError.value = copy.value.pendingText
      appStore.showInfo(copy.value.pendingTitle)
      await loadUserActivity()
      return
    }

    drawResult.value = response.data
    appStore.showSuccess(`${copy.value.drawSuccessTitle}: ${formatCurrency(response.data.prize || 0)}`)
    await Promise.all([
      loadUserActivity(),
      authStore.refreshUser().catch(() => undefined),
    ])
  } catch (err) {
    drawError.value = extractApiErrorMessage(err, copy.value.drawFailed)
    appStore.showError(drawError.value)
  } finally {
    drawLoading.value = false
  }
}

function safeAmount(value: number | string | null | undefined): number {
  const numeric = Number(value || 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function maskCode(value: string): string {
  const code = String(value || '')
  if (code.length <= 8) return code || '--'
  return `${code.slice(0, 4)}...${code.slice(-4)}`
}

function isLotteryRewardRecord(record: RedeemHistoryItem): boolean {
  return String(record.code || '').toUpperCase().startsWith('LOTTERY-')
}

function formatRecordDate(value: string): string {
  return formatDate(value, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function scrollToEligibility(): void {
  eligibilitySection.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    void loadUserActivity()
  } else {
    orders.value = []
    redeemRecords.value = []
    lotteryStatus.value = null
    drawResult.value = null
    drawError.value = ''
    userError.value = ''
  }
}, { immediate: true })

onMounted(() => {
  if (!appStore.publicSettingsLoaded) {
    void appStore.fetchPublicSettings()
  }
  winnerTimer = window.setInterval(() => {
    activeWinnerIndex.value = (activeWinnerIndex.value + 1) % winners.length
  }, 2400)
})

onBeforeUnmount(() => {
  if (winnerTimer) window.clearInterval(winnerTimer)
})
</script>

<style scoped>
.lottery-page {
  position: relative;
  z-index: 1;
  max-width: 1460px;
  margin: 0 auto;
  padding: 64px 40px 84px;
}

.lottery-hero {
  display: grid;
  min-height: 540px;
  grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.95fr);
  align-items: center;
  gap: 42px;
}

.hero-kicker,
.panel-head p,
.rule-card span {
  margin: 0;
  color: #0ad840;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-copy h1 {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 18px 0 0;
  line-height: 1.05;
}

.hero-copy h1 span:first-child {
  background: linear-gradient(270deg, #fff 66%, rgba(255, 255, 255, 0.5) 100%);
  background-clip: text;
  font-size: clamp(34px, 4.5vw, 66px);
  font-weight: 420;
  -webkit-text-fill-color: transparent;
}

.hero-copy h1 span:last-child {
  background: linear-gradient(270deg, #fff 58%, rgba(10, 216, 64, 0.62) 100%);
  background-clip: text;
  font-size: clamp(52px, 7vw, 104px);
  font-weight: 580;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  max-width: 720px;
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 17px;
  line-height: 1.8;
}

.hero-actions,
.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
}

.btn-primary,
.btn-ghost,
.panel-primary,
.panel-ghost,
.icon-button {
  display: inline-flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 800;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.btn-primary,
.panel-primary {
  border: 1px solid #0ad840;
  background: #0ad840;
  color: #001a06;
}

.btn-primary {
  min-height: 48px;
  gap: 9px;
  padding: 0 24px;
}

.btn-ghost,
.panel-ghost {
  border: 1px solid rgba(255, 255, 255, 0.36);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.btn-ghost {
  min-height: 48px;
  gap: 10px;
  padding: 0 22px;
}

.btn-primary:hover,
.btn-ghost:hover,
.panel-primary:hover,
.panel-ghost:hover,
.icon-button:hover {
  transform: translateY(-1px);
}

.green-dot,
.live-chip i {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #0ad840;
  box-shadow: 0 0 16px rgba(10, 216, 64, 0.75);
}

.draw-stage {
  position: relative;
  min-height: 430px;
  overflow: hidden;
  border: 1px solid rgba(46, 195, 83, 0.3);
  border-radius: 8px;
  background:
    radial-gradient(circle at 50% 28%, rgba(10, 216, 64, 0.22), transparent 32%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(18px);
}

.draw-stage::before {
  position: absolute;
  inset: 20px;
  content: "";
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
}

.logo-orbit {
  position: absolute;
  top: 72px;
  left: 50%;
  display: grid;
  width: 132px;
  height: 132px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(46, 195, 83, 0.7);
  border-radius: 8px;
  background: linear-gradient(135deg, #0ad840, #1f95ac);
  color: #001a06;
  font-size: 58px;
  font-weight: 950;
  box-shadow: 0 0 80px rgba(10, 216, 64, 0.35);
  transform: translateX(-50%);
}

.prize-band,
.draw-rule {
  position: absolute;
  right: 34px;
  left: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.42);
  padding: 18px;
}

.prize-band {
  bottom: 112px;
}

.draw-rule {
  bottom: 34px;
}

.prize-band span,
.draw-rule span {
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
  font-weight: 800;
}

.prize-band strong,
.draw-rule strong {
  color: #fff;
  font-size: 24px;
  font-weight: 950;
}

.pixel-prizes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.pixel-prizes i {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #0ad840;
  box-shadow: 18px 28px 0 rgba(31, 149, 172, 0.75), 42px 8px 0 rgba(255, 206, 93, 0.7);
  animation: prizeFloat 4.8s ease-in-out infinite;
  animation-delay: var(--delay);
}

.rule-grid,
.content-grid,
.records-grid {
  display: grid;
  gap: 16px;
}

.rule-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 18px;
}

.rule-card,
.winners-panel,
.eligibility-panel,
.records-panel {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.065);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
}

.rule-card {
  min-height: 220px;
  padding: 22px;
}

.rule-icon {
  display: inline-flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  border: 1px solid rgba(10, 216, 64, 0.38);
  border-radius: 8px;
  background: rgba(10, 216, 64, 0.12);
  color: #0ad840;
}

.rule-card strong {
  display: block;
  margin-top: 9px;
  color: #fff;
  font-size: 20px;
  font-weight: 900;
}

.rule-card p {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 14px;
  line-height: 1.65;
}

.content-grid {
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  margin-top: 16px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 22px;
}

.panel-head h2 {
  margin: 6px 0 0;
  color: #fff;
  font-size: 24px;
  font-weight: 950;
}

.live-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(10, 216, 64, 0.35);
  border-radius: 999px;
  background: rgba(10, 216, 64, 0.1);
  color: #9dffb3;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 900;
}

.winner-showcase {
  padding: 22px 22px 10px;
}

.active-winner {
  display: grid;
  min-height: 156px;
  place-items: center;
  border: 1px solid rgba(10, 216, 64, 0.24);
  border-radius: 8px;
  background: rgba(10, 216, 64, 0.1);
  text-align: center;
}

.active-winner span,
.active-winner small,
.winner-row span,
.record-row span,
.record-row small,
.metric-grid span,
.progress-copy span,
.eligibility-badge small,
.login-state span,
.compact-state {
  color: rgba(255, 255, 255, 0.58);
}

.active-winner strong {
  color: #fff;
  font-size: 48px;
  font-weight: 950;
}

.winner-list,
.record-list {
  display: grid;
}

.winner-list {
  gap: 8px;
  padding: 12px 22px 22px;
}

.winner-row,
.record-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.22);
  padding: 12px 14px;
}

.winner-row.active {
  border-color: rgba(10, 216, 64, 0.48);
  background: rgba(10, 216, 64, 0.1);
}

.winner-row strong,
.record-row strong,
.metric-grid strong,
.progress-copy strong,
.eligibility-badge strong {
  color: #fff;
  font-weight: 950;
}

.icon-button {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.icon-button:disabled {
  cursor: wait;
  opacity: 0.62;
}

.login-state {
  display: flex;
  min-height: 392px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 34px;
  color: #0ad840;
  text-align: center;
}

.login-state strong {
  color: #fff;
  font-size: 24px;
  font-weight: 950;
}

.login-state span {
  max-width: 460px;
  line-height: 1.7;
}

.error-state {
  color: #f6c85f;
}

.user-eligibility {
  padding: 22px;
}

.eligibility-badge {
  display: grid;
  gap: 7px;
  border: 1px solid rgba(246, 200, 95, 0.34);
  border-radius: 8px;
  background: rgba(246, 200, 95, 0.09);
  padding: 20px;
}

.eligibility-badge.qualified {
  border-color: rgba(10, 216, 64, 0.44);
  background: rgba(10, 216, 64, 0.1);
}

.eligibility-badge span {
  color: #f6c85f;
  font-size: 13px;
  font-weight: 900;
}

.eligibility-badge.qualified span {
  color: #9dffb3;
}

.eligibility-badge strong {
  font-size: 42px;
}

.draw-result {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
  border: 1px solid rgba(10, 216, 64, 0.32);
  border-radius: 8px;
  background: rgba(10, 216, 64, 0.1);
  color: #0ad840;
  padding: 16px;
}

.draw-result div {
  min-width: 0;
}

.draw-result span,
.draw-result small {
  display: block;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
  font-weight: 800;
}

.draw-result strong {
  display: block;
  color: #fff;
  font-size: 30px;
  font-weight: 950;
  line-height: 1.15;
}

.draw-error {
  margin-top: 14px;
  border: 1px solid rgba(246, 200, 95, 0.34);
  border-radius: 8px;
  background: rgba(246, 200, 95, 0.09);
  color: #f6c85f;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 800;
}

.progress-block {
  margin-top: 18px;
}

.progress-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
}

.progress-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0ad840, #1f95ac, #f6c85f);
  transition: width 0.3s ease;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.metric-grid article {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 14px;
}

.metric-grid span,
.metric-grid strong {
  display: block;
}

.metric-grid span {
  margin-bottom: 9px;
  font-size: 12px;
  font-weight: 800;
}

.metric-grid strong {
  font-size: 22px;
}

.panel-primary,
.panel-ghost {
  min-height: 40px;
  padding: 0 18px;
  font-size: 14px;
}

.draw-button {
  gap: 8px;
}

.draw-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.draw-button:disabled:hover {
  transform: none;
}

.records-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 16px;
}

.record-list {
  gap: 10px;
  padding: 18px 22px 22px;
}

.record-row > div {
  min-width: 0;
}

.record-row strong,
.record-row span {
  display: block;
}

.record-row span {
  overflow: hidden;
  max-width: 420px;
  margin-top: 4px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.record-row small {
  flex: 0 0 auto;
  font-size: 12px;
}

.compact-state {
  padding: 44px 22px;
  text-align: center;
}

:global(.public-style-light .hero-copy h1 span:first-child),
:global(.public-style-light .hero-copy h1 span:last-child){
  background: none;
  color: #101412;
  -webkit-text-fill-color: currentColor;
}

:global(.public-style-light .hero-desc),
:global(.public-style-light .prize-band span),
:global(.public-style-light .draw-rule span),
:global(.public-style-light .active-winner span),
:global(.public-style-light .active-winner small),
:global(.public-style-light .draw-result span),
:global(.public-style-light .draw-result small),
:global(.public-style-light .winner-row span),
:global(.public-style-light .record-row span),
:global(.public-style-light .record-row small),
:global(.public-style-light .metric-grid span),
:global(.public-style-light .progress-copy span),
:global(.public-style-light .eligibility-badge small),
:global(.public-style-light .login-state span),
:global(.public-style-light .compact-state),
:global(.public-style-light .rule-card p){
  color: #173824;
}

:global(.public-style-light .hero-kicker),
:global(.public-style-light .panel-head p),
:global(.public-style-light .rule-card span){
  color: #087b2f;
}

:global(.public-style-light .draw-stage),
:global(.public-style-light .rule-card),
:global(.public-style-light .winners-panel),
:global(.public-style-light .eligibility-panel),
:global(.public-style-light .records-panel){
  border-color: rgba(8, 91, 38, 0.3);
  background: linear-gradient(180deg, #ffffff 0%, #eef8f1 100%);
  box-shadow:
    0 18px 60px rgba(6, 58, 22, 0.16),
    inset 0 1px rgba(255, 255, 255, 0.9);
}

:global(.public-style-light .draw-stage){
  border-color: rgba(15, 127, 120, 0.38);
  background:
    radial-gradient(circle at 50% 28%, rgba(8, 123, 47, 0.18), transparent 34%),
    radial-gradient(circle at 20% 82%, rgba(184, 121, 20, 0.12), transparent 30%),
    linear-gradient(145deg, #ffffff, #eaf7ed);
}

:global(.public-style-light .draw-stage::before),
:global(.public-style-light .panel-head),
:global(.public-style-light .winner-row),
:global(.public-style-light .record-row),
:global(.public-style-light .metric-grid article),
:global(.public-style-light .active-winner){
  border-color: rgba(8, 91, 38, 0.26);
}

:global(.public-style-light .panel-head){
  background: linear-gradient(180deg, #f0fbf2 0%, #ffffff 100%);
}

:global(.public-style-light .logo-orbit){
  border-color: rgba(8, 123, 47, 0.42);
  background: linear-gradient(135deg, #0fbf4a 0%, #58c7b1 58%, #f2c45a 100%);
  color: #001a06;
  box-shadow: 0 20px 60px rgba(8, 123, 47, 0.18);
}

:global(.public-style-light .prize-band),
:global(.public-style-light .draw-rule),
:global(.public-style-light .winner-row),
:global(.public-style-light .record-row),
:global(.public-style-light .metric-grid article){
  background: #ffffff;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.88);
}

:global(.public-style-light .prize-band),
:global(.public-style-light .draw-rule){
  border-color: rgba(15, 127, 120, 0.24);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(230, 247, 244, 0.78));
  box-shadow: 0 10px 26px rgba(15, 127, 120, 0.09);
}

:global(.public-style-light .active-winner){
  background: linear-gradient(180deg, #e1f4e7, #fff4d2);
}

:global(.public-style-light .winner-row.active){
  border-color: rgba(8, 91, 38, 0.44);
  background: #d8efdf;
}

:global(.public-style-light .prize-band strong),
:global(.public-style-light .draw-rule strong),
:global(.public-style-light .rule-card strong),
:global(.public-style-light .panel-head h2),
:global(.public-style-light .active-winner strong),
:global(.public-style-light .winner-row strong),
:global(.public-style-light .record-row strong),
:global(.public-style-light .draw-result strong),
:global(.public-style-light .metric-grid strong),
:global(.public-style-light .progress-copy strong),
:global(.public-style-light .eligibility-badge strong),
:global(.public-style-light .login-state strong){
  color: #07140d;
}

:global(.public-style-light .record-row),
:global(.public-style-light .winner-row),
:global(.public-style-light .metric-grid article),
:global(.public-style-light .progress-copy){
  color: #07140d;
}

:global(.public-style-light .btn-primary),
:global(.public-style-light .panel-primary){
  border-color: #087b2f;
  background: linear-gradient(180deg, #0a8f36 0%, #066828 100%);
  color: #fff;
  box-shadow:
    0 14px 34px rgba(8, 123, 47, 0.22),
    inset 0 1px rgba(255, 255, 255, 0.24);
}

:global(.public-style-light .btn-ghost),
:global(.public-style-light .panel-ghost),
:global(.public-style-light .icon-button){
  border-color: rgba(15, 127, 120, 0.32);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(230, 247, 244, 0.84));
  color: #0c514c;
  box-shadow: 0 10px 26px rgba(15, 127, 120, 0.1);
}

:global(.public-style-light .rule-icon),
:global(.public-style-light .live-chip){
  border-color: rgba(8, 91, 38, 0.28);
  background: #d9eee0;
  color: #056525;
}

:global(.public-style-light .eligibility-badge){
  border-color: rgba(184, 121, 20, 0.28);
  background: #fff2c7;
}

:global(.public-style-light .eligibility-badge span){
  color: #7a4700;
}

:global(.public-style-light .eligibility-badge.qualified){
  border-color: rgba(8, 91, 38, 0.32);
  background: #d9eee0;
}

:global(.public-style-light .eligibility-badge.qualified span){
  color: #056525;
}

:global(.public-style-light .draw-result){
  border-color: rgba(8, 91, 38, 0.26);
  background: #d9eee0;
  color: #056525;
}

:global(.public-style-light .draw-error){
  border-color: rgba(184, 121, 20, 0.28);
  background: #fff2c7;
  color: #7a4700;
}

:global(.public-style-light .progress-track){
  background: rgba(8, 91, 38, 0.14);
}

:global(.public-style-light .progress-track span){
  background: linear-gradient(90deg, #0a8f36, #0f7f78, #f6c85f);
}

:global(.public-style-light .green-dot),
:global(.public-style-light .live-chip i){
  background: #0a8f36;
  box-shadow:
    0 0 0 4px rgba(10, 143, 54, 0.12),
    0 0 16px rgba(10, 143, 54, 0.36);
}

:global(.public-style-light .pixel-prizes i){
  background: #0a8f36;
  box-shadow:
    18px 28px 0 rgba(15, 127, 120, 0.38),
    42px 8px 0 rgba(184, 121, 20, 0.24);
}

:global(.public-style-light .hero-copy h1 span:first-child),
:global(.public-style-light .hero-copy h1 span:last-child){
  color: #0f172a;
}

:global(.public-style-light .hero-desc),
:global(.public-style-light .prize-band span),
:global(.public-style-light .draw-rule span),
:global(.public-style-light .active-winner span),
:global(.public-style-light .active-winner small),
:global(.public-style-light .draw-result span),
:global(.public-style-light .draw-result small),
:global(.public-style-light .winner-row span),
:global(.public-style-light .record-row span),
:global(.public-style-light .record-row small),
:global(.public-style-light .metric-grid span),
:global(.public-style-light .progress-copy span),
:global(.public-style-light .eligibility-badge small),
:global(.public-style-light .login-state span),
:global(.public-style-light .compact-state),
:global(.public-style-light .rule-card p){
  color: #475569;
}

:global(.public-style-light .hero-kicker),
:global(.public-style-light .panel-head p),
:global(.public-style-light .rule-card span){
  color: #2563eb;
}

:global(.public-style-light .draw-stage),
:global(.public-style-light .rule-card),
:global(.public-style-light .winners-panel),
:global(.public-style-light .eligibility-panel),
:global(.public-style-light .records-panel){
  border-color: rgba(37, 99, 235, 0.16);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow:
    0 18px 60px rgba(15, 23, 42, 0.1),
    inset 0 1px rgba(255, 255, 255, 0.9);
}

:global(.public-style-light .draw-stage){
  border-color: rgba(37, 99, 235, 0.2);
  background:
    radial-gradient(circle at 50% 28%, rgba(37, 99, 235, 0.12), transparent 34%),
    radial-gradient(circle at 20% 82%, rgba(184, 121, 20, 0.12), transparent 30%),
    linear-gradient(145deg, #ffffff, #eef4ff);
}

:global(.public-style-light .draw-stage::before),
:global(.public-style-light .panel-head),
:global(.public-style-light .winner-row),
:global(.public-style-light .record-row),
:global(.public-style-light .metric-grid article),
:global(.public-style-light .active-winner){
  border-color: rgba(37, 99, 235, 0.14);
}

:global(.public-style-light .panel-head),
:global(.public-style-light .prize-band),
:global(.public-style-light .draw-rule){
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
}

:global(.public-style-light .logo-orbit){
  border-color: rgba(37, 99, 235, 0.34);
  background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 58%, #f6c85f 100%);
  color: #fff;
  box-shadow: 0 20px 60px rgba(37, 99, 235, 0.18);
}

:global(.public-style-light .active-winner){
  background: linear-gradient(180deg, #eff6ff, #fff7df);
}

:global(.public-style-light .winner-row.active){
  border-color: rgba(37, 99, 235, 0.28);
  background: #eef4ff;
}

:global(.public-style-light .prize-band strong),
:global(.public-style-light .draw-rule strong),
:global(.public-style-light .rule-card strong),
:global(.public-style-light .panel-head h2),
:global(.public-style-light .active-winner strong),
:global(.public-style-light .winner-row strong),
:global(.public-style-light .record-row strong),
:global(.public-style-light .draw-result strong),
:global(.public-style-light .metric-grid strong),
:global(.public-style-light .progress-copy strong),
:global(.public-style-light .eligibility-badge strong),
:global(.public-style-light .login-state strong){
  color: #0f172a;
}

:global(.public-style-light .btn-primary),
:global(.public-style-light .panel-primary){
  border-color: #2563eb;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
  box-shadow:
    0 14px 34px rgba(37, 99, 235, 0.2),
    inset 0 1px rgba(255, 255, 255, 0.24);
}

:global(.public-style-light .btn-ghost),
:global(.public-style-light .panel-ghost),
:global(.public-style-light .icon-button){
  border-color: rgba(37, 99, 235, 0.22);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.86));
  color: #1d4ed8;
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.1);
}

:global(.public-style-light .rule-icon),
:global(.public-style-light .live-chip),
:global(.public-style-light .eligibility-badge.qualified),
:global(.public-style-light .draw-result){
  border-color: rgba(37, 99, 235, 0.18);
  background: #eff6ff;
  color: #1d4ed8;
}

:global(.public-style-light .eligibility-badge.qualified span){
  color: #1d4ed8;
}

:global(.public-style-light .progress-track){
  background: rgba(37, 99, 235, 0.1);
}

:global(.public-style-light .progress-track span){
  background: linear-gradient(90deg, #2563eb, #0ea5e9, #f6c85f);
}

:global(.public-style-light .green-dot),
:global(.public-style-light .live-chip i),
:global(.public-style-light .pixel-prizes i){
  background: #2563eb;
  box-shadow:
    0 0 0 4px rgba(37, 99, 235, 0.12),
    0 0 16px rgba(37, 99, 235, 0.28);
}

:global(.public-style-light .pixel-prizes i){
  box-shadow:
    18px 28px 0 rgba(14, 165, 233, 0.3),
    42px 8px 0 rgba(184, 121, 20, 0.24);
}

.winner-slide-enter-active,
.winner-slide-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.winner-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.winner-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.spinning {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes prizeFloat {
  0%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  50% {
    opacity: 0.85;
    transform: translateY(-18px);
  }
}

@media (max-width: 1080px) {
  .lottery-hero,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .rule-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .lottery-page {
    padding: 42px 16px 64px;
  }

  .lottery-hero {
    min-height: auto;
  }

  .draw-stage {
    min-height: 390px;
  }

  .hero-actions,
  .panel-actions,
  .records-grid,
  .rule-grid,
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .btn-primary,
  .btn-ghost,
  .panel-primary,
  .panel-ghost {
    width: 100%;
  }

  .records-grid,
  .rule-grid,
  .metric-grid {
    display: grid;
  }

  .progress-copy,
  .record-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .record-row small {
    flex: auto;
  }
}
</style>
