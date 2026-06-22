import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import KeyUsageView from '../KeyUsageView.vue'

const {
  authState,
  appState,
  getMyOrders,
  getHistory,
  getStatus,
  draw,
  fetchPublicSettings,
  showSuccess,
  showError,
  showInfo,
  refreshUser,
} = vi.hoisted(() => ({
  authState: {
    isAuthenticated: false,
    isAdmin: false,
    refreshUser: vi.fn(),
  },
  appState: {
    cachedPublicSettings: {
      site_name: 'AllCanCode',
      site_subtitle: 'One key for AI',
      site_logo: '/logo.png',
    },
    siteName: 'AllCanCode',
    siteLogo: '/logo.png',
    publicSettingsLoaded: true,
  },
  getMyOrders: vi.fn(),
  getHistory: vi.fn(),
  getStatus: vi.fn(),
  draw: vi.fn(),
  fetchPublicSettings: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  refreshUser: vi.fn(),
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => ({
        'nav.home': 'Home',
        'nav.ranking': 'Ranking',
        'nav.monitor': 'Monitor',
        'nav.keyUsage': 'Lottery',
        'home.dashboard': 'Dashboard',
        'auth.signIn': 'Sign in',
      }[key] ?? key),
      locale: { value: 'zh-CN' },
    }),
  }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    ...authState,
    refreshUser,
  }),
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({
    ...appState,
    fetchPublicSettings,
    showSuccess,
    showError,
    showInfo,
  }),
}))

vi.mock('@/api/payment', () => ({
  paymentAPI: {
    getMyOrders,
  },
}))

vi.mock('@/api/redeem', () => ({
  default: {
    getHistory,
  },
}))

vi.mock('@/api/lottery', () => ({
  default: {
    getStatus,
    draw,
  },
}))

describe('KeyUsageView lottery activity', () => {
  beforeEach(() => {
    authState.isAuthenticated = false
    authState.isAdmin = false
    getMyOrders.mockReset()
    getHistory.mockReset()
    getStatus.mockReset()
    draw.mockReset()
    fetchPublicSettings.mockReset()
    showSuccess.mockReset()
    showError.mockReset()
    showInfo.mockReset()
    refreshUser.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows public lottery rules before login', () => {
    const wrapper = mount(KeyUsageView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          LocaleSwitcher: true,
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('充值满 $100')
    expect(text).toContain('$5 - $50')
    expect(text).toContain('中奖名单轮播')
    expect(text).toContain('登录后自动查询资格')
    expect(getMyOrders).not.toHaveBeenCalled()
    expect(getHistory).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('calculates eligibility from completed recharge and redeem records after login', async () => {
    authState.isAuthenticated = true
    getMyOrders.mockResolvedValue({
      data: {
        items: [
          {
            id: 1,
            user_id: 1,
            amount: 250,
            pay_amount: 250,
            fee_rate: 0,
            payment_type: 'stripe',
            out_trade_no: 'order-250',
            status: 'COMPLETED',
            order_type: 'balance',
            created_at: '2026-06-01T00:00:00Z',
            expires_at: '2026-06-01T01:00:00Z',
            completed_at: '2026-06-01T00:30:00Z',
            refund_amount: 0,
          },
          {
            id: 2,
            user_id: 1,
            amount: 100,
            pay_amount: 100,
            fee_rate: 0,
            payment_type: 'stripe',
            out_trade_no: 'sub-100',
            status: 'COMPLETED',
            order_type: 'subscription',
            created_at: '2026-06-02T00:00:00Z',
            expires_at: '2026-06-02T01:00:00Z',
            completed_at: '2026-06-02T00:30:00Z',
            refund_amount: 0,
          },
        ],
      },
    })
    getHistory.mockResolvedValue([
      {
        id: 1,
        code: 'LOTTERY-REWARD-001',
        type: 'balance',
        value: 10,
        status: 'used',
        used_at: '2026-06-03T00:00:00Z',
        created_at: '2026-06-03T00:00:00Z',
      },
      {
        id: 2,
        code: 'BALANCE-100',
        type: 'balance',
        value: 100,
        status: 'used',
        used_at: '2026-06-04T00:00:00Z',
        created_at: '2026-06-04T00:00:00Z',
      },
    ])
    getStatus.mockRejectedValue(new Error('status endpoint unavailable'))

    const wrapper = mount(KeyUsageView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          LocaleSwitcher: true,
        },
      },
    })

    await flushPromises()
    await nextTick()

    expect(getMyOrders).toHaveBeenCalledWith({ page: 1, page_size: 100, status: 'COMPLETED' })
    expect(getHistory).toHaveBeenCalled()

    const text = wrapper.text()
    expect(text).toContain('$350.00')
    expect(text).toContain('已有抽奖资格')
    expect(text).toContain('2 次')
    expect(text).toContain('order-250')
    expect(text).toContain('BALA...-100')

    wrapper.unmount()
  })

  it('shows a friendly message when the draw chance has already been used', async () => {
    authState.isAuthenticated = true
    getMyOrders.mockResolvedValue({ data: { items: [] } })
    getHistory.mockResolvedValue([
      {
        id: 1,
        code: 'LOTTERY-3-USED',
        type: 'balance',
        value: 21,
        status: 'used',
        used_at: '2026-06-20T07:34:00Z',
        created_at: '2026-06-20T07:34:00Z',
      },
    ])
    getStatus.mockResolvedValue({
      data: {
        threshold: 100,
        min_prize: 5,
        max_prize: 50,
        qualifying_amount: 100,
        qualifying_payment_amount: 0,
        qualifying_redeem_amount: 100,
        total_chances: 1,
        used_chances: 0,
        available_chances: 1,
        reward_amount: 21,
      },
    })
    draw.mockResolvedValue({
      data: {
        state: 'no_chance',
        message: 'No lottery chance available.',
        status: {
          threshold: 100,
          min_prize: 5,
          max_prize: 50,
          qualifying_amount: 100,
          qualifying_payment_amount: 0,
          qualifying_redeem_amount: 100,
          total_chances: 1,
          used_chances: 1,
          available_chances: 0,
          reward_amount: 21,
        },
      },
    })

    const wrapper = mount(KeyUsageView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          LocaleSwitcher: true,
        },
      },
    })

    await flushPromises()
    await nextTick()

    await wrapper.find('.draw-button').trigger('click')
    await flushPromises()
    await nextTick()

    expect(showInfo).toHaveBeenCalledWith('暂无可用抽奖机会')
    expect(showError).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('本次资格可能已经使用')

    wrapper.unmount()
  })
})
