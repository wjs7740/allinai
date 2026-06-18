import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'

const setLocaleMock = vi.hoisted(() => vi.fn())
const localeRef = vi.hoisted(() => ({ value: 'en' }))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: localeRef,
  }),
}))

vi.mock('@/i18n', () => ({
  setLocale: setLocaleMock,
  availableLocales: [
    { code: 'en', name: 'English', flag: 'US' },
    { code: 'zh', name: '中文', flag: 'CN' },
  ],
}))

vi.mock('@/components/icons/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span data-testid="icon"></span>',
  },
}))

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    setLocaleMock.mockReset()
    localeRef.value = 'en'
    document.body.innerHTML = ''
  })

  it('opens the language menu and selects another locale', async () => {
    const wrapper = mount(LocaleSwitcher, {
      attachTo: document.body,
    })

    await wrapper.find('button').trigger('click')

    expect(document.body.textContent).toContain('English')
    expect(document.body.textContent).toContain('中文')

    const zhButton = Array.from(document.body.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('中文')
    )
    expect(zhButton).toBeTruthy()
    zhButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(setLocaleMock).toHaveBeenCalledWith('zh')

    wrapper.unmount()
  })
})
