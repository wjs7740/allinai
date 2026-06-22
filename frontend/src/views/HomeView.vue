<template>
  <div :class="['allcancode-home min-h-screen bg-black text-white', homeStyleClass]">
    <nav class="top-nav">
      <div class="nav-inner">
        <RouterLink to="/home" class="brand">
          <span>{{ brandName }}</span>
        </RouterLink>

        <div class="nav-tabs" aria-label="AllCanCode navigation">
          <RouterLink
            to="/home"
            class="nav-tab"
            exact-active-class="active"
          >
            {{ t('nav.home') }}
          </RouterLink>
          <RouterLink
            v-for="tab in productTabs"
            :key="tab.key"
            :to="tab.to"
            class="nav-tab"
            active-class="active"
          >
            {{ tab.label }}
          </RouterLink>
        </div>

        <div class="nav-actions">
          <LocaleSwitcher />
          <button
            type="button"
            class="style-toggle"
            :aria-label="styleMode === 'dark' ? 'Switch to light style' : 'Switch to dark style'"
            :title="styleMode === 'dark' ? 'Light style' : 'Dark style'"
            @click="toggleStyle"
          >
            <Icon :name="styleMode === 'dark' ? 'sun' : 'moon'" size="sm" />
          </button>
          <RouterLink
            v-if="isAuthenticated"
            :to="dashboardPath"
            class="login-btn"
          >
            {{ t('home.dashboard') }}
          </RouterLink>
          <RouterLink
            v-else
            to="/login"
            class="login-btn"
          >
            {{ t('auth.signIn') }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <main>
      <section class="hero">
        <div class="hero-video" aria-hidden="true">
          <div class="light-wall">
            <span
              v-for="bar in lightBars"
              :key="bar.id"
              :style="{
                left: `${bar.left}%`,
                top: `${bar.top}%`,
                height: `${bar.height}px`,
                animationDelay: `${bar.delay}s`,
                opacity: bar.opacity
              }"
            ></span>
          </div>
        </div>
        <div class="hero-overlay" aria-hidden="true"></div>
        <div class="halo" aria-hidden="true"></div>

        <div class="hero-content">
          <p class="hero-kicker">{{ homeCopy.heroKicker }}</p>
          <h1 class="hero-title">
            <span class="hero-tagline">
              {{ homeCopy.heroTitleTop }}
              <span class="pixel-mark" aria-hidden="true">
                <i></i><i></i><i></i><i></i><i></i>
              </span>
            </span>
            <span class="hero-main">{{ homeCopy.heroTitleMain }}</span>
          </h1>

          <div class="signup-bonus">
            <span>{{ homeCopy.signupBonusKicker }}</span>
            <strong>{{ homeCopy.signupBonusTitle }}</strong>
            <small>{{ homeCopy.signupBonusText }}</small>
          </div>

          <div class="hero-buttons">
            <a :href="primaryCta.to" class="btn-primary">
              {{ primaryCta.label }}
              <span class="arrow-stack" aria-hidden="true">»</span>
            </a>
            <button class="btn-ghost" type="button" @click="scrollToSection('pricing')">
              <span class="green-dot"></span>
              {{ homeCopy.viewPlans }}
            </button>
          </div>
        </div>

        <div class="stats-grid">
          <article v-for="stat in heroStats" :key="stat.label" class="stat-card">
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
            <div :class="['stat-symbol', stat.symbolClass]" aria-hidden="true">
              <span v-for="shape in stat.shapes" :key="shape"></span>
            </div>
          </article>
        </div>

        <div id="models" class="model-strip">
          <div class="strip-track" aria-hidden="true">
            <span v-for="item in duplicatedModelStrip" :key="item.key" class="strip-item">
              <span class="strip-icon">{{ item.icon }}</span>
              {{ item.name }}
            </span>
          </div>
        </div>
      </section>

      <section id="pricing" class="popular-section">
        <div class="popular-inner">
          <div class="popular-top">
            <div class="popular-heading">
              <span class="section-eyebrow">{{ homeCopy.popularEyebrow }}</span>
              <h2><span>{{ homeCopy.popularMuted }}</span> {{ homeCopy.popularTitle }}</h2>
              <p>{{ homeCopy.popularText }}</p>
              <div class="popular-points" aria-label="Plan highlights">
                <span v-for="point in pricingHighlights" :key="point">{{ point }}</span>
              </div>
            </div>

            <a :href="SHOP_URL" class="view-all-models">
              {{ homeCopy.viewModels }}
              <span>»</span>
            </a>
          </div>

          <div class="model-card-grid">
            <article v-for="model in popularModels" :key="model.name" class="model-card">
              <div class="model-card-head">
                <span class="model-badge">{{ model.badge }}</span>
                <span class="model-context">{{ model.context }}</span>
              </div>
              <h3>{{ model.name }}</h3>
              <div class="price-box">
                <span>{{ model.leftLabel }} <strong>{{ model.input }}</strong></span>
                <span>{{ model.rightLabel }} <strong>{{ model.output }}</strong></span>
              </div>
              <div class="model-tags">
                <span v-for="tag in model.tags" :key="tag">{{ tag }}</span>
              </div>
              <a :href="SHOP_URL" class="model-buy">{{ homeCopy.cardBuy }}</a>
            </article>
          </div>
        </div>
      </section>

      <section class="reliability-section">
        <div class="center-heading">
          <h2><span>{{ homeCopy.reliabilityMuted }}</span> {{ homeCopy.reliabilityTitle }}</h2>
          <p>{{ homeCopy.reliabilityText }}</p>
        </div>

        <div class="reliability-grid">
          <article v-for="card in reliabilityCards" :key="card.title" class="reliability-card">
            <div class="card-copy">
              <h3>{{ card.title }}</h3>
              <p v-html="card.description"></p>
            </div>
            <div :class="['tech-visual', card.visual]" aria-hidden="true">
              <span v-for="index in 8" :key="index"></span>
            </div>
          </article>
        </div>
      </section>

      <section class="quickstart-section">
        <div class="center-heading">
          <h2><span>{{ homeCopy.quickMuted }}</span> {{ homeCopy.quickTitle }}</h2>
          <p>{{ homeCopy.quickText }}</p>
        </div>

        <div class="timeline">
          <div class="timeline-line" aria-hidden="true"></div>
          <article v-for="step in quickStartSteps" :key="step.title" class="step-card">
            <span>{{ step.index }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </article>
        </div>
      </section>

      <section class="code-section">
        <div class="code-copy">
          <p>{{ homeCopy.codeKicker }}</p>
          <h2>{{ homeCopy.codeTitle }}</h2>
          <span>{{ homeCopy.codeText }}</span>
          <a href="/keys" class="panel-primary">{{ homeCopy.createKey }}</a>
        </div>
        <pre class="code-window"><code>import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "ak-allcancode-...",
  baseURL: "https://api.allcancode.ai"
});

const completion = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello AllCanCode" }]
});</code></pre>
      </section>

      <section class="testimonial-section">
        <div class="center-heading">
          <h2><span>{{ homeCopy.builtMuted }}</span> {{ homeCopy.builtTitle }}</h2>
          <p>{{ homeCopy.builtText }}</p>
        </div>
        <div class="testimonial-grid">
          <article v-for="item in testimonials" :key="item.name" class="testimonial-card">
            <p>{{ item.quote }}</p>
            <strong>{{ item.name }}</strong>
            <span>{{ item.role }}</span>
          </article>
        </div>
      </section>

      <section class="final-cta">
        <div>
          <p>{{ homeCopy.finalKicker }}</p>
          <h2>{{ homeCopy.finalTitle }}</h2>
          <span>{{ homeCopy.finalText }}</span>
        </div>
        <a :href="primaryCta.to" class="btn-primary">
          {{ primaryCta.label }}
          <span class="arrow-stack" aria-hidden="true">»</span>
        </a>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import usageAPI, { type UserDashboardStats } from '@/api/usage'
import channelMonitorUserAPI, { type UserMonitorView } from '@/api/channelMonitor'

const authStore = useAuthStore()
const appStore = useAppStore()
const { t, locale } = useI18n()

const brandName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'AllCanCode')
const STYLE_STORAGE_KEY = 'allcancode_public_style'
const SHOP_URL = 'https://shop.allincode.top'
const styleMode = ref<'dark' | 'light'>(readStyleMode())
const dashboardStats = ref<UserDashboardStats | null>(null)
const monitorCards = ref<UserMonitorView[]>([])

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => (isAdmin.value ? '/admin/dashboard' : '/dashboard'))
const isZh = computed(() => locale.value.startsWith('zh'))
const homeStyleClass = computed(() => (styleMode.value === 'light' ? 'public-style-light' : 'public-style-dark'))

const lightBars = Array.from({ length: 76 }, (_, index) => ({
  id: index,
  left: (index * 7.7 + (index % 5) * 2.6) % 100,
  top: 6 + ((index * 13) % 72),
  height: 80 + ((index * 31) % 360),
  delay: (index % 12) * 0.32,
  opacity: 0.18 + ((index % 6) * 0.08),
}))

const primaryCta = computed(() => ({
  label: isAuthenticated.value ? t('home.dashboard') : t('home.getStarted'),
  to: isAuthenticated.value ? dashboardPath.value : '/register',
}))

const homeCopy = computed(() => isZh.value ? {
  heroKicker: `${brandName.value} AI 网关`,
  heroTitleTop: '一个 Key 接入',
  heroTitleMain: 'OpenAI、Claude 与 Gemini',
  signupBonusKicker: '新用户福利',
  signupBonusTitle: '注册即送 10 刀额度',
  signupBonusText: '完成注册后可直接用于模型调用测试',
  viewPlans: '查看套餐与余额',
  reliabilityMuted: '一个 Key，',
  reliabilityTitle: '稳定可靠',
  reliabilityText: '一个 API 和一个 Key 接入 OpenAI、Claude 与 Gemini。透明计费、智能路由、高可用和更安全的密钥管理都已内置。',
  popularEyebrow: '限时套餐权益',
  popularMuted: '套餐',
  popularTitle: '价格',
  popularText: '当前余额卡和订阅卡价格，适合按量调用、短期高频和连续项目使用。',
  viewModels: '购买套餐',
  cardBuy: '立即购买',
  quickMuted: '快速',
  quickTitle: '上手指南',
  quickText: '从注册到第一次 OpenAI 兼容请求，按 AllCanCode 的流程快速完成。',
  codeKicker: '兼容 OPENAI SDK',
  codeTitle: '切换 Base URL 即可开始调用',
  codeText: '保留现有 OpenAI SDK 代码，在统一网关使用 AllCanCode API Key。',
  createKey: '创建 API Key',
  builtMuted: '为 AI',
  builtTitle: '开发者而建',
  builtText: '面向开发者、AI 产品团队、自动化工作流和需要统一管理模型调用的创作者。',
  finalKicker: 'ALLCANCODE',
  finalTitle: '一个账号管理 OpenAI、Claude 与 Gemini 调用',
  finalText: '选择套餐、创建 Key，并在同一控制台管理用量、订单、邀请、排行榜和模型健康状态。',
} : {
  heroKicker: `${brandName.value} AI Gateway`,
  heroTitleTop: 'One Key for',
  heroTitleMain: 'OpenAI, Claude & Gemini',
  signupBonusKicker: 'New user bonus',
  signupBonusTitle: 'Sign up and get $10 credit',
  signupBonusText: 'Use it for model-call testing right after registration',
  viewPlans: 'View Plans & Credits',
  reliabilityMuted: 'One Key,',
  reliabilityTitle: 'Rock-Solid Reliability',
  reliabilityText: 'One API and one key for OpenAI, Claude, and Gemini. Transparent billing, smart routing, high availability, and safer key management are built in.',
  popularEyebrow: 'Limited Plan Benefits',
  popularMuted: 'Plan',
  popularTitle: 'Pricing',
  popularText: 'Current balance cards and subscription cards for pay-as-you-go calls, short bursts, and continuous projects.',
  viewModels: 'Buy Plans',
  cardBuy: 'Buy now',
  quickMuted: 'Quick',
  quickTitle: 'Start Guide',
  quickText: 'Go from signup to your first OpenAI-compatible request with a clean AllCanCode setup flow.',
  codeKicker: 'OPENAI SDK COMPATIBLE',
  codeTitle: 'Switch the Base URL and start calling',
  codeText: 'Keep your existing OpenAI SDK code and use an AllCanCode API key at the unified gateway.',
  createKey: 'Create API Key',
  builtMuted: 'Built for',
  builtTitle: 'AI Builders',
  builtText: 'Built for developers, AI product teams, automation workflows, and creators managing model calls in one place.',
  finalKicker: 'ALLCANCODE',
  finalTitle: 'One account for your OpenAI, Claude, and Gemini calls',
  finalText: 'Choose a plan, create a key, and manage usage, orders, referrals, rankings, and model health from one console.',
})

const heroStats = computed(() => [
  {
    label: 'Model families',
    value: '3',
    symbolClass: 'symbol-shapes',
    shapes: ['triangle', 'circle', 'cross', 'square'],
  },
  {
    label: 'Provider routes',
    value: '3',
    symbolClass: 'symbol-connection',
    shapes: ['line-a', 'line-b', 'line-c', 'line-d'],
  },
  {
    label: 'Avg. latency',
    value: dashboardStats.value ? formatLatency(dashboardStats.value.average_duration_ms) : '<100ms',
    symbolClass: 'symbol-cube',
    shapes: ['cube-a', 'cube-b', 'cube-c'],
  },
  {
    label: 'Uptime',
    value: monitorCards.value.length ? `${formatAvailability()}%` : '99.8%',
    symbolClass: 'symbol-atom',
    shapes: ['orbit-a', 'orbit-b', 'core'],
  },
])

const modelStrip = [
  { name: 'OpenAI', icon: '◎' },
  { name: 'GPT-5.5', icon: '◎' },
  { name: 'GPT-5.4', icon: '◎' },
  { name: 'OpenAI Fable', icon: '◎' },
  { name: 'Claude', icon: '✺' },
  { name: 'Claude Opus 4.8', icon: '✺' },
  { name: 'Claude Sonnet 4.6', icon: '✺' },
  { name: 'Gemini', icon: '✦' },
  { name: 'Gemini 3 Pro', icon: '✦' },
]

const duplicatedModelStrip = computed(() =>
  Array.from({ length: 3 }).flatMap((_, groupIndex) =>
    modelStrip.map((item, index) => ({
      ...item,
      key: `${groupIndex}-${index}-${item.name}`,
    }))
  )
)

const productTabs = computed(() =>
  [
    { key: 'ranking', label: t('nav.ranking'), to: '/ranking' },
    { key: 'monitor', label: t('nav.monitor'), to: '/monitor' },
    { key: 'key-usage', label: t('nav.keyUsage'), to: '/key-usage' },
    { key: 'help', label: t('nav.help'), to: '/help' },
  ]
)

const reliabilityCards = computed(() => isZh.value ? [
  {
    title: '统一 API，一个 Key',
    description: '兼容 OpenAI SDK，用一个 API Key 访问 OpenAI、Claude 和 Gemini，减少多供应商集成成本。',
    visual: 'visual-api',
  },
  {
    title: '透明价格',
    description: '按量付费，失败请求不计费，订单、余额和用量都在同一控制台查看。',
    visual: 'visual-pricing',
  },
  {
    title: '高可用与智能路由',
    description: '路由健康检查会优先选择更稳定、更低延迟的模型渠道。',
    visual: 'visual-routing',
  },
  {
    title: '密钥安全与可观测',
    description: '按项目管理 Key，保留请求路径可观测性，避免前端暴露敏感供应商凭据。',
    visual: 'visual-security',
  },
] : [
  {
    title: 'Unified API, One Key',
    description: 'OpenAI SDK compatible access to OpenAI, Claude, and Gemini with one API key instead of separate provider integrations.',
    visual: 'visual-api',
  },
  {
    title: 'Transparent Pricing',
    description: 'Pay as you go, avoid charges on failed requests, and review orders, balance, and usage from the same console.',
    visual: 'visual-pricing',
  },
  {
    title: 'High Availability, Smart Routing',
    description: 'Route health checks favor more stable model channels and reduce failed calls or queueing delays.',
    visual: 'visual-routing',
  },
  {
    title: 'Data Security & Compliance',
    description: 'Manage keys by project, keep request paths observable, and avoid exposing sensitive provider credentials in frontend code.',
    visual: 'visual-security',
  },
])

const popularModels = computed(() => isZh.value ? [
  { badge: '余额', name: '余额卡 200 刀', context: '20 USDT', leftLabel: '支付', input: '20U', rightLabel: '到账', output: '$200', tags: ['按量付费', '统一余额', '适合测试'] },
  { badge: '余额', name: '余额卡 1000 刀', context: '98 USDT', leftLabel: '支付', input: '98U', rightLabel: '到账', output: '$1000', tags: ['高性价比', '批量任务', '团队共享'] },
  { badge: '日卡', name: '订阅日卡', context: '24U / 天', leftLabel: '支付', input: '24U', rightLabel: '每日', output: '$300', tags: ['短期高频', '日额度', '灵活开通'] },
  { badge: '周卡', name: '订阅周卡', context: '150U / 周', leftLabel: '支付', input: '150U', rightLabel: '每日', output: '$300', tags: ['连续项目', '周周期', '稳定使用'] },
] : [
  { badge: 'BALANCE', name: 'Balance Card $200', context: '20 USDT', leftLabel: 'Pay', input: '20U', rightLabel: 'Credit', output: '$200', tags: ['Pay as you go', 'Unified balance', 'Testing'] },
  { badge: 'BALANCE', name: 'Balance Card $1000', context: '98 USDT', leftLabel: 'Pay', input: '98U', rightLabel: 'Credit', output: '$1000', tags: ['Best value', 'Batch jobs', 'Teams'] },
  { badge: 'DAILY', name: 'Daily Subscription', context: '24U / day', leftLabel: 'Pay', input: '24U', rightLabel: 'Daily', output: '$300', tags: ['Short bursts', 'Daily quota', 'Flexible'] },
  { badge: 'WEEKLY', name: 'Weekly Subscription', context: '150U / week', leftLabel: 'Pay', input: '150U', rightLabel: 'Daily', output: '$300', tags: ['Project cycles', 'Weekly pass', 'Stable use'] },
])

const pricingHighlights = computed(() => isZh.value
  ? ['注册即送 $10', '失败请求不计费', 'OpenAI SDK 兼容']
  : ['Sign up bonus $10', 'Failed requests not billed', 'OpenAI SDK compatible']
)

const quickStartSteps = computed(() => isZh.value ? [
  { index: '1', title: '创建 API Key', text: '进入控制台，为你的项目创建独立 Key。' },
  { index: '2', title: '使用 SDK 或 HTTP', text: '继续使用 Python、Node.js、Java、Go 或直接 HTTP 的 OpenAI 兼容接口。' },
  { index: '3', title: '发起第一次请求', text: '选择 OpenAI、Claude 或 Gemini 模型，调用 AllCanCode 网关。' },
  { index: '4', title: '追踪用量和成本', text: '在仪表盘查看 Token、请求量、订单和余额变化。' },
] : [
  { index: '1', title: 'Create an API key', text: 'Open the console and create a dedicated key for your project in less than a minute.' },
  { index: '2', title: 'Use an SDK or HTTP', text: 'Keep Python, Node.js, Java, Go, or direct HTTP clients on an OpenAI-compatible interface.' },
  { index: '3', title: 'Send the first request', text: 'Choose an OpenAI, Claude, or Gemini model and call the AllCanCode gateway.' },
  { index: '4', title: 'Track usage and cost', text: 'Review tokens, request volume, orders, and balance changes from the dashboard.' },
])

const testimonials = computed(() => isZh.value ? [
  { quote: '保留原来的 OpenAI SDK 代码，就能加上 Claude 和 Gemini 路由。', name: '独立开发者', role: 'AI 工具' },
  { quote: '模型健康和用量排行让生产流量去向更清楚。', name: '增长负责人', role: '自动化平台' },
  { quote: '一个 Key 和一套订单历史，让团队的 AI 用量对账简单很多。', name: '技术负责人', role: '内容工作流团队' },
] : [
  { quote: 'We kept our OpenAI SDK code and added Claude and Gemini routing without rebuilding the app.', name: 'Independent Developer', role: 'AI Tools' },
  { quote: 'Model health and usage ranking make it much easier to see where production traffic is going.', name: 'Growth Lead', role: 'Automation Platform' },
  { quote: 'One key and one order history simplified how our team reconciles AI usage.', name: 'Tech Lead', role: 'Content Workflow Team' },
])

function readStyleMode(): 'dark' | 'light' {
  return localStorage.getItem(STYLE_STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

function toggleStyle(): void {
  styleMode.value = styleMode.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem(STYLE_STORAGE_KEY, styleMode.value)
  window.dispatchEvent(new CustomEvent('allcancode-public-style-change', { detail: styleMode.value }))
}

function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function formatAvailability(): string {
  if (!monitorCards.value.length) return '99.8'
  const average = monitorCards.value.reduce((sum, item) => sum + Number(item.availability_7d || 0), 0) / monitorCards.value.length
  return average.toFixed(1)
}

function formatLatency(value: number | null | undefined): string {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return '<100ms'
  return `${Math.round(numeric)}ms`
}

async function loadHomeData(): Promise<void> {
  const tasks: Promise<void>[] = []

  if (appStore.cachedPublicSettings?.channel_monitor_enabled !== false) {
    tasks.push(
      channelMonitorUserAPI.list()
        .then((response) => {
          monitorCards.value = (response.items || []).slice(0, 4)
        })
        .catch(() => {
          monitorCards.value = []
        })
    )
  }

  if (isAuthenticated.value) {
    tasks.push(
      usageAPI.getDashboardStats()
        .then((stats) => {
          dashboardStats.value = stats
        })
        .catch(() => {
          dashboardStats.value = null
        })
    )
  }

  await Promise.all(tasks)
}

onMounted(async () => {
  localStorage.setItem(STYLE_STORAGE_KEY, styleMode.value)
  if (!appStore.publicSettingsLoaded) {
    await appStore.fetchPublicSettings()
  }
  await loadHomeData()
})
</script>

<style scoped>
.allcancode-home {
  font-family: "PingFang SC", "Microsoft YaHei", "HarmonyOS Sans", Arial, sans-serif;
}

.announcement {
  position: relative;
  display: flex;
  min-height: 52px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
  background: #000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.pixel-row {
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
}

.pixel-row-left {
  left: 0;
}

.pixel-row-right {
  right: 0;
}

.pixel-row span {
  display: block;
  aspect-ratio: 1;
  height: 100%;
}

.announcement-text {
  z-index: 1;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.announcement-arrow {
  z-index: 1;
  color: rgba(255, 255, 255, 0.7);
  font-size: 22px;
  line-height: 1;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  background: #000;
  backdrop-filter: blur(12px);
}

.nav-inner {
  display: grid;
  max-width: 1460px;
  min-height: 72px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  margin: 0 auto;
  padding: 0 40px;
}

.brand {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 28px;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.brand > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-tabs::-webkit-scrollbar {
  display: none;
}

.nav-tab {
  display: inline-flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.62);
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.nav-tab:hover,
.nav-tab.active {
  color: #fff;
  border-color: rgba(7, 184, 50, 0.75);
  background: rgba(7, 184, 50, 0.18);
  box-shadow: 0 0 24px rgba(7, 184, 50, 0.18);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.style-toggle {
  display: inline-flex;
  width: 38px;
  height: 38px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  background: rgba(98, 98, 98, 0.3);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px) saturate(120%);
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.style-toggle:hover {
  border-color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.1);
}

.login-btn {
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  background: rgba(98, 98, 98, 0.3);
  padding: 8px 24px;
  font-size: 15px;
  font-weight: 700;
  backdrop-filter: blur(24px) saturate(120%);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.85);
}

.hero {
  position: relative;
  display: flex;
  min-height: calc(100svh - 72px);
  flex-direction: column;
  overflow: hidden;
  background: #000;
}

.hero-video {
  position: absolute;
  inset: 0;
  opacity: 0.94;
  background:
    radial-gradient(circle at 50% 38%, rgba(7, 184, 50, 0.18), transparent 24%),
    radial-gradient(circle at 25% 78%, rgba(11, 114, 43, 0.16), transparent 20%),
    linear-gradient(180deg, #000 0%, #010704 58%, #000 100%);
}

.light-wall {
  position: absolute;
  inset: 0;
  filter: blur(0.2px);
}

.light-wall span {
  position: absolute;
  width: 5px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, rgba(20, 255, 96, 0), rgba(20, 255, 96, 0.9), rgba(60, 170, 255, 0.68), rgba(255, 206, 93, 0.35), rgba(20, 255, 96, 0));
  box-shadow:
    0 0 18px rgba(7, 184, 50, 0.5),
    10px 0 0 rgba(20, 255, 96, 0.16),
    22px 0 0 rgba(74, 169, 255, 0.14),
    -14px 0 0 rgba(20, 255, 96, 0.12);
  animation: lightPulse 5s ease-in-out infinite;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.52) 58%, rgba(0, 0, 0, 0.92) 100%),
    radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.36) 48%, rgba(0, 0, 0, 0.9) 100%);
}

.hero-overlay::after {
  position: absolute;
  inset: 0;
  content: "";
  opacity: 0.18;
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(255, 255, 255, 0.16) 4px);
  mix-blend-mode: screen;
}

.halo {
  position: absolute;
  bottom: -20px;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 120px;
  background: linear-gradient(90deg, rgba(46, 195, 82, 0.3), rgba(31, 149, 172, 0.22));
  filter: blur(120px);
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 90px 40px 52px;
  text-align: center;
}

.hero-kicker {
  margin-bottom: 18px;
  color: #0ad840;
  font-size: 15px;
  font-weight: 850;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.hero-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  line-height: 1.1;
}

.hero-tagline,
.hero-main {
  background: linear-gradient(270deg, #fff 66%, rgba(255, 255, 255, 0.5) 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-tagline {
  font-size: clamp(30px, 4vw, 58px);
  font-weight: 420;
}

.hero-main {
  font-size: clamp(48px, 6vw, 88px);
  font-weight: 560;
}

.pixel-mark {
  position: relative;
  top: 3px;
  display: inline-grid;
  width: 52px;
  height: 42px;
  margin-left: 12px;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 3px;
}

.pixel-mark i {
  display: block;
  background: #31ff7a;
  box-shadow: 0 0 12px rgba(49, 255, 122, 0.8);
}

.pixel-mark i:nth-child(1) {
  grid-column: 2 / 5;
  grid-row: 1;
}

.pixel-mark i:nth-child(2) {
  grid-column: 1;
  grid-row: 2 / 4;
}

.pixel-mark i:nth-child(3) {
  grid-column: 5;
  grid-row: 2 / 4;
}

.pixel-mark i:nth-child(4) {
  grid-column: 2 / 5;
  grid-row: 4;
}

.pixel-mark i:nth-child(5) {
  grid-column: 3;
  grid-row: 2 / 4;
  background: #fff;
}

.hero-subtitle {
  margin-bottom: 12px;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-subtitle span {
  color: #07b832;
  font-size: 34px;
  font-weight: 850;
}

.hero-desc {
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.signup-bonus {
  display: inline-grid;
  min-width: min(100%, 520px);
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 6px 14px;
  margin-bottom: 34px;
  border: 1px solid rgba(246, 200, 95, 0.42);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(246, 200, 95, 0.18), rgba(7, 184, 50, 0.1)),
    rgba(0, 0, 0, 0.32);
  padding: 16px 20px;
  box-shadow:
    0 20px 60px rgba(246, 200, 95, 0.12),
    inset 0 1px rgba(255, 255, 255, 0.18);
  text-align: left;
  backdrop-filter: blur(18px);
}

.signup-bonus span {
  grid-row: span 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f6c85f;
  color: #1c1200;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.signup-bonus strong {
  color: #fff;
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 950;
  letter-spacing: -0.02em;
  line-height: 1.05;
}

.signup-bonus small {
  color: rgba(255, 255, 255, 0.68);
  font-size: 13px;
  font-weight: 750;
}

.hero-buttons {
  display: flex;
  align-items: center;
  gap: 18px;
}

.btn-primary,
.btn-ghost {
  display: inline-flex;
  min-height: 66px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 999px;
  padding: 0 42px;
  font-size: 18px;
  font-weight: 800;
  transition: opacity 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.btn-primary {
  position: relative;
  color: #fff;
  border: 1.5px solid #07b832;
  background: linear-gradient(180deg, #063110 0%, rgba(6, 49, 16, 0.42) 100%);
  box-shadow: inset 0 0 0 1px rgba(7, 184, 50, 0.4), 0 18px 50px rgba(7, 184, 50, 0.18);
}

.btn-primary:hover,
.btn-ghost:hover,
.panel-primary:hover,
.panel-ghost:hover {
  transform: translateY(-1px);
}

.arrow-stack {
  color: #8dffb4;
  font-size: 28px;
  line-height: 1;
}

.btn-ghost {
  color: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.06);
}

.green-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #07b832;
  box-shadow: 0 0 10px rgba(7, 184, 50, 0.8);
}

.stats-grid {
  position: relative;
  z-index: 2;
  display: grid;
  width: 100%;
  max-width: 1300px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 0 auto;
  padding: 0 40px 48px;
}

.stat-card,
.reliability-card,
.testimonial-card {
  background: rgba(98, 98, 98, 0.24);
  backdrop-filter: blur(82px) saturate(120%);
  box-shadow:
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.1),
    inset 0 1px rgba(255, 255, 255, 0.5),
    inset 0 0 5px rgba(255, 255, 255, 0.08);
}

.stat-card {
  position: relative;
  display: flex;
  min-height: 150px;
  justify-content: space-between;
  overflow: hidden;
  border-radius: 12px;
  padding: 28px 24px 76px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-value {
  color: #fff;
  font-size: 36px;
  font-weight: 850;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 700;
}

.stat-symbol {
  position: absolute;
  right: 22px;
  bottom: 16px;
  width: 88px;
  height: 70px;
  opacity: 0.8;
}

.stat-symbol span {
  position: absolute;
  display: block;
  border: 1px solid rgba(7, 184, 50, 0.72);
  box-shadow: 0 0 20px rgba(7, 184, 50, 0.18);
}

.symbol-shapes span:nth-child(1) {
  width: 36px;
  height: 36px;
  transform: rotate(45deg);
  left: 5px;
  top: 20px;
}

.symbol-shapes span:nth-child(2) {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  right: 8px;
  top: 8px;
}

.symbol-shapes span:nth-child(3) {
  width: 52px;
  height: 1px;
  left: 16px;
  bottom: 15px;
  transform: rotate(-20deg);
}

.symbol-shapes span:nth-child(4) {
  width: 16px;
  height: 16px;
  right: 28px;
  bottom: 6px;
}

.symbol-connection span {
  width: 72px;
  height: 1px;
  left: 8px;
  top: calc(10px + var(--i, 0) * 14px);
}

.symbol-connection span:nth-child(1) {
  --i: 0;
}

.symbol-connection span:nth-child(2) {
  --i: 1;
  transform: rotate(18deg);
}

.symbol-connection span:nth-child(3) {
  --i: 2;
  transform: rotate(-18deg);
}

.symbol-connection span:nth-child(4) {
  --i: 3;
}

.symbol-cube span,
.symbol-atom span {
  border-radius: 999px;
}

.symbol-cube span:nth-child(1) {
  width: 52px;
  height: 52px;
  left: 12px;
  top: 4px;
}

.symbol-cube span:nth-child(2) {
  width: 38px;
  height: 38px;
  right: 0;
  bottom: 0;
}

.symbol-cube span:nth-child(3) {
  width: 84px;
  height: 1px;
  left: 0;
  top: 44px;
  transform: rotate(30deg);
}

.symbol-atom span:nth-child(1),
.symbol-atom span:nth-child(2) {
  width: 84px;
  height: 34px;
  left: 0;
  top: 18px;
  transform: rotate(24deg);
}

.symbol-atom span:nth-child(2) {
  transform: rotate(-24deg);
}

.symbol-atom span:nth-child(3) {
  width: 14px;
  height: 14px;
  left: 36px;
  top: 28px;
  background: #07b832;
}

.model-strip {
  position: relative;
  z-index: 2;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.55);
  padding: 18px 0;
}

.strip-track {
  display: flex;
  width: max-content;
  gap: 16px;
  animation: marquee 32s linear infinite;
}

.strip-item {
  display: inline-flex;
  min-width: 160px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.86);
  font-weight: 800;
}

.strip-icon {
  color: #0ad840;
}

.reliability-section,
.quickstart-section,
.testimonial-section {
  max-width: 1300px;
  margin: 0 auto;
  padding: 118px 40px;
}

.code-copy p,
.final-cta p {
  color: #0ad840;
  font-size: 14px;
  font-weight: 850;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.center-heading h2,
.code-copy h2,
.final-cta h2 {
  margin-top: 14px;
  color: #fff;
  font-size: clamp(38px, 5vw, 72px);
  font-weight: 520;
  letter-spacing: -0.04em;
  line-height: 1.08;
}

.center-heading p,
.code-copy span,
.final-cta span {
  display: block;
  max-width: 780px;
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.8;
}

.panel-primary,
.panel-ghost {
  display: inline-flex;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0 28px;
  font-size: 16px;
  font-weight: 850;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.panel-primary {
  color: #fff;
  border: 1px solid #07b832;
  background: rgba(7, 184, 50, 0.22);
}

.panel-ghost {
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.06);
}

.center-heading {
  margin-bottom: 70px;
  text-align: center;
}

.center-heading h2 span,
.popular-heading h2 span {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 360;
}

.reliability-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 26px;
}

.reliability-card {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 42px;
}

.card-copy {
  position: relative;
  z-index: 2;
  max-width: 420px;
}

.card-copy h3 {
  color: #fff;
  font-size: 32px;
  font-weight: 850;
  letter-spacing: -0.04em;
  line-height: 1.15;
}

.card-copy p {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 17px;
  font-weight: 650;
  line-height: 1.8;
}

.card-copy :deep(strong) {
  color: #fff;
  font-weight: 900;
}

.tech-visual {
  position: absolute;
  right: 22px;
  bottom: 18px;
  width: 260px;
  height: 170px;
  opacity: 0.62;
}

.tech-visual span {
  position: absolute;
  display: block;
  border: 1px solid rgba(62, 216, 107, 0.45);
}

.visual-api span {
  width: 2px;
  height: 150px;
  bottom: 0;
  left: calc(30px * var(--i));
  background: rgba(7, 184, 50, 0.15);
}

.visual-api span:nth-child(n) {
  --i: 1;
}

.visual-api span:nth-child(2n) {
  --i: 3;
}

.visual-pricing span {
  width: 150px;
  height: 42px;
  right: calc(12px * var(--i));
  bottom: calc(20px * var(--i));
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.visual-pricing span:nth-child(n) {
  --i: 1;
}

.visual-pricing span:nth-child(2n) {
  --i: 3;
}

.visual-routing span {
  width: 34px;
  height: 34px;
  left: calc(28px * var(--i));
  bottom: calc(18px * var(--i));
  border-radius: 999px;
}

.visual-routing span:nth-child(n) {
  --i: 1;
}

.visual-routing span:nth-child(2n) {
  --i: 4;
}

.visual-security span {
  width: 200px;
  height: 120px;
  right: calc(6px * var(--i));
  bottom: calc(6px * var(--i));
  border-radius: 30px;
  transform: rotate(-8deg);
}

.visual-security span:nth-child(n) {
  --i: 1;
}

.visual-security span:nth-child(2n) {
  --i: 4;
}

.popular-section {
  position: relative;
  overflow: hidden;
  padding: 96px 22px 0;
  background: #000;
}

.popular-section::before {
  pointer-events: none;
  position: absolute;
  inset: 0;
  content: "";
  opacity: 0.5;
  background: radial-gradient(circle at 50% 0%, rgba(7, 184, 50, 0.18), transparent 28%);
}

.popular-inner {
  position: relative;
  max-width: 1360px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 72px 72px 0 0;
  background:
    radial-gradient(circle at 84% 0%, rgba(7, 184, 50, 0.12), transparent 30%),
    radial-gradient(circle at 10% 100%, rgba(31, 149, 172, 0.08), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f2f6f1 100%);
  background-size: auto, auto, auto;
  color: #111;
  padding: 54px 54px 58px;
  box-shadow:
    0 18px 70px rgba(0, 0, 0, 0.06),
    inset 0 1px rgba(255, 255, 255, 0.9);
}

.popular-inner::before {
  pointer-events: none;
  position: absolute;
  top: -120px;
  right: -80px;
  width: 440px;
  height: 440px;
  content: "";
  border-radius: 999px;
  background: conic-gradient(from 180deg, rgba(7, 184, 50, 0.08), rgba(31, 149, 172, 0.14), rgba(246, 200, 95, 0.1), rgba(7, 184, 50, 0.08));
  filter: blur(1px);
}

.popular-top {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 28px;
  margin-bottom: 28px;
}

.popular-heading {
  max-width: 760px;
  text-align: left;
}

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(10, 216, 64, 0.28);
  border-radius: 999px;
  background: #e8f8ec;
  color: #087b2f;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.popular-heading h2 {
  margin-top: 16px;
  color: #111;
  font-size: clamp(36px, 4vw, 62px);
  font-weight: 620;
  letter-spacing: -0.04em;
  line-height: 1.04;
}

.popular-heading h2 span {
  color: #063a16;
}

.popular-heading p {
  max-width: 720px;
  margin: 14px 0 0;
  color: #4b5f51;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.7;
}

.popular-points {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 18px;
}

.popular-points span {
  border: 1px solid rgba(8, 123, 47, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #173824;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 800;
}

.view-all-models {
  display: inline-flex;
  width: max-content;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(8, 123, 47, 0.26);
  border-radius: 999px;
  background: #fff;
  color: #087b2f;
  padding: 12px 22px;
  font-size: 15px;
  font-weight: 900;
  box-shadow: 0 12px 30px rgba(8, 123, 47, 0.1);
}

.view-all-models span {
  color: inherit;
  font-size: 24px;
}

.model-card-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.model-card {
  position: relative;
  min-height: 264px;
  overflow: hidden;
  border: 1px solid rgba(8, 123, 47, 0.16);
  border-radius: 16px;
  background:
    linear-gradient(90deg, rgba(8, 123, 47, 0.055) 1px, transparent 1px),
    linear-gradient(180deg, rgba(8, 123, 47, 0.045) 1px, transparent 1px),
    radial-gradient(circle at 80% 12%, rgba(10, 216, 64, 0.16), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(238, 248, 241, 0.86));
  background-size: 26px 26px, 26px 26px, auto, auto;
  padding: 22px;
  box-shadow:
    0 16px 44px rgba(6, 58, 22, 0.08),
    inset 0 1px rgba(255, 255, 255, 0.92);
}

.model-card:nth-child(2) {
  border-color: rgba(8, 123, 47, 0.34);
  background:
    linear-gradient(90deg, rgba(8, 123, 47, 0.06) 1px, transparent 1px),
    linear-gradient(180deg, rgba(8, 123, 47, 0.05) 1px, transparent 1px),
    radial-gradient(circle at 78% 14%, rgba(10, 216, 64, 0.24), transparent 36%),
    linear-gradient(180deg, rgba(232, 248, 236, 0.98), rgba(255, 255, 255, 0.9));
  background-size: 26px 26px, 26px 26px, auto, auto;
  box-shadow:
    0 22px 58px rgba(8, 123, 47, 0.13),
    inset 0 1px rgba(255, 255, 255, 0.94);
}

.model-card::before,
.model-card::after {
  pointer-events: none;
  position: absolute;
  content: "";
}

.model-card::before {
  right: -54px;
  bottom: -62px;
  width: 170px;
  height: 170px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.7), transparent 18%),
    conic-gradient(from 150deg, rgba(7, 184, 50, 0.18), rgba(31, 149, 172, 0.18), rgba(246, 200, 95, 0.16), rgba(7, 184, 50, 0.18));
  opacity: 0.8;
}

.model-card::after {
  right: 18px;
  bottom: 58px;
  width: 70px;
  height: 42px;
  border: 1px solid rgba(8, 123, 47, 0.18);
  border-radius: 12px;
  background:
    linear-gradient(90deg, rgba(10, 216, 64, 0.34) 0 24%, transparent 24% 31%, rgba(31, 149, 172, 0.28) 31% 56%, transparent 56% 63%, rgba(246, 200, 95, 0.28) 63%),
    rgba(255, 255, 255, 0.58);
  box-shadow: 0 10px 30px rgba(8, 123, 47, 0.1);
}

.model-card-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.model-badge {
  border: 1px solid rgba(8, 123, 47, 0.22);
  border-radius: 999px;
  background: #e8f8ec;
  color: #087b2f;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 900;
}

.model-context {
  color: #4b5f51;
  font-size: 12px;
  font-weight: 850;
}

.model-card h3 {
  position: relative;
  z-index: 1;
  margin-top: 20px;
  color: #101412;
  font-size: 22px;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.price-box {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 20px;
  border: 1px solid rgba(8, 123, 47, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  padding: 14px;
  color: #4b5f51;
  font-weight: 700;
}

.price-box span {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.price-box strong {
  color: #101412;
  font-size: 21px;
  font-weight: 900;
}

.model-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.model-tags span {
  border: 1px solid rgba(8, 123, 47, 0.15);
  border-radius: 999px;
  background: #fff;
  color: #0b5f2a;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 750;
}

.model-buy {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  border: 1px solid rgba(8, 123, 47, 0.28);
  border-radius: 999px;
  background: #e8f8ec;
  color: #087b2f;
  font-size: 13px;
  font-weight: 900;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.model-buy:hover {
  background: #0a8f36;
  color: #fff;
  transform: translateY(-1px);
}

.quickstart-section {
  position: relative;
  min-height: 760px;
}

.timeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
  padding-top: 120px;
}

.timeline-line {
  position: absolute;
  top: 170px;
  left: 4%;
  right: 4%;
  height: 2px;
  background:
    linear-gradient(90deg, rgba(7, 184, 50, 0), #07b832, rgba(7, 184, 50, 0)),
    repeating-linear-gradient(90deg, transparent 0 28px, rgba(255, 255, 255, 0.25) 28px 30px);
  box-shadow: 0 0 32px rgba(7, 184, 50, 0.35);
}

.step-card {
  position: relative;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  padding: 30px;
}

.step-card:nth-child(odd) {
  transform: translateY(60px);
}

.step-card span {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f5f5f5;
  color: #111;
  font-size: 20px;
  font-weight: 900;
}

.step-card h3 {
  margin-top: 22px;
  color: #fff;
  font-size: 24px;
  font-weight: 850;
}

.step-card p {
  margin-top: 14px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 16px;
  font-weight: 650;
  line-height: 1.7;
}

.code-section {
  display: grid;
  max-width: 1300px;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 30px;
  align-items: center;
  margin: 0 auto;
  padding: 60px 40px 130px;
}

.code-copy .panel-primary {
  margin-top: 36px;
}

.code-window {
  overflow: auto;
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
    #111;
  padding: 34px;
  box-shadow: 0 24px 80px rgba(7, 184, 50, 0.12);
}

.code-window code {
  color: #e8f8ec;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 15px;
  line-height: 1.9;
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.testimonial-card {
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 34px;
}

.testimonial-card p {
  color: rgba(255, 255, 255, 0.72);
  font-size: 18px;
  font-weight: 650;
  line-height: 1.8;
}

.testimonial-card strong {
  display: block;
  margin-top: 30px;
  color: #fff;
  font-size: 18px;
}

.testimonial-card span {
  display: block;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.42);
  font-weight: 650;
}

.final-cta {
  display: flex;
  max-width: 1300px;
  align-items: center;
  justify-content: space-between;
  gap: 34px;
  margin: 0 auto;
  padding: 100px 40px 140px;
}

.final-cta h2 {
  max-width: 820px;
}

.public-style-light {
  background: #f7f7f4;
  color: #101412;
}

.public-style-light .announcement,
.public-style-light .top-nav {
  border-bottom-color: rgba(8, 123, 47, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 250, 241, 0.9)),
    rgba(247, 247, 244, 0.96);
  box-shadow: 0 1px 0 rgba(15, 127, 120, 0.08);
}

.public-style-light .announcement-text,
.public-style-light .announcement-arrow,
.public-style-light .hero-subtitle,
.public-style-light .hero-desc,
.public-style-light .btn-ghost,
.public-style-light .panel-ghost,
.public-style-light .strip-item {
  color: rgba(6, 58, 22, 0.76);
}

.public-style-light .brand,
.public-style-light .hero-main,
.public-style-light .hero-tagline,
.public-style-light .center-heading h2,
.public-style-light .code-copy h2,
.public-style-light .final-cta h2,
.public-style-light .card-copy h3,
.public-style-light .step-card h3,
.public-style-light .testimonial-card strong {
  color: #101412;
  background: none;
  -webkit-text-fill-color: currentColor;
}

.public-style-light .nav-tab {
  border-color: rgba(8, 123, 47, 0.1);
  background: rgba(255, 255, 255, 0.34);
  color: rgba(6, 58, 22, 0.68);
}

.public-style-light .nav-tab:hover,
.public-style-light .nav-tab.active {
  border-color: rgba(8, 123, 47, 0.42);
  background: linear-gradient(180deg, rgba(232, 248, 236, 0.98), rgba(211, 241, 221, 0.82));
  color: #063a16;
  box-shadow: 0 10px 24px rgba(8, 123, 47, 0.12);
}

.public-style-light .style-toggle,
.public-style-light .login-btn {
  border-color: rgba(8, 123, 47, 0.32);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(232, 248, 236, 0.84));
  color: #063a16;
  box-shadow: 0 8px 24px rgba(8, 123, 47, 0.1);
}

.public-style-light .style-toggle:hover,
.public-style-light .login-btn:hover {
  border-color: rgba(15, 127, 120, 0.5);
  background: linear-gradient(180deg, #fff, rgba(230, 247, 244, 0.92));
  box-shadow: 0 12px 28px rgba(15, 127, 120, 0.12);
}

.public-style-light .hero,
.public-style-light .hero-video {
  background:
    radial-gradient(circle at 50% 38%, rgba(7, 184, 50, 0.14), transparent 24%),
    radial-gradient(circle at 25% 78%, rgba(31, 149, 172, 0.1), transparent 20%),
    linear-gradient(180deg, #f7f7f4 0%, #eef7f0 58%, #f7f7f4 100%);
}

.public-style-light .hero-overlay {
  background:
    linear-gradient(180deg, rgba(247, 247, 244, 0.2) 0%, rgba(247, 247, 244, 0.64) 72%, #f7f7f4 100%),
    radial-gradient(circle at 50% 50%, transparent 0%, rgba(255, 255, 255, 0.34) 48%, rgba(247, 247, 244, 0.9) 100%);
}

.public-style-light .hero-overlay::after {
  opacity: 0.09;
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(6, 58, 22, 0.18) 4px);
  mix-blend-mode: multiply;
}

.public-style-light .light-wall span {
  background:
    linear-gradient(90deg, rgba(8, 123, 47, 0), rgba(8, 123, 47, 0.72), rgba(15, 127, 120, 0.46), rgba(184, 121, 20, 0.34), rgba(8, 123, 47, 0));
  box-shadow:
    0 0 14px rgba(8, 123, 47, 0.18),
    10px 0 0 rgba(15, 127, 120, 0.1),
    22px 0 0 rgba(184, 121, 20, 0.1);
}

.public-style-light .pixel-mark i {
  background: #0a8f36;
  box-shadow: 0 0 12px rgba(8, 123, 47, 0.32);
}

.public-style-light .pixel-mark i:nth-child(5) {
  background: #0f7f78;
}

.public-style-light .btn-primary,
.public-style-light .panel-primary {
  border-color: #087b2f;
  background: linear-gradient(180deg, #0a8f36 0%, #066828 100%);
  color: #fff;
  box-shadow:
    0 14px 34px rgba(8, 123, 47, 0.22),
    inset 0 1px rgba(255, 255, 255, 0.24);
}

.public-style-light .btn-ghost,
.public-style-light .panel-ghost {
  border-color: rgba(15, 127, 120, 0.32);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(230, 247, 244, 0.84));
  color: #0c514c;
  box-shadow: 0 10px 26px rgba(15, 127, 120, 0.1);
}

.public-style-light .arrow-stack {
  color: #f6c85f;
}

.public-style-light .green-dot {
  background: #0a8f36;
  box-shadow:
    0 0 0 4px rgba(10, 143, 54, 0.12),
    0 0 16px rgba(10, 143, 54, 0.36);
}

.public-style-light .signup-bonus {
  border-color: rgba(184, 121, 20, 0.34);
  background:
    linear-gradient(135deg, rgba(255, 247, 223, 0.96), rgba(232, 248, 236, 0.92)),
    rgba(255, 255, 255, 0.9);
  box-shadow:
    0 18px 50px rgba(184, 121, 20, 0.1),
    inset 0 1px rgba(255, 255, 255, 0.86);
}

.public-style-light .signup-bonus span {
  background: #0a8f36;
  color: #fff;
}

.public-style-light .signup-bonus strong {
  color: #101412;
}

.public-style-light .signup-bonus small {
  color: #264b32;
}

.public-style-light .stat-card,
.public-style-light .reliability-card,
.public-style-light .testimonial-card,
.public-style-light .step-card {
  border: 1px solid rgba(8, 123, 47, 0.2);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(239, 250, 241, 0.78));
  box-shadow: 0 18px 60px rgba(6, 58, 22, 0.1);
}

.public-style-light .stat-symbol span,
.public-style-light .tech-visual span {
  border-color: rgba(8, 123, 47, 0.36);
  box-shadow: 0 0 18px rgba(8, 123, 47, 0.12);
}

.public-style-light .symbol-atom span:nth-child(3),
.public-style-light .visual-api span {
  background: rgba(8, 123, 47, 0.14);
}

.public-style-light .stat-value,
.public-style-light .card-copy :deep(strong),
.public-style-light .price-box strong {
  color: #101412;
}

.public-style-light .stat-label,
.public-style-light .center-heading p,
.public-style-light .code-copy span,
.public-style-light .final-cta span,
.public-style-light .card-copy p,
.public-style-light .step-card p,
.public-style-light .testimonial-card p,
.public-style-light .testimonial-card span {
  color: #264b32;
}

.public-style-light .model-strip,
.public-style-light .popular-section {
  background: #f7f7f4;
}

.public-style-light .model-strip {
  border-top-color: rgba(8, 123, 47, 0.18);
  border-bottom-color: rgba(15, 127, 120, 0.16);
  background: rgba(232, 248, 236, 0.74);
}

.public-style-light .strip-item {
  border-color: rgba(15, 127, 120, 0.22);
  background: rgba(255, 255, 255, 0.82);
  color: #0c514c;
  box-shadow: 0 8px 22px rgba(15, 127, 120, 0.08);
}

.public-style-light .strip-icon,
.public-style-light .code-copy p,
.public-style-light .final-cta p {
  color: #087b2f;
}

.public-style-light .code-window {
  border-color: rgba(15, 127, 120, 0.24);
  background:
    radial-gradient(circle at 100% 0%, rgba(8, 123, 47, 0.13), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(230, 247, 244, 0.78));
  box-shadow: 0 18px 60px rgba(6, 58, 22, 0.1);
}

.public-style-light .popular-inner {
  border-color: rgba(8, 91, 38, 0.18);
  background:
    linear-gradient(90deg, rgba(6, 58, 22, 0.055) 1px, transparent 1px),
    linear-gradient(180deg, rgba(6, 58, 22, 0.045) 1px, transparent 1px),
    radial-gradient(circle at 76% 12%, rgba(8, 123, 47, 0.16), transparent 30%),
    linear-gradient(135deg, #ffffff 0%, #edf8ef 100%);
  background-size: 34px 34px, 34px 34px, auto, auto;
  box-shadow:
    0 22px 70px rgba(6, 58, 22, 0.1),
    inset 0 1px rgba(255, 255, 255, 0.82);
}

.public-style-light .popular-heading h2,
.public-style-light .model-card h3 {
  color: #101412;
}

.public-style-light .popular-heading p,
.public-style-light .model-context,
.public-style-light .price-box,
.public-style-light .popular-points span {
  color: #173824;
}

.public-style-light .popular-heading h2 span {
  color: rgba(6, 58, 22, 0.46);
}

.public-style-light .section-eyebrow {
  border-color: rgba(8, 91, 38, 0.24);
  background: #d9eee0;
  color: #056525;
}

.public-style-light .popular-points span {
  border-color: rgba(8, 91, 38, 0.18);
  background: rgba(255, 255, 255, 0.74);
}

.public-style-light .view-all-models {
  border-color: #087b2f;
  background: linear-gradient(180deg, #0a8f36 0%, #066828 100%);
  color: #fff;
  box-shadow: 0 14px 34px rgba(8, 123, 47, 0.18);
}

.public-style-light .model-card {
  border-color: rgba(8, 91, 38, 0.2);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(234, 248, 238, 0.86)),
    linear-gradient(90deg, rgba(6, 58, 22, 0.06) 1px, transparent 1px),
    linear-gradient(180deg, rgba(6, 58, 22, 0.05) 1px, transparent 1px);
  background-size: auto, 28px 28px, 28px 28px;
  box-shadow: 0 18px 50px rgba(6, 58, 22, 0.08);
}

.public-style-light .model-card:nth-child(2) {
  border-color: rgba(8, 91, 38, 0.38);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(219, 242, 226, 0.9)),
    linear-gradient(90deg, rgba(6, 58, 22, 0.06) 1px, transparent 1px),
    linear-gradient(180deg, rgba(6, 58, 22, 0.05) 1px, transparent 1px);
  background-size: auto, 28px 28px, 28px 28px;
  box-shadow: 0 20px 58px rgba(8, 91, 38, 0.13);
}

.public-style-light .model-badge {
  border-color: rgba(8, 91, 38, 0.24);
  background: #d9eee0;
  color: #056525;
}

.public-style-light .price-box {
  border-color: rgba(8, 91, 38, 0.2);
  background: rgba(255, 255, 255, 0.82);
}

.public-style-light .price-box strong {
  color: #07140d;
}

.public-style-light .model-tags span {
  border-color: rgba(8, 123, 47, 0.2);
  background: #f2fbf4;
  color: #0b5f2a;
}

.public-style-light .model-buy {
  border-color: rgba(8, 91, 38, 0.24);
  background: #e8f8ec;
  color: #056525;
}

.public-style-light .model-buy:hover {
  background: #0a8f36;
  color: #fff;
}

.public-style-light .step-card span {
  background: #0a8f36;
  color: #fff;
  box-shadow: 0 0 0 5px rgba(10, 143, 54, 0.12);
}

.public-style-light .code-window code {
  color: #15381f;
}

.public-style-light .timeline-line {
  background:
    linear-gradient(90deg, rgba(7, 184, 50, 0), #07b832, rgba(7, 184, 50, 0)),
    repeating-linear-gradient(90deg, transparent 0 28px, rgba(6, 58, 22, 0.24) 28px 30px);
  box-shadow: 0 0 28px rgba(8, 123, 47, 0.18);
}

.public-style-light {
  background: #f8fafc;
  color: #0f172a;
}

.public-style-light .announcement,
.public-style-light .top-nav {
  border-bottom-color: rgba(37, 99, 235, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9)),
    rgba(248, 250, 252, 0.96);
  box-shadow: 0 1px 0 rgba(37, 99, 235, 0.08);
}

.public-style-light .announcement-text,
.public-style-light .announcement-arrow,
.public-style-light .hero-subtitle,
.public-style-light .hero-desc,
.public-style-light .btn-ghost,
.public-style-light .panel-ghost,
.public-style-light .strip-item {
  color: #475569;
}

.public-style-light .brand,
.public-style-light .hero-main,
.public-style-light .hero-tagline,
.public-style-light .center-heading h2,
.public-style-light .code-copy h2,
.public-style-light .final-cta h2,
.public-style-light .card-copy h3,
.public-style-light .step-card h3,
.public-style-light .testimonial-card strong {
  color: #0f172a;
}

.public-style-light .nav-tab {
  border-color: rgba(37, 99, 235, 0.1);
  background: rgba(255, 255, 255, 0.58);
  color: rgba(51, 65, 85, 0.82);
}

.public-style-light .nav-tab:hover,
.public-style-light .nav-tab.active {
  border-color: rgba(37, 99, 235, 0.36);
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.98), rgba(219, 234, 254, 0.86));
  color: #1d4ed8;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.12);
}

.public-style-light .style-toggle,
.public-style-light .login-btn {
  border-color: rgba(37, 99, 235, 0.28);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.88));
  color: #1d4ed8;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.1);
}

.public-style-light .style-toggle:hover,
.public-style-light .login-btn:hover {
  border-color: rgba(14, 165, 233, 0.5);
  background: linear-gradient(180deg, #fff, rgba(239, 246, 255, 0.94));
  box-shadow: 0 12px 28px rgba(14, 165, 233, 0.12);
}

.public-style-light .hero,
.public-style-light .hero-video {
  background:
    radial-gradient(circle at 50% 38%, rgba(37, 99, 235, 0.12), transparent 24%),
    radial-gradient(circle at 25% 78%, rgba(14, 165, 233, 0.1), transparent 20%),
    linear-gradient(180deg, #f8fafc 0%, #eef4ff 58%, #f8fafc 100%);
}

.public-style-light .hero-kicker {
  color: #2563eb;
}

.public-style-light .halo {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.24), rgba(14, 165, 233, 0.18));
}

.public-style-light .hero-overlay {
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.2) 0%, rgba(248, 250, 252, 0.66) 72%, #f8fafc 100%),
    radial-gradient(circle at 50% 50%, transparent 0%, rgba(255, 255, 255, 0.34) 48%, rgba(248, 250, 252, 0.9) 100%);
}

.public-style-light .hero-overlay::after {
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(15, 23, 42, 0.14) 4px);
}

.public-style-light .light-wall span {
  background:
    linear-gradient(90deg, rgba(37, 99, 235, 0), rgba(37, 99, 235, 0.62), rgba(14, 165, 233, 0.46), rgba(184, 121, 20, 0.26), rgba(37, 99, 235, 0));
  box-shadow:
    0 0 14px rgba(37, 99, 235, 0.18),
    10px 0 0 rgba(14, 165, 233, 0.1),
    22px 0 0 rgba(184, 121, 20, 0.08);
}

.public-style-light .pixel-mark i,
.public-style-light .green-dot,
.public-style-light .signup-bonus span,
.public-style-light .step-card span {
  background: #2563eb;
  box-shadow:
    0 0 0 4px rgba(37, 99, 235, 0.12),
    0 0 16px rgba(37, 99, 235, 0.26);
}

.public-style-light .pixel-mark i:nth-child(5) {
  background: #0ea5e9;
}

.public-style-light .btn-primary,
.public-style-light .panel-primary,
.public-style-light .view-all-models {
  border-color: #2563eb;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
  box-shadow:
    0 14px 34px rgba(37, 99, 235, 0.2),
    inset 0 1px rgba(255, 255, 255, 0.24);
}

.public-style-light .btn-ghost,
.public-style-light .panel-ghost {
  border-color: rgba(14, 165, 233, 0.28);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.86));
  color: #1e40af;
  box-shadow: 0 10px 26px rgba(14, 165, 233, 0.1);
}

.public-style-light .signup-bonus {
  border-color: rgba(184, 121, 20, 0.28);
  background:
    linear-gradient(135deg, rgba(255, 247, 223, 0.96), rgba(239, 246, 255, 0.92)),
    rgba(255, 255, 255, 0.9);
}

.public-style-light .signup-bonus strong,
.public-style-light .stat-value,
.public-style-light .card-copy :deep(strong),
.public-style-light .price-box strong,
.public-style-light .popular-heading h2,
.public-style-light .model-card h3 {
  color: #0f172a;
}

.public-style-light .signup-bonus small,
.public-style-light .stat-label,
.public-style-light .center-heading p,
.public-style-light .code-copy span,
.public-style-light .final-cta span,
.public-style-light .card-copy p,
.public-style-light .step-card p,
.public-style-light .testimonial-card p,
.public-style-light .testimonial-card span,
.public-style-light .popular-heading p,
.public-style-light .model-context,
.public-style-light .price-box,
.public-style-light .popular-points span {
  color: #475569;
}

.public-style-light .stat-card,
.public-style-light .reliability-card,
.public-style-light .testimonial-card,
.public-style-light .step-card,
.public-style-light .model-card {
  border-color: rgba(37, 99, 235, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.88));
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
}

.public-style-light .stat-symbol span,
.public-style-light .tech-visual span {
  border-color: rgba(37, 99, 235, 0.26);
  box-shadow: 0 0 18px rgba(37, 99, 235, 0.1);
}

.public-style-light .symbol-atom span:nth-child(3),
.public-style-light .visual-api span {
  background: rgba(37, 99, 235, 0.12);
}

.public-style-light .model-strip,
.public-style-light .popular-section {
  background: #f8fafc;
}

.public-style-light .popular-section::before {
  background: radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.1), transparent 28%);
}

.public-style-light .model-strip {
  border-top-color: rgba(37, 99, 235, 0.14);
  border-bottom-color: rgba(14, 165, 233, 0.14);
  background: rgba(239, 246, 255, 0.7);
}

.public-style-light .strip-item,
.public-style-light .model-tags span,
.public-style-light .model-buy,
.public-style-light .section-eyebrow,
.public-style-light .model-badge {
  border-color: rgba(37, 99, 235, 0.16);
  background: #eff6ff;
  color: #1d4ed8;
}

.public-style-light .strip-icon,
.public-style-light .code-copy p,
.public-style-light .final-cta p {
  color: #2563eb;
}

.public-style-light .code-window,
.public-style-light .popular-inner {
  border-color: rgba(37, 99, 235, 0.16);
  background:
    radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.1), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(239, 246, 255, 0.78));
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
}

.public-style-light .popular-inner {
  background:
    linear-gradient(90deg, rgba(37, 99, 235, 0.045) 1px, transparent 1px),
    linear-gradient(180deg, rgba(37, 99, 235, 0.035) 1px, transparent 1px),
    radial-gradient(circle at 76% 12%, rgba(37, 99, 235, 0.12), transparent 30%),
    linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
}

.public-style-light .popular-inner::before,
.public-style-light .model-card::before {
  background: conic-gradient(from 150deg, rgba(37, 99, 235, 0.16), rgba(14, 165, 233, 0.16), rgba(246, 200, 95, 0.12), rgba(37, 99, 235, 0.16));
}

.public-style-light .model-card::after {
  border-color: rgba(37, 99, 235, 0.16);
  background:
    linear-gradient(90deg, rgba(37, 99, 235, 0.24) 0 24%, transparent 24% 31%, rgba(14, 165, 233, 0.22) 31% 56%, transparent 56% 63%, rgba(246, 200, 95, 0.22) 63%),
    rgba(255, 255, 255, 0.72);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.1);
}

.public-style-light .model-card:nth-child(2) {
  border-color: rgba(37, 99, 235, 0.3);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.92)),
    linear-gradient(90deg, rgba(37, 99, 235, 0.045) 1px, transparent 1px),
    linear-gradient(180deg, rgba(37, 99, 235, 0.035) 1px, transparent 1px);
  box-shadow: 0 20px 58px rgba(37, 99, 235, 0.11);
}

.public-style-light .price-box,
.public-style-light .popular-points span {
  border-color: rgba(37, 99, 235, 0.14);
  background: rgba(255, 255, 255, 0.84);
}

.public-style-light .model-buy:hover {
  background: #2563eb;
  color: #fff;
}

.public-style-light .code-window code {
  color: #1e293b;
}

.public-style-light .timeline-line {
  background:
    linear-gradient(90deg, rgba(37, 99, 235, 0), #2563eb, rgba(37, 99, 235, 0)),
    repeating-linear-gradient(90deg, transparent 0 28px, rgba(15, 23, 42, 0.16) 28px 30px);
  box-shadow: 0 0 28px rgba(37, 99, 235, 0.16);
}

@keyframes lightPulse {
  0%,
  100% {
    transform: translateY(-12px) scaleY(0.9);
    filter: brightness(0.65);
  }
  50% {
    transform: translateY(22px) scaleY(1.1);
    filter: brightness(1.2);
  }
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-33.333%);
  }
}

@media (max-width: 1180px) {
  .nav-inner {
    grid-template-columns: 1fr auto;
  }

  .nav-tabs {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
    padding-bottom: 14px;
  }

  .stats-grid,
  .reliability-grid,
  .code-section,
  .testimonial-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .model-card-grid,
  .timeline {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .announcement {
    min-height: 44px;
    padding: 0 18px;
  }

  .announcement-text {
    font-size: 12px;
    text-align: center;
  }

  .nav-inner {
    padding: 0 18px;
  }

  .brand {
    font-size: 23px;
  }

  .nav-actions {
    gap: 8px;
  }

  .login-btn {
    padding: 7px 16px;
  }

  .hero-content {
    padding: 76px 20px 42px;
  }

  .hero-buttons,
  .final-cta {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-ghost {
    width: 100%;
    min-height: 58px;
    padding: 0 24px;
    font-size: 16px;
  }

  .stats-grid,
  .reliability-grid,
  .model-card-grid,
  .timeline,
  .code-section,
  .testimonial-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .reliability-section,
  .quickstart-section,
  .testimonial-section,
  .code-section,
  .final-cta {
    padding-left: 20px;
    padding-right: 20px;
  }

  .reliability-section,
  .quickstart-section,
  .testimonial-section {
    padding-top: 80px;
    padding-bottom: 80px;
  }

  .reliability-card {
    padding: 28px;
  }

  .popular-section {
    padding: 70px 0 0;
  }

  .popular-inner {
    border-radius: 54px 54px 0 0;
    padding: 76px 20px 90px;
  }

  .popular-top {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .view-all-models {
    margin-left: 0;
  }

  .timeline {
    padding-top: 20px;
  }

  .timeline-line {
    display: none;
  }

  .step-card:nth-child(odd) {
    transform: none;
  }
}
</style>
