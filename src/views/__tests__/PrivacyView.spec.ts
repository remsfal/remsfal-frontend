import { describe, test, expect } from 'vitest'
import PrimeVue from 'primevue/config';
import router from '../../router'
import Card from 'primevue/card';

import { shallowMount, mount } from '@vue/test-utils'
import PrivacyView from '../PrivacyView.vue'

describe('PrivacyView', () => {
  test('The view is rendered properly', async () => {
    expect(PrivacyView).toBeTruthy();

    const wrapper = mount(PrivacyView, {
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
    const privacyCardTitle = wrapper.findComponent('.p-card-title')
    expect(wrapper.exists()).toBe(true)
    //expect(wrapper.html()).toContain('Datenschutzerklärung')
  })
})
