<template>
  <PublicPageShell>
    <div class="monitor-page">
      <section class="page-hero">
        <div>
          <p class="eyebrow">{{ copy.eyebrow }}</p>
          <h1>{{ copy.title }}</h1>
          <p class="hero-copy">
            {{ copy.subtitle }}
          </p>
        </div>

        <div class="hero-stats">
          <article>
            <span>{{ copy.overall }}</span>
            <strong :class="overallStatus">{{ overallLabel }}</strong>
          </article>
          <article>
            <span>{{ copy.routes }}</span>
            <strong>{{ items.length }}</strong>
          </article>
          <article>
            <span>{{ copy.availability }}</span>
            <strong>{{ averageAvailability }}</strong>
          </article>
          <article>
            <span>{{ copy.avgLatency }}</span>
            <strong>{{ averageLatency }}</strong>
          </article>
        </div>
      </section>

      <section class="monitor-toolbar">
        <div class="segmented" aria-label="Monitor window">
          <button
            v-for="option in windowOptions"
            :key="option.value"
            type="button"
            :class="{ active: currentWindow === option.value }"
            @click="handleWindowChange(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="toolbar-actions">
          <span class="status-chip" :class="overallStatus">
            <i></i>
            {{ overallLabel }}
          </span>
          <button type="button" class="refresh-button" :disabled="loading" @click="manualReload">
            <Icon name="refresh" size="sm" :class="{ spinning: loading }" />
            {{ copy.refresh }}
          </button>
        </div>
      </section>

      <section class="monitor-panel">
        <div v-if="error" class="state-box error">
          <strong>{{ copy.unavailable }}</strong>
          <span>{{ error }}</span>
        </div>

        <MonitorCardGrid
          v-else
          :items="items"
          :window="currentWindow"
          :countdown-seconds="countdown"
          :loading="loading"
          :detail-cache="detailCache"
          @card-click="openDetail"
        />
      </section>

      <MonitorDetailDialog
        :show="showDetail"
        :monitor-id="detailTarget?.id ?? null"
        :title="detailTitle"
        @close="closeDetail"
      />
    </div>
  </PublicPageShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@/components/icons'
import PublicPageShell from '@/components/public/PublicPageShell.vue'
import MonitorCardGrid from '@/components/user/monitor/MonitorCardGrid.vue'
import MonitorDetailDialog from '@/components/user/MonitorDetailDialog.vue'
import channelMonitorUserAPI, {
  type UserMonitorDetail,
  type UserMonitorView,
} from '@/api/channelMonitor'
import { STATUS_OPERATIONAL } from '@/constants/channelMonitor'
import { extractApiErrorMessage } from '@/utils/apiError'

type MonitorWindow = '7d' | '15d' | '30d'
type OverallStatus = 'operational' | 'degraded'

const windowOptions = computed<Array<{ value: MonitorWindow; label: string }>>(() => [
  { value: '7d', label: isZh.value ? '7 天' : '7 days' },
  { value: '15d', label: isZh.value ? '15 天' : '15 days' },
  { value: '30d', label: isZh.value ? '30 天' : '30 days' },
])

const items = ref<UserMonitorView[]>([])
const { locale } = useI18n()
const loading = ref(false)
const error = ref('')
const currentWindow = ref<MonitorWindow>('7d')
const detailCache = reactive<Record<number, UserMonitorDetail>>({})
const showDetail = ref(false)
const detailTarget = ref<UserMonitorView | null>(null)
const countdown = ref(30)
let refreshTimer: number | null = null
let countdownTimer: number | null = null
let abortController: AbortController | null = null
const isZh = computed(() => locale.value.startsWith('zh'))
const copy = computed(() => isZh.value ? {
  eyebrow: '模型健康',
  title: '实时模型路由监控',
  subtitle: '公开展示主要模型路由的渠道健康状态。发送生产流量前，可查看可用性、延迟和近期状态。',
  overall: '整体状态',
  routes: '路由数',
  availability: '可用性',
  avgLatency: '平均延迟',
  refresh: '刷新',
  unavailable: '监控暂时不可用',
  operational: '正常',
  degraded: '降级',
  detailTitle: '监控详情',
} : {
  eyebrow: 'MODEL HEALTH',
  title: 'Live model route monitor',
  subtitle: 'Public channel health for primary model routes. Check availability, latency, and recent status before sending production traffic.',
  overall: 'Overall',
  routes: 'Routes',
  availability: 'Availability',
  avgLatency: 'Avg. Latency',
  refresh: 'Refresh',
  unavailable: 'Monitor is temporarily unavailable',
  operational: 'Operational',
  degraded: 'Degraded',
  detailTitle: 'Monitor Detail',
})

const overallStatus = computed<OverallStatus>(() => {
  if (!items.value.length) return 'operational'
  return items.value.every((item) => item.primary_status === STATUS_OPERATIONAL)
    ? 'operational'
    : 'degraded'
})

const overallLabel = computed(() => (overallStatus.value === 'operational' ? copy.value.operational : copy.value.degraded))

const averageAvailability = computed(() => {
  if (!items.value.length) return '--'
  const values = items.value
    .map((item) => Number(item.availability_7d))
    .filter((value) => Number.isFinite(value))
  if (!values.length) return '--'
  const value = values.reduce((sum, item) => sum + item, 0) / values.length
  return `${value.toFixed(1)}%`
})

const averageLatency = computed(() => {
  const latencies = items.value
    .map((item) => Number(item.primary_latency_ms || 0))
    .filter((value) => Number.isFinite(value) && value > 0)
  if (!latencies.length) return '--'
  const value = latencies.reduce((sum, item) => sum + item, 0) / latencies.length
  return `${Math.round(value)}ms`
})

const detailTitle = computed(() => detailTarget.value?.name || copy.value.detailTitle)

async function reload(silent = false): Promise<void> {
  abortController?.abort()
  const ctrl = new AbortController()
  abortController = ctrl
  if (!silent) loading.value = true
  error.value = ''

  try {
    const response = await channelMonitorUserAPI.list({ signal: ctrl.signal })
    if (ctrl.signal.aborted || abortController !== ctrl) return
    items.value = response.items || []
  } catch (err: unknown) {
    const e = err as { name?: string; code?: string }
    if (e?.name === 'AbortError' || e?.code === 'ERR_CANCELED') return
    error.value = extractApiErrorMessage(err, 'Unable to load model health data.')
    items.value = []
  } finally {
    if (abortController === ctrl) {
      loading.value = false
      countdown.value = 30
      abortController = null
    }
  }
}

async function manualReload(): Promise<void> {
  await reload(false)
  if (currentWindow.value !== '7d') {
    await ensureDetailsForWindow()
  }
}

async function loadDetail(id: number, force = false): Promise<void> {
  if (!force && detailCache[id]) return
  try {
    detailCache[id] = await channelMonitorUserAPI.status(id)
  } catch {
    // Keep the public grid usable even when detail data is unavailable.
  }
}

async function ensureDetailsForWindow(): Promise<void> {
  if (currentWindow.value === '7d') return
  await Promise.all(items.value.map((item) => loadDetail(item.id)))
}

function handleWindowChange(value: MonitorWindow): void {
  currentWindow.value = value
  void ensureDetailsForWindow()
}

function openDetail(row: UserMonitorView): void {
  detailTarget.value = row
  showDetail.value = true
}

function closeDetail(): void {
  showDetail.value = false
  detailTarget.value = null
}

function startTimers(): void {
  refreshTimer = window.setInterval(() => {
    void reload(true)
  }, 30_000)
  countdownTimer = window.setInterval(() => {
    countdown.value = countdown.value <= 1 ? 30 : countdown.value - 1
  }, 1000)
}

watch(items, () => {
  void ensureDetailsForWindow()
})

onMounted(() => {
  void reload(false)
  startTimers()
})

onBeforeUnmount(() => {
  abortController?.abort()
  if (refreshTimer) window.clearInterval(refreshTimer)
  if (countdownTimer) window.clearInterval(countdownTimer)
})
</script>

<style scoped>
.monitor-page {
  position: relative;
  z-index: 1;
  max-width: 1460px;
  margin: 0 auto;
  padding: 64px 40px 84px;
}

.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  gap: 28px;
  align-items: end;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 12px;
  color: #0ad840;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page-hero h1 {
  max-width: 760px;
  margin: 0;
  background: linear-gradient(270deg, #fff 62%, rgba(10, 216, 64, 0.58) 100%);
  background-clip: text;
  color: #fff;
  font-size: clamp(42px, 6vw, 92px);
  font-weight: 560;
  line-height: 1.04;
  -webkit-text-fill-color: transparent;
}

.hero-copy {
  max-width: 660px;
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 17px;
  line-height: 1.75;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.hero-stats article,
.monitor-toolbar,
.monitor-panel {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.065);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
}

.hero-stats article {
  min-height: 108px;
  padding: 18px;
}

.hero-stats span {
  display: block;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
  font-weight: 700;
}

.hero-stats strong {
  color: #fff;
  font-size: 28px;
  font-weight: 900;
}

.hero-stats strong.operational {
  color: #9dffb3;
}

.hero-stats strong.degraded {
  color: #f6c85f;
}

.monitor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  padding: 14px;
}

.segmented {
  display: inline-flex;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.28);
  padding: 4px;
}

.segmented button,
.refresh-button {
  border: 0;
  border-radius: 6px;
  font-weight: 800;
}

.segmented button {
  min-width: 74px;
  height: 34px;
  background: transparent;
  color: rgba(255, 255, 255, 0.62);
  font-size: 13px;
}

.segmented button.active {
  background: #0ad840;
  color: #001a06;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  padding: 8px 11px;
  font-size: 12px;
  font-weight: 900;
}

.status-chip i {
  width: 7px;
  height: 7px;
  border-radius: 999px;
}

.status-chip.operational {
  background: rgba(10, 216, 64, 0.12);
  color: #9dffb3;
}

.status-chip.operational i {
  background: #0ad840;
}

.status-chip.degraded {
  background: rgba(245, 158, 11, 0.14);
  color: #f6c85f;
}

.status-chip.degraded i {
  background: #f59e0b;
}

.refresh-button {
  display: inline-flex;
  height: 38px;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(10, 216, 64, 0.36);
  background: rgba(10, 216, 64, 0.11);
  color: #9dffb3;
  padding: 0 12px;
  font-size: 13px;
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.monitor-panel {
  padding: 18px;
}

.state-box {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.62);
  text-align: center;
}

.state-box strong {
  color: #fff;
  font-size: 18px;
}

.spinning {
  animation: spin 0.9s linear infinite;
}

:global(.public-style-light .page-hero h1){
  background: none;
  color: #101412;
  -webkit-text-fill-color: currentColor;
}

:global(.public-style-light .hero-copy),
:global(.public-style-light .hero-stats span),
:global(.public-style-light .state-box){
  color: #173824;
}

:global(.public-style-light .hero-stats article),
:global(.public-style-light .monitor-toolbar),
:global(.public-style-light .monitor-panel){
  border-color: rgba(8, 91, 38, 0.3);
  background: linear-gradient(180deg, #ffffff 0%, #eef8f1 100%);
  box-shadow:
    0 18px 60px rgba(6, 58, 22, 0.16),
    inset 0 1px rgba(255, 255, 255, 0.9);
}

:global(.public-style-light .hero-stats strong),
:global(.public-style-light .state-box strong){
  color: #101412;
}

:global(.public-style-light .hero-stats strong.operational),
:global(.public-style-light .refresh-button){
  color: #087b2f;
}

:global(.public-style-light .hero-stats strong.degraded){
  color: #9a5f05;
}

:global(.public-style-light .segmented){
  border-color: rgba(15, 127, 120, 0.24);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.8);
}

:global(.public-style-light .segmented button){
  color: #12311f;
}

:global(.public-style-light .segmented button.active){
  background: linear-gradient(180deg, #0a8f36, #066828);
  color: #fff;
  box-shadow: 0 8px 20px rgba(8, 123, 47, 0.18);
}

:global(.public-style-light .status-chip.operational){
  border-color: rgba(8, 123, 47, 0.28);
  background: #e8f8ec;
  color: #087b2f;
}

:global(.public-style-light .status-chip.degraded){
  border-color: rgba(184, 121, 20, 0.28);
  background: #fff7df;
  color: #9a5f05;
}

:global(.public-style-light .refresh-button){
  border-color: rgba(15, 127, 120, 0.32);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(230, 247, 244, 0.84));
  box-shadow: 0 10px 26px rgba(15, 127, 120, 0.1);
}

:global(.public-style-light .monitor-panel .text-gray-900),
:global(.public-style-light .monitor-panel .text-gray-800),
:global(.public-style-light .monitor-panel .dark\:text-white),
:global(.public-style-light .monitor-panel .dark\:text-gray-100),
:global(.public-style-light .monitor-panel .font-semibold),
:global(.public-style-light .monitor-panel .font-bold){
  color: #07140d !important;
}

:global(.public-style-light .monitor-panel .text-gray-700),
:global(.public-style-light .monitor-panel .text-gray-600),
:global(.public-style-light .monitor-panel .text-gray-500),
:global(.public-style-light .monitor-panel .text-gray-400),
:global(.public-style-light .monitor-panel .dark\:text-gray-300),
:global(.public-style-light .monitor-panel .dark\:text-gray-400),
:global(.public-style-light .monitor-panel .dark\:text-dark-300),
:global(.public-style-light .monitor-panel .dark\:text-dark-400){
  color: #173824 !important;
}

:global(.public-style-light .monitor-panel button){
  color: #07140d !important;
}

:global(.public-style-light .monitor-panel .bg-white\/70),
:global(.public-style-light .monitor-panel .dark\:bg-dark-800),
:global(.public-style-light .monitor-panel .dark\:bg-dark-800\/60){
  background: #ffffff;
}

:global(.public-style-light .monitor-panel .bg-gray-100),
:global(.public-style-light .monitor-panel .dark\:bg-dark-700),
:global(.public-style-light .monitor-panel .dark\:bg-dark-700\/60){
  background: #dbeee2;
}

:global(.public-style-light .monitor-panel .border-gray-200\/80),
:global(.public-style-light .monitor-panel .dark\:border-dark-700\/70){
  border-color: rgba(8, 91, 38, 0.3);
}

:global(.public-style-light .monitor-panel .bg-gray-50),
:global(.public-style-light .monitor-panel .dark\:bg-dark-900),
:global(.public-style-light .monitor-panel .dark\:bg-dark-900\/60){
  background: #e4f3e9;
}

:global(.public-style-light .monitor-panel .border-gray-100),
:global(.public-style-light .monitor-panel .border-gray-200),
:global(.public-style-light .monitor-panel .dark\:border-dark-700),
:global(.public-style-light .monitor-panel .dark\:border-dark-800){
  border-color: rgba(8, 91, 38, 0.24);
}

:global(.public-style-light .page-hero h1){
  color: #0f172a;
}

:global(.public-style-light .hero-copy),
:global(.public-style-light .hero-stats span),
:global(.public-style-light .state-box){
  color: #475569;
}

:global(.public-style-light .hero-stats article),
:global(.public-style-light .monitor-toolbar),
:global(.public-style-light .monitor-panel){
  border-color: rgba(37, 99, 235, 0.16);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow:
    0 18px 60px rgba(15, 23, 42, 0.1),
    inset 0 1px rgba(255, 255, 255, 0.9);
}

:global(.public-style-light .hero-stats strong),
:global(.public-style-light .state-box strong){
  color: #0f172a;
}

:global(.public-style-light .hero-stats strong.operational),
:global(.public-style-light .refresh-button){
  color: #1d4ed8;
}

:global(.public-style-light .segmented){
  border-color: rgba(37, 99, 235, 0.18);
  background: rgba(255, 255, 255, 0.8);
}

:global(.public-style-light .segmented button){
  color: #334155;
}

:global(.public-style-light .segmented button.active){
  background: linear-gradient(180deg, #3b82f6, #1d4ed8);
  color: #fff;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.18);
}

:global(.public-style-light .status-chip.operational){
  border-color: rgba(37, 99, 235, 0.2);
  background: #eff6ff;
  color: #1d4ed8;
}

:global(.public-style-light .refresh-button){
  border-color: rgba(37, 99, 235, 0.22);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.86));
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.1);
}

:global(.public-style-light .monitor-panel .text-gray-900),
:global(.public-style-light .monitor-panel .text-gray-800),
:global(.public-style-light .monitor-panel .dark\:text-white),
:global(.public-style-light .monitor-panel .dark\:text-gray-100),
:global(.public-style-light .monitor-panel .font-semibold),
:global(.public-style-light .monitor-panel .font-bold){
  color: #0f172a !important;
}

:global(.public-style-light .monitor-panel .text-gray-700),
:global(.public-style-light .monitor-panel .text-gray-600),
:global(.public-style-light .monitor-panel .text-gray-500),
:global(.public-style-light .monitor-panel .text-gray-400),
:global(.public-style-light .monitor-panel .dark\:text-gray-300),
:global(.public-style-light .monitor-panel .dark\:text-gray-400),
:global(.public-style-light .monitor-panel .dark\:text-dark-300),
:global(.public-style-light .monitor-panel .dark\:text-dark-400){
  color: #475569 !important;
}

:global(.public-style-light .monitor-panel button){
  color: #0f172a !important;
}

:global(.public-style-light .monitor-panel .bg-gray-100),
:global(.public-style-light .monitor-panel .dark\:bg-dark-700),
:global(.public-style-light .monitor-panel .dark\:bg-dark-700\/60){
  background: #e2e8f0;
}

:global(.public-style-light .monitor-panel .bg-gray-50),
:global(.public-style-light .monitor-panel .dark\:bg-dark-900),
:global(.public-style-light .monitor-panel .dark\:bg-dark-900\/60){
  background: #eef2f7;
}

:global(.public-style-light .monitor-panel .border-gray-200\/80),
:global(.public-style-light .monitor-panel .dark\:border-dark-700\/70),
:global(.public-style-light .monitor-panel .border-gray-100),
:global(.public-style-light .monitor-panel .border-gray-200),
:global(.public-style-light .monitor-panel .dark\:border-dark-700),
:global(.public-style-light .monitor-panel .dark\:border-dark-800){
  border-color: rgba(37, 99, 235, 0.14);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 860px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .monitor-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    justify-content: space-between;
  }
}

@media (max-width: 560px) {
  .monitor-page {
    padding: 42px 16px 64px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }
}
</style>
