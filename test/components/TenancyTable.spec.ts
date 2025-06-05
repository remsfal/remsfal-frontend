import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TenancyTable from '@/components/TenancyTable.vue'
import { nextTick } from 'vue'

describe('TenancyTable.vue', () => {
  it('shows form when "Mangel melden" is clicked', async () => {
    const wrapper = mount(TenancyTable)

    // Click the "Mangel melden" button
    const createBtn = wrapper.findAll('button').find(b => b.text().includes('Mangel melden'))
    expect(createBtn).toBeTruthy()
    if (createBtn) {
      await createBtn.trigger('click')
      await nextTick() // wait for DOM update
    }

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
  })

  it('creates a new deficiency and displays it', async () => {
    const wrapper = mount(TenancyTable)

    // Show form
    const createBtn = wrapper.findAll('button').find(b => b.text().includes('Mangel melden'))
    if (createBtn) {
      await createBtn.trigger('click')
      await nextTick()
    }

    // Fill in the form
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    await input.setValue('Test Mangel')

    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)
    await select.setValue('Offen')

    // Submit the form
    const saveBtn = wrapper.findAll('button').find(b => b.text().includes('Speichern'))
    expect(saveBtn).toBeTruthy()
    if (saveBtn) await saveBtn.trigger('click')
    await nextTick()

    // Verify new entry appears
    expect(wrapper.text()).toContain('Test Mangel')
  })
})
