import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountSettingsView from '../../src/views/AccountSettingsView.vue'
import router from '../../src/router'
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';

describe('AccountSettingsView', () => {
  test('The view is rendered properly', async () => {
    expect(AccountSettingsView).toBeTruthy();

    const wrapper = mount(AccountSettingsView, {
      plugins: [PrimeVue, router],
      components: [Card],
      shallow: true
    })
    console.log(wrapper.html())
    expect(wrapper.exists()).toBe(true)
  })
})
