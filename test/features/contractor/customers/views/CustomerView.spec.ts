import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import CustomerView from '@/features/contractor/customers/views/CustomerView.vue';

describe('CustomerView.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(CustomerView);
  });

  it('renders the view correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h5').text()).toBe('Übersicht aller Auftraggeber');
  });

  it('shows a not-yet-available placeholder instead of a customer table', () => {
    expect(wrapper.text()).toContain('Die Auftraggeberübersicht ist noch nicht verfügbar.');
  });
});
