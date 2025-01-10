import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import BuildingUpdateView from "../../src/views/BuildingUpdateView.vue";
import ReusableFormComponent from "../../src/components/ReusableFormComponent.vue";
import axios from 'axios';
import PrimeVue from 'primevue/config';
import { createRouter, createMemoryHistory, RouteRecordRaw } from 'vue-router';

// Mock Axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Simulated Routes
const routes: RouteRecordRaw[] = [
  {
    path: '/project/:projectId/commercial/:commercialId/buildings/:buildingId',
    name: 'BuildingUpdate',
    component: { template: '<div>Building Update</div>' },
  },
  {
    path: '/project/:projectId/commercial/:commercialId',
    name: 'PropertyDetails',
    component: { template: '<div>Property Details</div>' },
  },
];

// Router Setup
const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

describe('BuildingUpdateView.vue', () => {
  beforeEach(async () => {
    await router.push('/project/123/commercial/456/buildings/789');
    await router.isReady();
  });

  it('fetches and renders the building data', async () => {
    const buildingData = {
      title: 'Test Building',
      addressId: '12345',
      description: 'Test Description',
      commercialSpace: '100',
      usableSpace: '200',
      heatingSpace: '300',
      rent: '1500',
    };
    mockedAxios.get.mockResolvedValueOnce({ data: buildingData });

    const wrapper = mount(BuildingUpdateView, {
      global: {
        plugins: [router, PrimeVue],
        components: { ReusableFormComponent },
      },
    });

    await flushPromises();

    const formProps = wrapper.findComponent(ReusableFormComponent).props('initialValues');
    expect(mockedAxios.get).toHaveBeenCalledWith('/project/123/commercial/456/buildings/789');
    expect(formProps).toEqual(buildingData);
  });

  it('calls the service to update the building on submit', async () => {
    const updatedData = {
      title: 'Updated Building',
      addressId: '54321',
      description: 'Updated Description',
      commercialSpace: '150',
      usableSpace: '250',
      heatingSpace: '350',
      rent: '2000',
    };
    mockedAxios.patch.mockResolvedValueOnce({ status: 200 });
    const pushMock = vi.spyOn(router, 'push');

    const wrapper = mount(BuildingUpdateView, {
      global: {
        plugins: [router, PrimeVue],
        components: { ReusableFormComponent },
      },
    });

    await flushPromises();

    wrapper.findComponent(ReusableFormComponent).vm.$emit('submit', updatedData);
    await flushPromises();

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      '/project/123/commercial/456/buildings/789',
      updatedData
    );
    expect(pushMock).toHaveBeenCalledWith('/project/123/commercial/456');
  });
});
