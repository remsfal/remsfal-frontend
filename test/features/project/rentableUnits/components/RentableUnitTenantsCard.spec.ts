import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RentableUnitTenantsCard from '@/features/project/rentableUnits/components/RentableUnitTenantsCard.vue';

const defaultProps = { projectId: 'project-1', unitId: 'unit-1' };

describe('RentableUnitTenantsCard.vue', () => {
  it('renders without error', () => {
    const wrapper = mount(RentableUnitTenantsCard, { props: defaultProps });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows card title "Mieter"', () => {
    const wrapper = mount(RentableUnitTenantsCard, { props: defaultProps });
    expect(wrapper.text()).toContain('Mieter');
  });

  it('displays current tenant Lena Schneider', () => {
    const wrapper = mount(RentableUnitTenantsCard, { props: defaultProps });
    expect(wrapper.text()).toContain('Lena');
    expect(wrapper.text()).toContain('Schneider');
  });

  it('does not show former tenants by default', () => {
    const wrapper = mount(RentableUnitTenantsCard, { props: defaultProps });
    expect(wrapper.text()).not.toContain('Tobias');
    expect(wrapper.text()).not.toContain('Keller');
  });

  it('shows "Ehemalige Mieter anzeigen" toggle button by default', () => {
    const wrapper = mount(RentableUnitTenantsCard, { props: defaultProps });
    expect(wrapper.text()).toContain('Ehemalige Mieter anzeigen');
  });

  it('shows former tenants after clicking toggle button', async () => {
    const wrapper = mount(RentableUnitTenantsCard, { props: defaultProps });

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Tobias');
    expect(wrapper.text()).toContain('Keller');
    expect(wrapper.text()).toContain('Miriam');
    expect(wrapper.text()).toContain('Fischer');
  });

  it('shows "Ehemalige Mieter ausblenden" label when former tenants are visible', async () => {
    const wrapper = mount(RentableUnitTenantsCard, { props: defaultProps });

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Ehemalige Mieter ausblenden');
  });

  it('hides former tenants after clicking toggle button twice', async () => {
    const wrapper = mount(RentableUnitTenantsCard, { props: defaultProps });

    await wrapper.find('button').trigger('click');
    await flushPromises();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.text()).not.toContain('Tobias');
  });
});
