<template>
  <PublicPageShell>
    <div class="ranking-shell">
      <section class="ranking-hero">
        <div>
          <p class="hero-kicker">{{ copy.heroKicker }}</p>
          <h1>{{ copy.heroTitle }}</h1>
          <p class="hero-copy">
            {{ copy.heroText }}
          </p>
        </div>

        <div class="summary-grid">
          <article class="summary-card">
            <span>{{ copy.totalSpend }}</span>
            <strong>{{ formatCost(totals.total_actual_cost) }}</strong>
          </article>
          <article class="summary-card">
            <span>{{ copy.requests }}</span>
            <strong>{{ formatNumber(totals.total_requests) }}</strong>
          </article>
          <article class="summary-card">
            <span>{{ copy.tokens }}</span>
            <strong>{{ formatCompact(totals.total_tokens) }}</strong>
          </article>
          <article class="summary-card">
            <span>{{ copy.window }}</span>
            <strong>{{ activeRangeLabel }}</strong>
          </article>
        </div>
      </section>

      <section class="ranking-panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">{{ copy.panelKicker }}</p>
            <h2>{{ copy.panelTitle }}</h2>
          </div>

          <div class="controls">
            <div class="segmented" aria-label="Ranking date range">
              <button
                v-for="range in ranges"
                :key="range.value"
                type="button"
                :class="{ active: activeRange === range.value }"
                @click="setRange(range.value)"
              >
                {{ range.label }}
              </button>
            </div>

            <button type="button" class="sort-button" @click="toggleSort">
              {{ sortLabel }}
            </button>

            <button type="button" class="icon-button" :disabled="loading" aria-label="Refresh ranking" @click="loadRanking">
              <Icon name="refresh" size="sm" :class="{ spinning: loading }" />
            </button>
          </div>
        </div>

        <div v-if="error" class="state-box error-state">
          <strong>{{ copy.unavailable }}</strong>
          <span>{{ error }}</span>
        </div>

        <div v-else-if="loading && !ranking.length" class="state-box loading-state">
          <span class="spinner"></span>
          <span>{{ copy.loading }}</span>
        </div>

        <div v-else-if="!ranking.length" class="state-box">
          <strong>{{ copy.emptyTitle }}</strong>
          <span>{{ copy.emptyText }}</span>
        </div>

        <template v-else>
          <div class="ranking-table-wrap">
            <table class="ranking-table">
              <thead>
                <tr>
                  <th>{{ copy.rank }}</th>
                  <th>{{ copy.user }}</th>
                  <th>{{ copy.requests }}</th>
                  <th>{{ copy.tokens }}</th>
                  <th>{{ copy.share }}</th>
                  <th class="right">{{ copy.spend }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in ranking" :key="item.user_id">
                  <td>
                    <span :class="['rank-badge', rankClass(item.rank)]">{{ item.rank }}</span>
                  </td>
                  <td>
                    <div class="user-cell">
                      <span class="user-avatar">{{ avatarLabel(item.display_name) }}</span>
                      <span>{{ item.display_name }}</span>
                    </div>
                  </td>
                  <td>{{ formatNumber(item.requests) }}</td>
                  <td>
                    <strong>{{ formatCompact(item.tokens) }}</strong>
                    <small>{{ formatNumber(item.tokens) }}</small>
                  </td>
                  <td>
                    <div class="share-cell">
                      <div class="share-track">
                        <span :class="['share-fill', rankClass(item.rank)]" :style="{ width: shareWidth(item) }"></span>
                      </div>
                      <small>{{ formatPercent(shareValue(item)) }}</small>
                    </div>
                  </td>
                  <td class="right spend-cell">{{ formatCost(item.actual_cost) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-list">
            <article v-for="item in ranking" :key="`mobile-${item.user_id}`" class="mobile-row">
              <div class="mobile-row-head">
                <span :class="['rank-badge', rankClass(item.rank)]">{{ item.rank }}</span>
                <div>
                  <strong>{{ item.display_name }}</strong>
                  <span>{{ formatNumber(item.requests) }} {{ copy.requestsUnit }}</span>
                </div>
                <strong>{{ formatCost(item.actual_cost) }}</strong>
              </div>
              <div class="share-track">
                <span :class="['share-fill', rankClass(item.rank)]" :style="{ width: shareWidth(item) }"></span>
              </div>
              <div class="mobile-meta">
                <span>{{ formatCompact(item.tokens) }} {{ copy.tokensUnit }}</span>
                <span>{{ formatPercent(shareValue(item)) }} {{ copy.shareUnit }}</span>
              </div>
            </article>
          </div>
        </template>

        <p class="panel-foot">
          {{ copy.footPrefix }} {{ activeRangeLabel }}. {{ copy.sortedBy }} {{ sortText }}.
        </p>
      </section>
    </div>
  </PublicPageShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PublicPageShell from '@/components/public/PublicPageShell.vue'
import { Icon } from '@/components/icons'
import storefrontAPI, {
  type RankingRange,
  type RankingSortBy,
  type StorefrontRankingItem,
} from '@/api/storefront'

const ranges: Array<{ value: RankingRange; label: string }> = [
  { value: '24h', label: '24h' },
  { value: '3d', label: '3 days' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
]

const activeRange = ref<RankingRange>('30d')
const sortBy = ref<RankingSortBy>('actual_cost')
const { locale } = useI18n()
const ranking = ref<StorefrontRankingItem[]>([])
const loading = ref(false)
const error = ref('')
const totals = ref({
  total_actual_cost: 0,
  total_requests: 0,
  total_tokens: 0,
})

let refreshTimer: number | null = null

const isZh = computed(() => locale.value.startsWith('zh'))
const sortLabel = computed(() => {
  if (sortBy.value === 'actual_cost') return isZh.value ? '排序：消耗' : 'Sort: Spend'
  return isZh.value ? '排序：Token' : 'Sort: Tokens'
})
const sortText = computed(() => {
  if (sortBy.value === 'actual_cost') return isZh.value ? '消耗' : 'spend'
  return isZh.value ? 'Token' : 'tokens'
})
const activeRangeLabel = computed(() => ranges.find((range) => range.value === activeRange.value)?.label || '24h')
const copy = computed(() => isZh.value ? {
  heroKicker: '实时用量排行',
  heroTitle: '来自真实网关流量的用量排行榜',
  heroText: '公开匿名展示 AllCanCode 网关调用排行。消耗、请求数和 Token 数直接聚合自 sub2api 用量日志。',
  totalSpend: '总消耗',
  requests: '请求数',
  tokens: 'Token',
  window: '时间窗口',
  panelKicker: '排行榜',
  panelTitle: '用量排行',
  unavailable: '排行榜暂时不可用',
  loading: '正在加载实时用量数据...',
  emptyTitle: '当前时间窗口暂无用量记录',
  emptyText: '新的 sub2api 用量日志会在请求处理后出现在这里。',
  rank: '排名',
  user: '用户',
  share: '占比',
  spend: '消耗',
  requestsUnit: '次请求',
  tokensUnit: 'Token',
  shareUnit: '占比',
  footPrefix: '数据每 30 秒刷新。当前窗口：',
  sortedBy: '排序依据：',
} : {
  heroKicker: 'LIVE USAGE RANKING',
  heroTitle: 'Real traffic leaderboard from sub2api usage data',
  heroText: 'Public, anonymized usage ranking across AllCanCode gateway calls. Spend, requests, and token volume are aggregated directly from sub2api usage logs.',
  totalSpend: 'Total Spend',
  requests: 'Requests',
  tokens: 'Tokens',
  window: 'Window',
  panelKicker: 'LEADERBOARD',
  panelTitle: 'Usage Ranking',
  unavailable: 'Ranking is temporarily unavailable',
  loading: 'Loading live usage data...',
  emptyTitle: 'No usage records in this window',
  emptyText: 'New sub2api usage logs will appear here after requests are processed.',
  rank: 'Rank',
  user: 'User',
  share: 'Share',
  spend: 'Spend',
  requestsUnit: 'requests',
  tokensUnit: 'tokens',
  shareUnit: 'share',
  footPrefix: 'Data refreshes every 30 seconds. Current window:',
  sortedBy: 'Sorted by',
})

async function loadRanking(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await storefrontAPI.getRanking({
      range: activeRange.value,
      sort_by: sortBy.value,
      limit: 12,
    })
    ranking.value = response.ranking || []
    totals.value = {
      total_actual_cost: response.total_actual_cost || 0,
      total_requests: response.total_requests || 0,
      total_tokens: response.total_tokens || 0,
    }
  } catch (err: any) {
    error.value = err?.message || 'The ranking API did not return data.'
  } finally {
    loading.value = false
  }
}

function setRange(range: RankingRange): void {
  if (activeRange.value === range) return
  activeRange.value = range
  void loadRanking()
}

function toggleSort(): void {
  sortBy.value = sortBy.value === 'actual_cost' ? 'tokens' : 'actual_cost'
  void loadRanking()
}

function shareValue(item: StorefrontRankingItem): number {
  if (sortBy.value === 'tokens') return item.token_share || 0
  if (sortBy.value === 'requests') return item.request_share || 0
  return item.usage_share || 0
}

function shareWidth(item: StorefrontRankingItem): string {
  const value = shareValue(item)
  if (value <= 0) return '0%'
  return `${Math.max(4, Math.min(100, value * 100))}%`
}

function rankClass(rank: number): string {
  if (rank === 1) return 'rank-first'
  if (rank === 2) return 'rank-second'
  if (rank === 3) return 'rank-third'
  return 'rank-normal'
}

function avatarLabel(value: string): string {
  return (value || 'U').trim().slice(0, 1).toUpperCase()
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(isZh.value ? 'zh-CN' : 'en-US').format(Math.round(Number(value || 0)))
}

function formatCompact(value: number): string {
  const numeric = Number(value || 0)
  if (numeric >= 1_000_000_000) return `${(numeric / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (numeric >= 1_000_000) return `${(numeric / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (numeric >= 1_000) return `${(numeric / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return formatNumber(numeric)
}

function formatCost(value: number): string {
  const numeric = Number(value || 0)
  return `$${numeric >= 1 ? numeric.toFixed(2) : numeric.toFixed(4)}`
}

function formatPercent(value: number): string {
  return `${(Math.max(0, value) * 100).toFixed(1)}%`
}

onMounted(() => {
  void loadRanking()
  refreshTimer = window.setInterval(() => {
    void loadRanking()
  }, 30_000)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
.ranking-shell {
  position: relative;
  z-index: 1;
  max-width: 1460px;
  margin: 0 auto;
  padding: 64px 40px 84px;
}

.ranking-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  gap: 28px;
  align-items: end;
  margin-bottom: 22px;
}

.hero-kicker,
.panel-kicker {
  margin: 0 0 12px;
  color: #0ad840;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.ranking-hero h1 {
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  min-height: 108px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.065);
  padding: 18px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
}

.summary-card span {
  display: block;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
  font-weight: 700;
}

.summary-card strong {
  color: #fff;
  font-size: 28px;
  font-weight: 900;
}

.ranking-panel {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.065);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 22px 24px;
}

.panel-head h2 {
  margin: 0;
  color: #fff;
  font-size: 24px;
  font-weight: 900;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.segmented {
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.28);
  padding: 4px;
}

.segmented button,
.sort-button,
.icon-button {
  cursor: pointer;
  border: 0;
  border-radius: 6px;
  font-weight: 800;
}

.segmented button {
  min-width: 70px;
  height: 34px;
  background: transparent;
  color: rgba(255, 255, 255, 0.62);
  font-size: 13px;
}

.segmented button.active {
  background: #0ad840;
  color: #001a06;
}

.sort-button {
  height: 42px;
  border: 1px solid rgba(10, 216, 64, 0.36);
  background: rgba(10, 216, 64, 0.11);
  color: #9dffb3;
  padding: 0 14px;
  font-size: 13px;
}

.icon-button {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(10, 216, 64, 0.36);
  background: rgba(10, 216, 64, 0.11);
  color: #9dffb3;
}

.icon-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.spinning,
.spinner {
  animation: spin 0.9s linear infinite;
}

.state-box {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.62);
  padding: 36px;
  text-align: center;
}

.state-box strong {
  color: #fff;
  font-size: 18px;
}

.error-state strong {
  color: #f6c85f;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.18);
  border-top-color: #0ad840;
  border-radius: 50%;
}

.ranking-table-wrap {
  overflow-x: auto;
}

.ranking-table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
}

.ranking-table th {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.56);
  padding: 14px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 800;
}

.ranking-table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.78);
  padding: 15px 24px;
  font-size: 14px;
}

.ranking-table tbody tr:hover {
  background: rgba(10, 216, 64, 0.08);
}

.ranking-table small {
  display: block;
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.42);
  font-size: 11px;
}

.right {
  text-align: right;
}

.rank-badge {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.rank-first {
  background: #0ad840;
  color: #001a06;
}

.rank-second {
  background: #78a6ff;
  color: #031026;
}

.rank-third {
  background: #f6c85f;
  color: #1c1200;
}

.rank-normal {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.76);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
}

.user-avatar {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(10, 216, 64, 0.13);
  color: #9dffb3;
  font-size: 13px;
  font-weight: 900;
}

.share-cell {
  display: grid;
  min-width: 190px;
  grid-template-columns: minmax(120px, 1fr) 48px;
  align-items: center;
  gap: 10px;
}

.share-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

.share-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.share-fill.rank-normal {
  background: rgba(10, 216, 64, 0.52);
}

.spend-cell {
  color: #9dffb3;
  font-weight: 900;
}

.mobile-list {
  display: none;
}

.panel-foot {
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.52);
  padding: 14px 24px 18px;
  font-size: 12px;
}

:global(.public-style-light .ranking-hero h1){
  background: none;
  color: #101412;
  -webkit-text-fill-color: currentColor;
}

:global(.public-style-light .hero-copy),
:global(.public-style-light .summary-card span),
:global(.public-style-light .state-box),
:global(.public-style-light .ranking-table th),
:global(.public-style-light .ranking-table small),
:global(.public-style-light .panel-foot),
:global(.public-style-light .mobile-row-head span),
:global(.public-style-light .mobile-meta){
  color: #173824;
}

:global(.public-style-light .summary-card),
:global(.public-style-light .ranking-panel),
:global(.public-style-light .mobile-row){
  border-color: rgba(8, 91, 38, 0.3);
  background: linear-gradient(180deg, #ffffff 0%, #eef8f1 100%);
  box-shadow:
    0 18px 60px rgba(6, 58, 22, 0.16),
    inset 0 1px rgba(255, 255, 255, 0.9);
}

:global(.public-style-light .summary-card strong),
:global(.public-style-light .panel-head h2),
:global(.public-style-light .state-box strong),
:global(.public-style-light .ranking-table td),
:global(.public-style-light .mobile-row-head strong){
  color: #101412;
}

:global(.public-style-light .hero-kicker),
:global(.public-style-light .panel-kicker){
  color: #087b2f;
}

:global(.public-style-light .ranking-table td strong),
:global(.public-style-light .user-cell){
  color: #07140d;
}

:global(.public-style-light .panel-head),
:global(.public-style-light .ranking-table th),
:global(.public-style-light .ranking-table td),
:global(.public-style-light .panel-foot){
  border-color: rgba(8, 123, 47, 0.22);
}

:global(.public-style-light .panel-head){
  background: linear-gradient(180deg, #f0fbf2 0%, #ffffff 100%);
}

:global(.public-style-light .ranking-table th){
  background: #d9eee0;
  color: #0a2f17;
}

:global(.public-style-light .ranking-table td){
  background: rgba(255, 255, 255, 0.9);
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

:global(.public-style-light .sort-button),
:global(.public-style-light .icon-button){
  border-color: rgba(15, 127, 120, 0.32);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(230, 247, 244, 0.84));
  color: #0c514c;
  box-shadow: 0 10px 26px rgba(15, 127, 120, 0.1);
}

:global(.public-style-light .ranking-table tbody tr:hover){
  background: #cfe9d8;
}

:global(.public-style-light .ranking-table tbody tr:hover td){
  background: transparent;
}

:global(.public-style-light .rank-first){
  background: linear-gradient(180deg, #0a8f36, #066828);
  color: #fff;
}

:global(.public-style-light .rank-second){
  background: #58c7b1;
  color: #063a16;
}

:global(.public-style-light .rank-third){
  background: #f2c45a;
  color: #3f2800;
}

:global(.public-style-light .rank-normal){
  background: #c4e5cf;
  color: #063719;
}

:global(.public-style-light .user-avatar){
  border: 1px solid rgba(8, 91, 38, 0.34);
  background: #d1ead9;
  color: #053315;
}

:global(.public-style-light .share-track){
  background: rgba(8, 123, 47, 0.12);
}

:global(.public-style-light .share-fill.rank-normal){
  background: linear-gradient(90deg, #0a8f36, #0f7f78);
}

:global(.public-style-light .spend-cell){
  color: #056525;
}

:global(.public-style-light .spinner){
  border-color: rgba(8, 123, 47, 0.16);
  border-top-color: #0a8f36;
}

:global(.public-style-light .ranking-hero h1){
  color: #0f172a;
}

:global(.public-style-light .hero-copy),
:global(.public-style-light .summary-card span),
:global(.public-style-light .state-box),
:global(.public-style-light .ranking-table th),
:global(.public-style-light .ranking-table small),
:global(.public-style-light .panel-foot),
:global(.public-style-light .mobile-row-head span),
:global(.public-style-light .mobile-meta){
  color: #475569;
}

:global(.public-style-light .summary-card),
:global(.public-style-light .ranking-panel),
:global(.public-style-light .mobile-row){
  border-color: rgba(37, 99, 235, 0.16);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow:
    0 18px 60px rgba(15, 23, 42, 0.1),
    inset 0 1px rgba(255, 255, 255, 0.9);
}

:global(.public-style-light .summary-card strong),
:global(.public-style-light .panel-head h2),
:global(.public-style-light .state-box strong),
:global(.public-style-light .ranking-table td),
:global(.public-style-light .mobile-row-head strong),
:global(.public-style-light .ranking-table td strong),
:global(.public-style-light .user-cell){
  color: #0f172a;
}

:global(.public-style-light .hero-kicker),
:global(.public-style-light .panel-kicker){
  color: #2563eb;
}

:global(.public-style-light .panel-head),
:global(.public-style-light .ranking-table th),
:global(.public-style-light .ranking-table td),
:global(.public-style-light .panel-foot){
  border-color: rgba(37, 99, 235, 0.14);
}

:global(.public-style-light .panel-head),
:global(.public-style-light .ranking-table th){
  background: #eff6ff;
}

:global(.public-style-light .segmented){
  border-color: rgba(37, 99, 235, 0.18);
  background: rgba(255, 255, 255, 0.8);
}

:global(.public-style-light .segmented button){
  color: #334155;
}

:global(.public-style-light .segmented button.active),
:global(.public-style-light .rank-first){
  background: linear-gradient(180deg, #3b82f6, #1d4ed8);
  color: #fff;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.18);
}

:global(.public-style-light .sort-button),
:global(.public-style-light .icon-button){
  border-color: rgba(37, 99, 235, 0.22);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.86));
  color: #1d4ed8;
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.1);
}

:global(.public-style-light .ranking-table tbody tr:hover){
  background: #eef4ff;
}

:global(.public-style-light .rank-second){
  background: #dbeafe;
  color: #1e40af;
}

:global(.public-style-light .rank-third){
  background: #fde68a;
  color: #713f12;
}

:global(.public-style-light .rank-normal){
  background: #e2e8f0;
  color: #334155;
}

:global(.public-style-light .user-avatar){
  border-color: rgba(37, 99, 235, 0.18);
  background: #eff6ff;
  color: #1d4ed8;
}

:global(.public-style-light .share-track){
  background: rgba(37, 99, 235, 0.1);
}

:global(.public-style-light .share-fill.rank-normal){
  background: linear-gradient(90deg, #2563eb, #0ea5e9);
}

:global(.public-style-light .spend-cell){
  color: #1d4ed8;
}

:global(.public-style-light .spinner){
  border-color: rgba(37, 99, 235, 0.16);
  border-top-color: #2563eb;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .ranking-hero {
    grid-template-columns: 1fr;
  }

  .panel-head {
    align-items: stretch;
    flex-direction: column;
  }

  .controls {
    flex-wrap: wrap;
  }
}

@media (max-width: 720px) {
  .ranking-shell {
    padding: 42px 16px 64px;
  }

  .ranking-hero h1 {
    font-size: 40px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .segmented {
    width: 100%;
  }

  .segmented button {
    flex: 1;
  }

  .sort-button {
    flex: 1;
  }

  .ranking-table-wrap {
    display: none;
  }

  .mobile-list {
    display: grid;
    gap: 12px;
    padding: 16px;
  }

  .mobile-row {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.22);
    padding: 14px;
  }

  .mobile-row-head {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .mobile-row-head div {
    min-width: 0;
  }

  .mobile-row-head strong {
    display: block;
    color: #fff;
    font-size: 14px;
  }

  .mobile-row-head span {
    display: block;
    color: rgba(255, 255, 255, 0.58);
    font-size: 12px;
  }

  .mobile-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 9px;
    color: rgba(255, 255, 255, 0.58);
    font-size: 12px;
  }
}

:global(.public-style-light .mobile-row-head strong){
  color: #0f172a;
}

:global(.public-style-light .mobile-row-head span),
:global(.public-style-light .mobile-meta){
  color: #475569;
}
</style>
