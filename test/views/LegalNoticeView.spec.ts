// tests/views/LegalNoticeView.spec.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LegalNoticeView from '@/views/LegalNoticeView.vue';


describe('LegalNoticeView.vue', () => {

  // Define a test case that checks if the legal notice text is rendered
  it('renders the legal notice', () => {
    const wrapper = mount(LegalNoticeView);

    // Assert that the rendered text contains the word "Impressum" which verifies that the legal notice is displayed
    expect(wrapper.text()).toContain('Impressum');
  });
});