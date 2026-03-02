import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppFooter from '@/layout/AppFooter.vue';

describe('AppFooter.vue', () => {
  const mountFooter = () => mount(AppFooter);

  it('renders a footer element', () => {
    const wrapper = mountFooter();
    expect(wrapper.find('footer').exists()).toBe(true);
  });

  it('renders the logo image', () => {
    const wrapper = mountFooter();
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('Logo');
  });

  it('has layout-footer class', () => {
    const wrapper = mountFooter();
    expect(wrapper.find('.layout-footer').exists()).toBe(true);
  });

  it('renders the legal notice link text', () => {
    const wrapper = mountFooter();
    expect(wrapper.text()).toContain('Impressum');
  });

  it('renders the privacy link text', () => {
    const wrapper = mountFooter();
    expect(wrapper.text()).toContain('Datenschutzerklärung');
  });

  it('renders two router links', () => {
    const wrapper = mountFooter();
    const links = wrapper.findAll('a');
    expect(links.length).toBe(2);
  });
});
