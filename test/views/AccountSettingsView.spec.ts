import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountSettingsView from '../../src/views/AccountSettingsView.vue';
import router from '../../src/router';
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from '../../src/App.vue'

describe('AccountSettingsView', () => {
  test('The view is rendered properly', async () => {
    const pinia = createPinia()
    const app = createApp(App)
    // Install Pinia
    app.use(pinia)
    const wrapper = mount(AccountSettingsView, {
      plugins: [PrimeVue, router],
      components: [Card],
      shallow: true
    })
    console.log(wrapper.html())
    expect(wrapper.exists()).toBe(true)
  })
})
