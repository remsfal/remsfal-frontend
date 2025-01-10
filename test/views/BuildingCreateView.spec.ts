import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import BuildingCreateView from "../../src/views/BuildingCreateView.vue";
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
    path: '/project/:projectId/commercial/:commercialId',
    name: 'PropertyDetails',
    component: { template: '<div>Property Details</div>' },
  },
];

// Mock Router
const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

describe('BuildingCreateView.vue', () => {
  beforeEach(async () => {
    await router.push('/project/123/commercial/456');
    await router.isReady();
  });

  it('renders the form with the correct fields', () => {
    const wrapper = mount(BuildingCreateView, {
      global: {
        plugins: [router, PrimeVue],
        components: { ReusableFormComponent },
      },
    });

    const formFields = wrapper.findComponent(ReusableFormComponent).props('fields');
    expect(formFields).toHaveLength(7);
    expect(formFields.map((field: any) => field.name)).toEqual([
      'title',
      'addressId',
      'description',
      'commercialSpace',
      'usableSpace',
      'heatingSpace',
      'rent',
    ]);
  });

  it('calls the service to create a building on submit', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });
    const pushMock = vi.spyOn(router, 'push');

    const wrapper = mount(BuildingCreateView, {
      global: {
        plugins: [router, PrimeVue],
        components: { ReusableFormComponent },
      },
    });

    const formData = {
      title: 'New Building',
      addressId: '12345',
      description: 'A test building',
      commercialSpace: '100',
      usableSpace: '200',
      heatingSpace: '300',
      rent: '1500',
    };

    wrapper.findComponent(ReusableFormComponent).vm.$emit('submit', formData);
    await flushPromises();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/project/123/commercial/456/buildings',
      formData
    );
    expect(pushMock).toHaveBeenCalledWith('/project/123/commercial/456');
  });

  it('shows an error message if the service call fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
    window.alert = vi.fn();

    const wrapper = mount(BuildingCreateView, {
      global: {
        plugins: [router, PrimeVue],
        components: { ReusableFormComponent },
      },
    });

    const formData = {
      title: 'New Building',
      addressId: '12345',
      description: 'A test building',
      commercialSpace: '100',
      usableSpace: '200',
      heatingSpace: '300',
      rent: '1500',
    };

    wrapper.findComponent(ReusableFormComponent).vm.$emit('submit', formData);
    await flushPromises();

    expect(mockedAxios.post).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Failed to create building. Please try again.');
  });
});
