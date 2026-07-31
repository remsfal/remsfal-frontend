import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
beforeAll(() => {
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

import CommercialDataCard from '@/features/project/rentableUnits/components/CommercialDataCard.vue';
import { commercialService, type CommercialJson } from '@/features/project/rentableUnits/services/CommercialService';

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: vi.fn() }) }));

const mockCommercialService = vi.hoisted(() => ({ getCommercial: vi.fn(), updateCommercial: vi.fn() }));
vi.mock('@/features/project/rentableUnits/services/CommercialService', () => ({ commercialService: mockCommercialService }));

describe('repro', () => {
  beforeEach(() => vi.clearAllMocks());

  it('heatingSpace null, netFloorArea null -> checkbox should be unchecked', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      title: 'Test', description: '', location: '',
      netFloorArea: null, usableFloorArea: null, technicalServicesArea: null, trafficArea: null,
      heatingSpace: null,
    } as unknown as CommercialJson);

    const wrapper = mount(CommercialDataCard, { props: { projectId: 'p1', unitId: 'u1' } });
    await flushPromises();
    expect((wrapper.find('input#heatingSpaceMatchesArea').element as HTMLInputElement).checked).toBe(false);
  });

  it('heatingSpace undefined (not set), netFloorArea 200 -> checkbox should be unchecked', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      title: 'Test', description: '', location: '',
      netFloorArea: 200, usableFloorArea: null, technicalServicesArea: null, trafficArea: null,
    } as unknown as CommercialJson);

    const wrapper = mount(CommercialDataCard, { props: { projectId: 'p1', unitId: 'u1' } });
    await flushPromises();
    expect((wrapper.find('input#heatingSpaceMatchesArea').element as HTMLInputElement).checked).toBe(false);
  });

  it('heatingSpace undefined, netFloorArea undefined -> checkbox should be unchecked', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      title: 'Test', description: '', location: '',
    } as unknown as CommercialJson);

    const wrapper = mount(CommercialDataCard, { props: { projectId: 'p1', unitId: 'u1' } });
    await flushPromises();
    expect((wrapper.find('input#heatingSpaceMatchesArea').element as HTMLInputElement).checked).toBe(false);
  });
});
