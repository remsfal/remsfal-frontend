import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OrganizationBenefitsCard from '@/features/common/organizations/components/OrganizationBenefitsCard.vue';

describe('OrganizationBenefitsCard', () => {
  const mountCard = () =>
    mount(OrganizationBenefitsCard, {
      global: {
        stubs: { NewOrganizationDialog: true, BaseCard: false },
      },
    });

  it('renders the card title for organizations', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Organisationen');
  });

  it('renders the subtitle text', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Organisation');
  });

  it('renders both benefit feature items', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Zentrale Benutzerverwaltung');
    expect(wrapper.text()).toContain('Hausverwaltungen');
  });

  it('renders the create button', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Organisation anlegen');
  });

  it('renders the NewOrganizationDialog stub', () => {
    const wrapper = mountCard();
    expect(wrapper.findComponent({ name: 'NewOrganizationDialog' }).exists()).toBe(true);
  });

  it('passes visible=false to dialog initially', () => {
    const wrapper = mountCard();
    const dialog = wrapper.findComponent({ name: 'NewOrganizationDialog' });
    expect(dialog.props('visible')).toBe(false);
  });
});
