import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OrderTable from '@/features/project/issues/components/OrderTable.vue';

describe('OrderTable', () => {
  it('renders the placeholder message', () => {
    const wrapper = mount(OrderTable);
    expect(wrapper.text()).toContain('Diese Ansicht wird in einem zukünftigen Update verfügbar sein.');
  });
});
