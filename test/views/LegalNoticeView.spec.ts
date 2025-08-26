import { describe, it, expect, vi } from 'vitest';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import LegalNoticeView from '../../src/views/LegalNoticeView.vue';

describe('LegalNoticeView.vue', () => {
  let wrapper: VueWrapper;

  it('renders the legal notice', () => {
    wrapper = mount(LegalNoticeView, {
      global: {
        stubs: {
          Card: {
            template: `
              <div class="p-card">
                <div class="p-card-title"><slot name="title" /></div>
                <div class="p-card-content"><slot name="content" /></div>
              </div>
            `,
          },
          Button: true,
        },
      },
    });

    wrapper.vm.$router.isReady().then(() => {
      expect(wrapper.text()).toContain('Impressum');
    });
  });

  it('navigates to home when the home button is clicked', async () => {
    wrapper = mount(LegalNoticeView, {
      global: {
        stubs: {
          Card: {
            template: `
              <div class="p-card">
                <div class="p-card-title"><slot name="title" /></div>
                <div class="p-card-content"><slot name="content" /></div>
              </div>
            `,
          },
          Button: {
            template: '<button class="p-button"><slot /></button>',
          },
        },
      },
    });
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.p-button').trigger('click');

    expect(pushSpy).toHaveBeenCalledWith('/');
  });
});
