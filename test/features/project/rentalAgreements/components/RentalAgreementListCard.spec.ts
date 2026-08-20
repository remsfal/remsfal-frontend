import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import DataTable from 'primevue/datatable';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RentalAgreementListCard from '@/features/project/rentalAgreements/components/RentalAgreementListCard.vue';
import {rentalAgreementService,
  type RentalAgreementItemJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import type { UnitType } from '@/features/project/rentableUnits';

// Fix for "window is not defined" error
if (typeof window === 'undefined') (global as Record<string, unknown>).window = {};

// ---- Router Mock ----
const routerPushMock = vi.fn();
vi.mock('vue-router', () => ({useRouter: () => ({ push: routerPushMock }),}));

describe('RentalAgreementListCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof RentalAgreementListCard>>;

  const mockTenants = [
    {
      id: '1', firstName: 'John', lastName: 'Doe'
    },
  ];
  const mockRentalAgreements = [
    {
      id: 'agreement-1',
      startOfRental: '2023-01-01',
      endOfRental: '2024-01-01',
      tenants: mockTenants,
      rentalUnits: [
        { id: 'unit-101', title: 'Apartment 1A' }
      ],
      currentRents: [
        {
          rentalUnitId: 'unit-101', basicRent: 500, operatingCostsPrepayment: 100, heatingCostsPrepayment: 50 
        }
      ],
    },
  ];

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const mockGroupingAgreements: RentalAgreementItemJson[] = [
    {
      id: 'former-older', startOfRental: '2020-01-01', endOfRental: '2021-01-01', tenants: [], rentalUnits: [] 
    },
    {
      id: 'former-newer', startOfRental: '2022-01-01', endOfRental: '2023-01-01', tenants: [], rentalUnits: [] 
    },
    {
      id: 'current-open-ended', startOfRental: '2024-01-01', tenants: [], rentalUnits: [] 
    },
    {
      id: 'current-future-end',
      startOfRental: '2023-06-01',
      endOfRental: futureDate.toISOString().slice(0, 10),
      tenants: [],
      rentalUnits: [],
    },
  ];

  const mountCard = (props: { projectId?: string; rentalUnitId?: string; rentalUnitType?: UnitType } = {}) =>
    mount(RentalAgreementListCard, {
      props: { projectId: 'proj-1', ...props },
      global: { stubs: { NewRentalAgreementDialog: true } },
    });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(rentalAgreementService, 'getRentalAgreements').mockResolvedValue(mockRentalAgreements);

    wrapper = mountCard();

    // Wait for onMounted fetch
    await flushPromises();
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('does not render DataTable while loading', async () => {
    let resolveFetch!: (value: RentalAgreementItemJson[]) => void;
    vi.spyOn(rentalAgreementService, 'getRentalAgreements').mockImplementationOnce(
      () => new Promise<RentalAgreementItemJson[]>((resolve) => { resolveFetch = resolve; }),
    );

    const loadingWrapper = mountCard();

    expect(loadingWrapper.findComponent(DataTable).exists()).toBe(false);

    resolveFetch(mockRentalAgreements);
    await flushPromises();

    expect(loadingWrapper.findComponent(DataTable).exists()).toBe(true);
  });

  it('navigates to rental agreement details on row click', async () => {
    const dataTable = wrapper.findComponent(DataTable);
    expect(dataTable.exists()).toBe(true);

    await dataTable.vm.$emit('rowClick', { data: { id: 'agreement-2' } });

    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'RentalAgreementDetails',
      params: { projectId: 'proj-1', agreementId: 'agreement-2' }
    });
  });

  it('renders tenant names correctly in DataTable', () => {
    const tenantText = wrapper.html();
    expect(tenantText).toContain('John Doe');
  });

  it('renders the translated card title', () => {
    expect(wrapper.text()).toContain(wrapper.vm.$t('projectTenancies.title'));
  });

  it('renders unit information in the table', () => {
    const html = wrapper.html();
    expect(html).toContain('Apartment 1A');
  });

  it('renders the current rent amounts matched by rentalUnitId in the table', () => {
    const html = wrapper.html();
    expect(html).toContain('500,00');
    expect(html).toContain('100,00');
    expect(html).toContain('50,00');
  });

  it('passes projectId to NewRentalAgreementDialog', () => {
    const dialog = wrapper.findComponent({ name: 'NewRentalAgreementDialog' });
    expect(dialog.exists()).toBe(true);
    expect(dialog.props('projectId')).toBe('proj-1');
  });

  it('re-fetches rental agreements when NewRentalAgreementDialog emits rentalAgreementCreated', async () => {
    const spy = vi.spyOn(rentalAgreementService, 'getRentalAgreements').mockResolvedValue([]);
    const dialog = wrapper.findComponent({ name: 'NewRentalAgreementDialog' });
    await dialog.vm.$emit('rentalAgreementCreated');
    await flushPromises();

    expect(spy).toHaveBeenCalled();
  });

  it('forwards rentalUnitId and rentalUnitType props to the service call', async () => {
    const spy = vi.spyOn(rentalAgreementService, 'getRentalAgreements').mockResolvedValue([]);
    mountCard({ rentalUnitId: 'unit-1', rentalUnitType: 'SITE' });
    await flushPromises();

    expect(spy).toHaveBeenCalledWith('proj-1', { rentalUnitId: 'unit-1', rentalUnitType: 'SITE' });
  });

  it('groups agreements into current/former subheaders, sorted by startOfRental desc', async () => {
    vi.spyOn(rentalAgreementService, 'getRentalAgreements').mockResolvedValue(mockGroupingAgreements);
    const groupedWrapper = mountCard();
    await flushPromises();

    const currentLabel = groupedWrapper.vm.$t('projectTenancies.group.current');
    const formerLabel = groupedWrapper.vm.$t('projectTenancies.group.former');
    const html = groupedWrapper.html();

    expect(html).toContain(currentLabel);
    expect(html).toContain(formerLabel);
    expect(html.indexOf(currentLabel)).toBeLessThan(html.indexOf(formerLabel));
  });
});
