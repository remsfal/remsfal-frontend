import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountSettingsView from '@/views/AccountSettingsView.vue'
import router from '@/router'
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';

describe('AccountSettingsView', () => {
  test('The view is rendered properly', async () => {
    expect(AccountSettingsView).toBeTruthy();

    const wrapper = mount(AccountSettingsView, {
      plugins: [PrimeVue, router],
      components: [Card],
      shallow: true
//      global: {
//        stubs: {
//          Card: true,
//          BaseLayout: true
//        }
//      }
    })
    console.log(wrapper.html())
//    const wrapper = shallowMount(PrivacyView);
    expect(wrapper.text()).toContain('This is ä account settings page')
    const privacyCardTitle = wrapper.findComponent('.p-card-title')
    expect(wrapper.exists()).toBe(true)
    //expect(wrapper.html()).toContain('Datenschutzerklärung')
  })
})
