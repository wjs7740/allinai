<template>
  <div class="allincode-home min-h-screen bg-black text-white">
    <header class="announcement" @click="scrollToSection('business-console')">
      <div class="pixel-row pixel-row-left" aria-hidden="true">
        <span v-for="color in pixelColors" :key="`left-${color}`" :style="{ background: color }"></span>
      </div>
      <span class="announcement-text">{{ topAnnouncement }}</span>
      <span class="announcement-arrow">›</span>
      <div class="pixel-row pixel-row-right" aria-hidden="true">
        <span v-for="color in [...pixelColors].reverse()" :key="`right-${color}`" :style="{ background: color }"></span>
      </div>
    </header>

    <nav class="top-nav">
      <div class="nav-inner">
        <a href="/home/" class="brand">
          {{ brandName }}
        </a>

        <div class="nav-tabs" aria-label="AllinCode 功能导航">
          <button
            v-for="tab in productTabs"
            :key="tab.key"
            type="button"
            :class="{ active: activeTab === tab.key }"
            @click="selectTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="nav-actions">
          <LocaleSwitcher />
          <a
            v-if="isAuthenticated"
            :href="dashboardPath"
            class="login-btn"
          >
            控制台
          </a>
          <a
            v-else
            href="/login"
            class="login-btn"
          >
            登录
          </a>
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
          <p class="hero-kicker">{{ brandName }} AI Gateway</p>
          <h1 class="hero-title">
            <span class="hero-tagline">
              一个 Key，接入
              <span class="pixel-mark" aria-hidden="true">
                <i></i><i></i><i></i><i></i><i></i>
              </span>
            </span>
            <span class="hero-main">所有主流 AI 大模型</span>
          </h1>

          <p class="hero-subtitle">
            [ OpenAI · Claude · Gemini · DeepSeek · Qwen · Kimi 等
            <span>500+</span>
            模型 ]
          </p>
          <p class="hero-desc">
            人民币付款 · 低于官方价格 · 按量即用 · 失败不计费
          </p>

          <div class="hero-buttons">
            <a :href="primaryCta.to" class="btn-primary">
              {{ primaryCta.label }}
              <span class="arrow-stack" aria-hidden="true">»</span>
            </a>
            <button class="btn-ghost" type="button" @click="selectTab('plans')">
              <span class="green-dot"></span>
              查看套餐与额度
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

      <section id="business-console" class="business-section">
        <div class="section-heading">
          <p>ALLINCODE CONSOLE</p>
          <h2>{{ activeProduct.title }}</h2>
          <span>{{ activeProduct.description }}</span>
        </div>

        <div class="business-panel">
          <div class="business-main">
            <p class="feature-kicker">{{ activeProduct.badge }}</p>
            <h3>{{ activeProduct.headline }}</h3>
            <p>{{ activeProduct.body }}</p>
            <div class="feature-actions">
              <a :href="activeProduct.primaryTo" class="panel-primary">
                {{ activeProduct.primaryLabel }}
              </a>
              <a
                v-if="activeProduct.secondaryTo"
                :href="activeProduct.secondaryTo"
                class="panel-ghost"
              >
                {{ activeProduct.secondaryLabel }}
              </a>
            </div>
          </div>

          <div :class="['business-preview', `preview-${activeTab}`]">
            <article
              v-for="item in activePreviewItems"
              :key="`${activeTab}-${item.title}-${item.meta}`"
              class="preview-card"
            >
              <span>{{ item.meta }}</span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="reliability-section">
        <div class="center-heading">
          <h2><span>One Key,</span> Rock-Solid Reliability</h2>
          <p>一个 API、一个 Key，统一接入多家模型服务。透明计费、智能路由、高可用和数据安全一起打包给你。</p>
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

      <section class="popular-section">
        <div class="popular-inner">
          <div class="popular-heading">
            <h2><span>Popular</span> Models</h2>
            <p>来自主流服务商的热门模型，统一入口、统一账单、统一密钥。</p>
          </div>

          <a href="/keys" class="view-all-models">
            View All 500+ 模型
            <span>»</span>
          </a>

          <div class="model-card-grid">
            <article v-for="model in popularModels" :key="model.name" class="model-card">
              <div class="model-logo">{{ model.logo }}</div>
              <span class="model-badge">{{ model.badge }}</span>
              <h3>{{ model.name }}</h3>
              <p>{{ model.context }}</p>
              <div class="price-box">
                <span>Input <strong>{{ model.input }}</strong></span>
                <span>Output <strong>{{ model.output }}</strong></span>
              </div>
              <div class="model-tags">
                <span v-for="tag in model.tags" :key="tag">{{ tag }}</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="quickstart-section">
        <div class="center-heading">
          <h2><span>Quick</span> Start Guide</h2>
          <p>从注册到第一次调用，按 Code0 式的清晰路径完成 AllinCode 接入。</p>
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
          <p>OPENAI SDK COMPATIBLE</p>
          <h2>替换 Base URL，马上开始调用</h2>
          <span>保持熟悉的 OpenAI SDK 写法，只需要把密钥换成 AllinCode API Key。</span>
          <a href="/keys" class="panel-primary">生成 API Key</a>
        </div>
        <pre class="code-window"><code>import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "ak-allincode-...",
  baseURL: "https://api.allincode.ai/v1"
});

const completion = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello AllinCode" }]
});</code></pre>
      </section>

      <section class="testimonial-section">
        <div class="center-heading">
          <h2><span>Built for</span> AI Builders</h2>
          <p>适合个人开发者、AI 产品团队、自动化工作流和内容创作者统一管理模型调用。</p>
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
          <p>ALLINCODE</p>
          <h2>一个账户，管理你的全部 AI 模型调用</h2>
          <span>先选套餐，再创建 Key。额度、订单、返利、排行和模型健康都在同一个入口。</span>
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
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { paymentAPI } from '@/api/payment'
import usageAPI, { type UserDashboardStats } from '@/api/usage'
import keysAPI from '@/api/keys'
import userAPI from '@/api/user'
import channelMonitorUserAPI, { type UserMonitorView } from '@/api/channelMonitor'
import announcementsAPI from '@/api/announcements'
import dashboardAPI from '@/api/admin/dashboard'
import type {
  ApiKey,
  UserAffiliateDetail,
  UserAnnouncement,
  UserSpendingRankingItem,
} from '@/types'
import type { PaymentOrder, SubscriptionPlan } from '@/types/payment'

type ProductTabKey =
  | 'plans'
  | 'dashboard'
  | 'orders'
  | 'keys'
  | 'affiliate'
  | 'ranking'
  | 'monitor'
  | 'activity'

interface ProductConfig {
  key: ProductTabKey
  label: string
  title: string
  badge: string
  headline: string
  description: string
  body: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel?: string
  secondaryTo?: string
}

interface PreviewItem {
  meta: string
  title: string
  text: string
}

const authStore = useAuthStore()
const appStore = useAppStore()

const brandName = 'AllinCode'
const activeTab = ref<ProductTabKey>('plans')
const checkoutPlans = ref<SubscriptionPlan[]>([])
const dashboardStats = ref<UserDashboardStats | null>(null)
const latestOrders = ref<PaymentOrder[]>([])
const latestKeys = ref<ApiKey[]>([])
const affiliateDetail = ref<UserAffiliateDetail | null>(null)
const rankingItems = ref<UserSpendingRankingItem[]>([])
const monitorCards = ref<UserMonitorView[]>([])
const announcementsPreview = ref<UserAnnouncement[]>([])

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => (isAdmin.value ? '/admin/dashboard' : '/dashboard'))

const pixelColors = ['#2EC353', '#19A63C', '#078C28', '#008020', '#00731C', '#006619', '#004D13', '#00330D', '#001A06', '#000000']

const lightBars = Array.from({ length: 76 }, (_, index) => ({
  id: index,
  left: (index * 7.7 + (index % 5) * 2.6) % 100,
  top: 6 + ((index * 13) % 72),
  height: 80 + ((index * 31) % 360),
  delay: (index % 12) * 0.32,
  opacity: 0.18 + ((index % 6) * 0.08),
}))

const topAnnouncement = computed(() => {
  if (announcementsPreview.value.length) return announcementsPreview.value[0].title
  return 'AllinCode 新用户注册即享多模型聚合调用体验'
})

const primaryCta = computed(() => ({
  label: isAuthenticated.value ? '进入控制台' : '免费开始使用',
  to: isAuthenticated.value ? dashboardPath.value : '/register',
}))

const heroStats = computed(() => [
  {
    label: '支持模型',
    value: checkoutPlans.value.length ? `${Math.max(500, checkoutPlans.value.length * 80)}+` : '500+',
    symbolClass: 'symbol-shapes',
    shapes: ['triangle', 'circle', 'cross', 'square'],
  },
  {
    label: '接入服务商',
    value: '40+',
    symbolClass: 'symbol-connection',
    shapes: ['line-a', 'line-b', 'line-c', 'line-d'],
  },
  {
    label: '平均延迟',
    value: dashboardStats.value ? formatLatency(dashboardStats.value.average_duration_ms) : '<100ms',
    symbolClass: 'symbol-cube',
    shapes: ['cube-a', 'cube-b', 'cube-c'],
  },
  {
    label: '服务在线率',
    value: monitorCards.value.length ? `${formatAvailability()}%` : '99.8%',
    symbolClass: 'symbol-atom',
    shapes: ['orbit-a', 'orbit-b', 'core'],
  },
])

const modelStrip = [
  { name: 'OpenAI', icon: '◎' },
  { name: 'Claude', icon: '✺' },
  { name: 'Gemini', icon: '✦' },
  { name: 'DeepSeek', icon: '◔' },
  { name: 'Qwen', icon: '✥' },
  { name: 'Kimi', icon: 'K' },
  { name: 'Grok', icon: '◍' },
  { name: 'Llama', icon: '∞' },
  { name: 'Coze', icon: '☁' },
]

const duplicatedModelStrip = computed(() =>
  Array.from({ length: 3 }).flatMap((_, groupIndex) =>
    modelStrip.map((item, index) => ({
      ...item,
      key: `${groupIndex}-${index}-${item.name}`,
    }))
  )
)

const productConfigs = computed<Record<ProductTabKey, ProductConfig>>(() => ({
  plans: {
    key: 'plans',
    label: '套餐选购',
    title: '套餐选购',
    badge: 'Pricing',
    headline: '按需选择额度包，余额实时到账',
    description: '选择适合自己的 AI 调用套餐，统一用于多模型请求、API 调用和应用集成。',
    body: '从个人体验到团队开发都可以用同一个账户完成充值、续费和套餐管理。失败请求不扣费，额度消耗清晰可查。',
    primaryLabel: '前往购买',
    primaryTo: '/purchase',
    secondaryLabel: '订单查询',
    secondaryTo: '/orders',
  },
  dashboard: {
    key: 'dashboard',
    label: '数据面板',
    title: '数据面板',
    badge: 'Dashboard',
    headline: '请求、Token、花费和延迟一屏看清',
    description: '把账户余额、今日请求、Token 消耗、模型分布和调用趋势集中展示。',
    body: '适合开发者持续观察成本和效果，快速定位高频模型、异常请求和额度消耗变化。',
    primaryLabel: '打开面板',
    primaryTo: '/dashboard',
    secondaryLabel: '查看用量',
    secondaryTo: '/usage',
  },
  orders: {
    key: 'orders',
    label: '订单查询',
    title: '订单查询',
    badge: 'Orders',
    headline: '充值订单、支付状态、到账记录随时追踪',
    description: '按照订单号、金额和状态查看最近支付记录，方便核对套餐与余额变化。',
    body: '支付完成后系统自动同步账户额度，历史订单可用于团队报销、财务核对和异常排查。',
    primaryLabel: '查看订单',
    primaryTo: '/orders',
    secondaryLabel: '购买套餐',
    secondaryTo: '/purchase',
  },
  keys: {
    key: 'keys',
    label: 'API 密钥',
    title: 'API 密钥',
    badge: 'Keys',
    headline: '一个 Key 接入全部主流模型',
    description: '创建、启停、轮换和管理 API Key，用统一入口接入 OpenAI 兼容生态。',
    body: '密钥可配合不同项目使用，调用记录和额度消耗会自动回流到账户数据面板。',
    primaryLabel: '管理密钥',
    primaryTo: '/keys',
    secondaryLabel: '查看文档',
    secondaryTo: '/dashboard',
  },
  affiliate: {
    key: 'affiliate',
    label: '邀请返利',
    title: '邀请返利',
    badge: 'Affiliate',
    headline: '邀请新用户注册，充值后自动返利',
    description: '分享邀请码或邀请链接，被邀请用户充值后返利进入你的账户。',
    body: '返利额度可随时转入账户余额。邀请人数、返利比例、历史返利和可转余额都可以在返利中心查看。',
    primaryLabel: '返利中心',
    primaryTo: '/affiliate',
    secondaryLabel: '立即注册',
    secondaryTo: '/register',
  },
  ranking: {
    key: 'ranking',
    label: '用量排行',
    title: '用量排行',
    badge: 'Ranking',
    headline: '按请求数、Token 数和花费查看活跃排行',
    description: '用脱敏排行呈现平台活跃度，也帮助团队理解模型调用规模。',
    body: '支持按时间范围和花费维度查看排名，适合运营活动、用量激励和公开榜单展示。',
    primaryLabel: '查看用量',
    primaryTo: '/usage',
    secondaryLabel: isAdmin.value ? '管理总览' : undefined,
    secondaryTo: isAdmin.value ? '/admin/dashboard' : undefined,
  },
  monitor: {
    key: 'monitor',
    label: '模型健康',
    title: '模型健康',
    badge: 'Monitor',
    headline: '模型可用率、延迟和状态实时可见',
    description: '在调用前了解模型健康状态，减少不可用模型带来的业务波动。',
    body: '通过多节点监控和智能路由，优先选择可用率更高、延迟更低的模型通道。',
    primaryLabel: '查看监控',
    primaryTo: '/monitor',
    secondaryLabel: isAdmin.value ? '监控后台' : undefined,
    secondaryTo: isAdmin.value ? '/admin/channels/monitor' : undefined,
  },
  activity: {
    key: 'activity',
    label: '活动抽奖',
    title: '活动抽奖',
    badge: 'Campaign',
    headline: '签到、抽奖、邀请活动都在这里',
    description: '为新用户和活跃用户准备额度奖励、充值券、邀请加成和节日活动。',
    body: '活动规则、开奖公告和中奖记录统一展示，后续可接入自动抽奖和任务奖励体系。',
    primaryLabel: '查看活动',
    primaryTo: '/dashboard',
    secondaryLabel: isAdmin.value ? '管理公告' : undefined,
    secondaryTo: isAdmin.value ? '/admin/announcements' : undefined,
  },
}))

const productTabs = computed(() =>
  Object.values(productConfigs.value).map(({ key, label }) => ({ key, label }))
)

const activeProduct = computed(() => productConfigs.value[activeTab.value])

const activePreviewItems = computed<PreviewItem[]>(() => {
  if (activeTab.value === 'plans') {
    const plans = checkoutPlans.value.slice(0, 3)
    if (plans.length) {
      return plans.map((plan) => ({
        meta: plan.group_name || 'AI Plan',
        title: `${plan.name} · $${formatPrice(plan.price)}`,
        text: normalizePlanFeatures(plan.features)[0] || '多模型通用额度，购买后自动到账。',
      }))
    }
  }

  if (activeTab.value === 'dashboard' && dashboardStats.value) {
    return [
      { meta: 'Today', title: `${formatCompactNumber(dashboardStats.value.today_requests)} 次请求`, text: '今日 API 请求量实时汇总。' },
      { meta: 'Tokens', title: formatTokenCount(dashboardStats.value.total_tokens), text: '累计 Token 用量自动统计。' },
      { meta: 'Latency', title: formatLatency(dashboardStats.value.average_duration_ms), text: '平均响应延迟帮助判断调用体验。' },
    ]
  }

  if (activeTab.value === 'orders' && latestOrders.value.length) {
    return latestOrders.value.slice(0, 3).map((order) => ({
      meta: formatOrderStatus(order.status),
      title: `$${formatPrice(order.amount)}`,
      text: order.out_trade_no,
    }))
  }

  if (activeTab.value === 'keys' && latestKeys.value.length) {
    return latestKeys.value.slice(0, 3).map((key) => ({
      meta: key.status,
      title: key.name,
      text: maskApiKey(key.key),
    }))
  }

  if (activeTab.value === 'affiliate' && affiliateDetail.value) {
    return [
      { meta: '返利比例', title: `${trimPercent(affiliateDetail.value.effective_rebate_rate_percent)}%`, text: '被邀请用户充值后自动计入返利。' },
      { meta: '邀请码', title: affiliateDetail.value.aff_code, text: '可复制邀请码或邀请链接分享给新用户。' },
      { meta: '可转余额', title: `$${formatPrice(affiliateDetail.value.aff_quota)}`, text: '返利额度可转入账户余额继续调用模型。' },
    ]
  }

  if (activeTab.value === 'ranking' && rankingItems.value.length) {
    return rankingItems.value.slice(0, 3).map((item, index) => ({
      meta: `#${index + 1}`,
      title: maskEmail(item.email),
      text: `${formatCompactNumber(item.requests)} 请求 · $${formatPrice(item.actual_cost)}`,
    }))
  }

  if (activeTab.value === 'monitor' && monitorCards.value.length) {
    return monitorCards.value.slice(0, 3).map((monitor) => ({
      meta: monitor.primary_status,
      title: monitor.primary_model,
      text: `${monitor.group_name} · ${formatLatency(monitor.primary_latency_ms)} · ${formatPercent(monitor.availability_7d)}`,
    }))
  }

  if (activeTab.value === 'activity' && announcementsPreview.value.length) {
    return announcementsPreview.value.slice(0, 3).map((notice) => ({
      meta: '公告',
      title: notice.title,
      text: stripHtml(notice.content).slice(0, 80) || '查看最新活动规则和奖励说明。',
    }))
  }

  return fallbackPreviewItems.value[activeTab.value]
})

const fallbackPreviewItems = computed<Record<ProductTabKey, PreviewItem[]>>(() => ({
  plans: [
    { meta: '体验套餐', title: '$5 起', text: '适合测试 OpenAI 兼容接口和快速验证模型效果。' },
    { meta: '开发套餐', title: '高性价比额度', text: '适合个人项目、自动化脚本和轻量应用。' },
    { meta: '团队套餐', title: '统一账单', text: '适合多人协作、批量调用和稳定生产环境。' },
  ],
  dashboard: [
    { meta: '请求数', title: '24h 实时统计', text: '按日查看调用趋势和异常波动。' },
    { meta: 'Token 数', title: '输入/输出分开统计', text: '清楚知道成本花在哪里。' },
    { meta: '成本', title: '余额消耗可追踪', text: '充值、消费、返利都能对上账。' },
  ],
  orders: [
    { meta: 'Paid', title: '支付成功', text: '订单完成后额度自动到账。' },
    { meta: 'Pending', title: '等待支付', text: '未完成订单可继续核对状态。' },
    { meta: 'Refund', title: '异常处理', text: '支付异常可通过订单号快速排查。' },
  ],
  keys: [
    { meta: 'Active', title: 'ak-allincode-****', text: '用于生产环境的主密钥。' },
    { meta: 'Project', title: 'Webhook Bot', text: '为不同项目拆分密钥更容易管理。' },
    { meta: 'Safe', title: '可随时停用', text: '发现泄漏或异常可立即禁用。' },
  ],
  affiliate: [
    { meta: '返利比例', title: '10%', text: '被邀请用户充值后获得对应比例返利。' },
    { meta: '邀请人数', title: '0', text: '注册用户会自动绑定你的邀请码。' },
    { meta: '可转余额', title: 'US$0.00', text: '返利额度可一键转入账户余额。' },
  ],
  ranking: [
    { meta: '#1', title: '2***@qq.com', text: '5,175,408 请求 · $25044.08' },
    { meta: '#2', title: 'w***@163.com', text: '2,226,616 请求 · $8370.48' },
    { meta: '#3', title: '6***@qq.com', text: '1,147,960 请求 · $5087.07' },
  ],
  monitor: [
    { meta: 'Healthy', title: 'GPT-4o mini', text: '99.9% 可用率 · 86ms' },
    { meta: 'Healthy', title: 'Claude Sonnet', text: '99.7% 可用率 · 112ms' },
    { meta: 'Watch', title: 'Gemini Pro', text: '智能路由自动避开拥塞通道。' },
  ],
  activity: [
    { meta: '新人礼', title: '注册领体验额度', text: '新用户完成注册即可参与体验活动。' },
    { meta: '邀请赛', title: '邀请好友拿加成', text: '邀请越多，返利和奖励越高。' },
    { meta: '抽奖', title: '充值抽模型额度', text: '活动期间充值可获得抽奖资格。' },
  ],
}))

const reliabilityCards = [
  {
    title: 'Unified API, One Key',
    description: '兼容 OpenAI SDK，用一个 Key 访问 <strong>500+</strong> 模型，无需为不同服务商分别维护接入。',
    visual: 'visual-api',
  },
  {
    title: 'Transparent Pricing, Pay in CNY',
    description: '按量计费，失败不扣费；支持人民币支付、订单追踪和余额明细。',
    visual: 'visual-pricing',
  },
  {
    title: 'High Availability, Smart Routing',
    description: '多通道健康监控，自动选择更稳定的模型线路，减少调用失败和排队等待。',
    visual: 'visual-routing',
  },
  {
    title: 'Data Security & Compliance',
    description: '密钥分项目管理，请求链路可观测，不在前台暴露敏感信息。',
    visual: 'visual-security',
  },
]

const popularModels = [
  { logo: '✺', badge: '推荐', name: 'Claude Opus 4.7', context: '200k context', input: '¥35/M', output: '¥175/M', tags: ['对话', '推理', '写作'] },
  { logo: '✺', badge: 'HOT', name: 'Claude Sonnet 4.6', context: '200k context', input: '¥21/M', output: '¥105/M', tags: ['对话', '视觉', '工具'] },
  { logo: '◎', badge: 'NEW', name: 'GPT-5.4', context: '256k context', input: '¥17/M', output: '¥105/M', tags: ['对话', '工具', '代码'] },
  { logo: '✦', badge: 'NEW', name: 'Gemini 3 Pro', context: '1M context', input: '¥14/M', output: '¥84/M', tags: ['长文', '视觉', '多模态'] },
  { logo: '◔', badge: 'HOT', name: 'DeepSeek V3', context: '128k context', input: '¥2/M', output: '¥8/M', tags: ['中文', '代码', '低价'] },
  { logo: '✥', badge: 'FAST', name: 'Qwen Max', context: '128k context', input: '¥8/M', output: '¥24/M', tags: ['中文', '工具', '企业'] },
]

const quickStartSteps = [
  { index: '1', title: '注册并获取 API Key', text: '进入控制台创建你的专属密钥，不到一分钟即可开始接入。' },
  { index: '2', title: '安装 SDK 或使用 HTTP', text: '支持 Python、Node.js、Java、Go 等常见技术栈。' },
  { index: '3', title: '发起第一次调用', text: '选择任意主流模型，把请求发送到 AllinCode 统一入口。' },
  { index: '4', title: '查看用量与成本', text: '在数据面板查看 Token、请求数、订单和余额变化。' },
]

const testimonials = [
  { quote: '以前不同模型各开一套账号，现在一个 Key 就够，账单也好对。', name: '独立开发者', role: 'AI 工具产品' },
  { quote: '模型健康和排行对运营很有用，能快速看出用户到底在用什么。', name: '增长负责人', role: '自动化平台' },
  { quote: '人民币支付和订单查询解决了团队内部报销的麻烦。', name: '技术负责人', role: '内容生产团队' },
]

function selectTab(key: ProductTabKey): void {
  activeTab.value = key
  scrollToSection('business-console')
}

function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function formatAvailability(): string {
  if (!monitorCards.value.length) return '99.8'
  const average = monitorCards.value.reduce((sum, item) => sum + Number(item.availability_7d || 0), 0) / monitorCards.value.length
  return average.toFixed(1)
}

function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '0.00'
  return Number(value).toFixed(Number(value) >= 100 ? 0 : 2).replace(/\.00$/, '')
}

function formatCompactNumber(value: number | null | undefined): string {
  const numeric = Number(value || 0)
  if (!Number.isFinite(numeric)) return '--'
  if (numeric >= 1000000) return `${(numeric / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  if (numeric >= 1000) return `${(numeric / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `${numeric}`
}

function formatTokenCount(value: number | null | undefined): string {
  const numeric = Number(value || 0)
  if (!Number.isFinite(numeric)) return '--'
  if (numeric >= 100000000) return `${(numeric / 100000000).toFixed(1).replace(/\.0$/, '')}B`
  if (numeric >= 10000) return `${(numeric / 10000).toFixed(1).replace(/\.0$/, '')}W`
  return formatCompactNumber(numeric)
}

function formatLatency(value: number | null | undefined): string {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return '<100ms'
  return `${Math.round(numeric)}ms`
}

function formatPercent(value: number | null | undefined): string {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '--'
  return `${numeric.toFixed(1)}%`
}

function trimPercent(value: number | null | undefined): string {
  const numeric = Number(value || 0)
  const rounded = Math.round(numeric * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toString()
}

function normalizePlanFeatures(features: string[] | string | null | undefined): string[] {
  if (Array.isArray(features)) return features.filter(Boolean)
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
      return features.split('\n').map((item) => item.trim()).filter(Boolean)
    }
  }
  return []
}

function maskApiKey(value: string | null | undefined): string {
  const key = String(value || '')
  if (!key) return '--'
  if (key.length <= 10) return key
  return `${key.slice(0, 6)}...${key.slice(-4)}`
}

function maskEmail(value: string | null | undefined): string {
  const email = String(value || '')
  const [name, domain] = email.split('@')
  if (!name || !domain) return email || '--'
  if (name.length <= 2) return `${name[0] || '*'}*@${domain}`
  return `${name.slice(0, 2)}***@${domain}`
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function formatOrderStatus(value: string): string {
  const statusMap: Record<string, string> = {
    paid: '已支付',
    pending: '待支付',
    failed: '支付失败',
    cancelled: '已取消',
  }
  return statusMap[value] || value
}

async function loadHomeData(): Promise<void> {
  const tasks: Promise<void>[] = []

  tasks.push(
    paymentAPI.getCheckoutInfo()
      .then((response) => {
        checkoutPlans.value = response.data?.plans || []
      })
      .catch(() => {
        checkoutPlans.value = []
      })
  )

  tasks.push(
    announcementsAPI.list(false)
      .then((items) => {
        announcementsPreview.value = items.slice(0, 3)
      })
      .catch(() => {
        announcementsPreview.value = []
      })
  )

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

    tasks.push(
      paymentAPI.getMyOrders({ page: 1, page_size: 3 })
        .then((response) => {
          latestOrders.value = response.data?.items || []
        })
        .catch(() => {
          latestOrders.value = []
        })
    )

    tasks.push(
      keysAPI.list(1, 3, { sort_by: 'created_at', sort_order: 'desc' })
        .then((response) => {
          latestKeys.value = response.items || []
        })
        .catch(() => {
          latestKeys.value = []
        })
    )

    if (appStore.cachedPublicSettings?.affiliate_enabled) {
      tasks.push(
        userAPI.getAffiliateDetail()
          .then((detail) => {
            affiliateDetail.value = detail
          })
          .catch(() => {
            affiliateDetail.value = null
          })
      )
    }
  }

  if (isAdmin.value) {
    tasks.push(
      dashboardAPI.getUserSpendingRanking({ limit: 5 })
        .then((response) => {
          rankingItems.value = response.ranking || []
        })
        .catch(() => {
          rankingItems.value = []
        })
    )
  }

  await Promise.all(tasks)
}

onMounted(async () => {
  authStore.checkAuth()
  if (!appStore.publicSettingsLoaded) {
    await appStore.fetchPublicSettings()
  }
  await loadHomeData()
})
</script>

<style scoped>
.allincode-home {
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
  color: #fff;
  font-size: 28px;
  font-weight: 850;
  letter-spacing: -0.03em;
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

.nav-tabs button {
  cursor: pointer;
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

.nav-tabs button:hover,
.nav-tabs button.active {
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
  min-height: calc(100svh - 124px);
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
  margin-bottom: 44px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.04em;
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
.preview-card,
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

.business-section,
.reliability-section,
.quickstart-section,
.testimonial-section {
  max-width: 1300px;
  margin: 0 auto;
  padding: 118px 40px;
}

.section-heading {
  margin-bottom: 40px;
}

.section-heading p,
.feature-kicker,
.code-copy p,
.final-cta p {
  color: #0ad840;
  font-size: 14px;
  font-weight: 850;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.section-heading h2,
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

.section-heading span,
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

.business-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 24px;
}

.business-main {
  min-height: 430px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background:
    radial-gradient(circle at 100% 0%, rgba(7, 184, 50, 0.18), transparent 32%),
    rgba(23, 23, 23, 0.92);
  padding: 46px;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.28);
}

.business-main h3 {
  margin-top: 22px;
  color: #fff;
  font-size: clamp(34px, 4vw, 54px);
  font-weight: 850;
  letter-spacing: -0.04em;
  line-height: 1.08;
}

.business-main > p:not(.feature-kicker) {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 18px;
  font-weight: 650;
  line-height: 1.8;
}

.feature-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 42px;
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

.business-preview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.preview-card {
  position: relative;
  min-height: 210px;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 32px;
}

.preview-card::after {
  position: absolute;
  right: -28px;
  bottom: -28px;
  width: 110px;
  height: 110px;
  border-radius: 36px;
  border: 1px solid rgba(7, 184, 50, 0.34);
  content: "";
  transform: rotate(18deg);
}

.preview-card span {
  color: #0ad840;
  font-size: 13px;
  font-weight: 850;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.preview-card strong {
  display: block;
  margin-top: 28px;
  color: #fff;
  font-size: 28px;
  font-weight: 850;
  letter-spacing: -0.03em;
  line-height: 1.18;
}

.preview-card p {
  margin-top: 18px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 16px;
  font-weight: 650;
  line-height: 1.7;
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
  padding: 110px 22px 0;
  background: #000;
}

.popular-inner {
  position: relative;
  max-width: 1440px;
  margin: 0 auto;
  border-radius: 110px 110px 0 0;
  background: #f7f7f4;
  color: #111;
  padding: 110px 90px 120px;
}

.popular-heading {
  text-align: center;
}

.popular-heading h2 {
  color: #111;
  font-size: clamp(42px, 5vw, 76px);
  font-weight: 480;
  letter-spacing: -0.04em;
}

.popular-heading h2 span {
  color: #063a16;
}

.popular-heading p {
  margin-top: 20px;
  color: #666;
  font-size: 18px;
  font-weight: 650;
}

.view-all-models {
  display: flex;
  width: max-content;
  align-items: center;
  gap: 10px;
  margin: 70px 0 36px auto;
  border: 1px solid #ddd;
  border-radius: 999px;
  background: #fff;
  color: #8a8a8a;
  padding: 12px 24px;
  font-size: 17px;
  font-weight: 750;
}

.view-all-models span {
  color: #111;
  font-size: 28px;
}

.model-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.model-card {
  position: relative;
  min-height: 300px;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  padding: 30px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.04);
}

.model-logo {
  color: #e76f48;
  font-size: 42px;
  line-height: 1;
}

.model-badge {
  position: absolute;
  top: 0;
  right: 0;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  border-radius: 0 20px 0 16px;
  background: #fff;
  color: #ff4d3d;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 900;
}

.model-card h3 {
  margin-top: 24px;
  color: #414141;
  font-size: 26px;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.model-card p {
  margin-top: 10px;
  color: #999;
  font-size: 15px;
  font-weight: 650;
}

.price-box {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 30px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #fff;
  padding: 18px;
  color: #999;
  font-weight: 700;
}

.price-box strong {
  color: #333;
  font-size: 24px;
  font-weight: 900;
}

.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.model-tags span {
  border: 1px solid #e2e2e2;
  border-radius: 999px;
  background: #fff;
  color: #777;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 750;
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
  .business-panel,
  .reliability-grid,
  .code-section,
  .testimonial-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .business-preview,
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
  .feature-actions,
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
  .business-panel,
  .business-preview,
  .reliability-grid,
  .model-card-grid,
  .timeline,
  .code-section,
  .testimonial-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .business-section,
  .reliability-section,
  .quickstart-section,
  .testimonial-section,
  .code-section,
  .final-cta {
    padding-left: 20px;
    padding-right: 20px;
  }

  .business-section,
  .reliability-section,
  .quickstart-section,
  .testimonial-section {
    padding-top: 80px;
    padding-bottom: 80px;
  }

  .business-main,
  .preview-card,
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
