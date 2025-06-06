import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TenancyTable from '@/components/TenancyTable.vue'
import { nextTick } from 'vue'

describe('TenancyTable.vue', () => {
  it('shows form when "Mangel melden" button is clicked', async () => {
    const wrapper = mount(TenancyTable)

    // Find and click the "Mangel melden" button (PrimeVue Button)
    const createBtn = wrapper.findComponent({ name: 'Button' })
    expect(createBtn.exists()).toBe(true)
    await createBtn.trigger('click')
    await nextTick()

    // Check that Dialog is now visible and input exists
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
  })

  it('creates a new deficiency and displays it', async () => {
    const wrapper = mount(TenancyTable)

    // Click "Mangel melden" to show dialog
    const createBtn = wrapper.findComponent({ name: 'Button' })
    await createBtn.trigger('click')
    await nextTick()

    // Enter description
    const input = wrapper.find('input')
    await input.setValue('Neuer Test-Mangel')

    // Submit form using second button (footer of Dialog)
    const buttons = wrapper.findAllComponents({ name: 'Button' })
    const submitButton = buttons.find(b => b.text().includes('Melden'))
    expect(submitButton).toBeTruthy()
    if (submitButton) {
      await submitButton.trigger('click')
    }

    await nextTick()

    // Confirm it's rendered in the table
    expect(wrapper.html()).toContain('Neuer Test-Mangel')
  })
})
