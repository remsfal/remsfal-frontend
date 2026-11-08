import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Message from 'primevue/message';
import OrderBillingCard from '@/features/contractor/orderManagement/components/OrderBillingCard.vue';

describe('OrderBillingCard.vue', () => {
  it('renders the title and a not-available notice', () => {
    const wrapper = mount(OrderBillingCard);
    expect(wrapper.text()).toContain('Auftragsabrechnung');

    const message = wrapper.findComponent(Message);
    expect(message.exists()).toBe(true);
    expect(message.props('severity')).toBe('info');
    expect(message.text()).toBe('Noch nicht verfügbar');
  });
});
