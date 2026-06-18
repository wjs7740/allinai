import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import KeyUsageView from '../KeyUsageView.vue'

const { authState, appState, getMyOrders, getHistory, fetchPublicSettings } = vi.hoisted(() => ({
  authState: {
    isAuthenticated: false,
    isAdmin: false,
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
  fetchPublicSettings: vi.fn(),
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
  useAuthStore: () => authState,
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({
    ...appState,
    fetchPublicSettings,
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

describe('KeyUsageView lottery activity', () => {
  beforeEach(() => {
    authState.isAuthenticated = false
    authState.isAdmin = false
    getMyOrders.mockReset()
    getHistory.mockReset()
    fetchPublicSettings.mockReset()
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
    ])

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
    expect(text).toContain('$250.00')
    expect(text).toContain('已有抽奖资格')
    expect(text).toContain('1 次')
    expect(text).toContain('order-250')
    expect(text).toContain('LOTT...-001')

    wrapper.unmount()
  })
})
