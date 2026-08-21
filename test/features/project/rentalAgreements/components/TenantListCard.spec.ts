import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import TenantListCard from '@/features/project/rentalAgreements/components/TenantListCard.vue';
import { tenantService, type TenantItemJson } from '@/features/project/rentalAgreements/services/TenantService';

const mockTenants: TenantItemJson[] = [
  {
    id: 't-1', firstName: 'Anna', lastName: 'Müller', active: true 
  },
  {
    id: 't-2', firstName: 'Ben', lastName: 'Schmidt', active: false 
  },
];

const pushMock = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual, useRouter: () => ({ push: pushMock }) };
});

describe('TenantListCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(tenantService, 'fetchTenants').mockResolvedValue(mockTenants);
  });

  const mountCard = (projectId = 'proj-1') =>
    mount(TenantListCard, { props: { projectId } });

  it('calls fetchTenants with projectId on mount', async () => {
    mountCard();
    await flushPromises();
    expect(tenantService.fetchTenants).toHaveBeenCalledWith('proj-1');
  });

  it('renders the card title', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain(wrapper.vm.$t('tenantList.title'));
  });

  it('does not render the tenant list while loading', async () => {
    let resolveFetch!: (value: TenantItemJson[]) => void;
    vi.spyOn(tenantService, 'fetchTenants').mockImplementationOnce(
      () => new Promise<TenantItemJson[]>((resolve) => { resolveFetch = resolve; }),
    );

    const wrapper = mountCard();
    await nextTick();

    expect(wrapper.text()).not.toContain('Müller');
    expect(wrapper.findComponent({ name: 'TenantToolbar' }).exists()).toBe(false);

    resolveFetch(mockTenants);
    await flushPromises();

    expect(wrapper.text()).toContain('Müller');
  });

  it('renders tenants after loading', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Anna Müller');
    expect(wrapper.text()).toContain('Ben Schmidt');
  });

  it('shows the "no tenants" empty state when there are none', async () => {
    vi.spyOn(tenantService, 'fetchTenants').mockResolvedValue([]);
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain(wrapper.vm.$t('tenantList.empty.noAgreements'));
  });

  it('shows the "no results" empty state when filters exclude all tenants', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('doesnotexist');
    await flushPromises();

    expect(wrapper.text()).toContain(wrapper.vm.$t('tenantList.empty.noResults'));
  });

  it('filters tenants by last name search', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('müller');
    await flushPromises();

    expect(wrapper.text()).toContain('Anna Müller');
    expect(wrapper.text()).not.toContain('Ben Schmidt');
  });

  it('navigates to TenantDetail when a tenant is clicked', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const tenantCard = wrapper.findComponent({ name: 'TenantCard' });
    await tenantCard.trigger('click');

    expect(pushMock).toHaveBeenCalledWith({
      name: 'TenantDetail',
      params: { projectId: 'proj-1', tenantId: 't-1' },
    });
  });
});
