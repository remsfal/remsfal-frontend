import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import BuildingCreateView from "../../src/views/BuildingCreateView.vue";
import ReusableFormComponent from "../../src/components/ReusableFormComponent.vue";
import axios from 'axios';
import PrimeVue from 'primevue/config'; // PrimeVue für Tests initialisieren
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { createRouter, createMemoryHistory, RouteRecordRaw } from 'vue-router';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Simulierte Routen
const routes: RouteRecordRaw[] = [
    {
        path: '/project/:projectId/commercial/:commercialId',
        name: 'PropertyDetails',
        component: { template: '<div>Property Details</div>' },
    },
];

// Mock-Router
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
                components: { ReusableFormComponent, InputText, Button },
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
                components: { ReusableFormComponent, InputText, Button },
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

    it('shows an error message if service call fails', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
        window.alert = vi.fn();

        const wrapper = mount(BuildingCreateView, {
            global: {
                plugins: [router, PrimeVue],
                components: { ReusableFormComponent, InputText, Button },
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
it('sends the correct payload to the API when creating a building', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 201, data: { id: 'mock-building-id' } });

    const wrapper = mount(BuildingCreateView, {
        global: {
            plugins: [router, PrimeVue],
            components: { ReusableFormComponent, InputText, Button },
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
        livingSpace: '150', // Optional, falls benötigt
        differentHeatingSpace: true,
    };

    // Erwartete Datenstruktur für die API
    const expectedPayload = {
        title: 'New Building',
        addressId: '12345',
        description: 'A test building',
        commercialSpace: '100', // String
        usableSpace: '200',     // String
        heatingSpace: '300',    // String
        rent: '1500',           // String
        livingSpace: '150',     // String
        differentHeatingSpace: true,
    };

    // Simuliere das Absenden des Formulars
    wrapper.findComponent(ReusableFormComponent).vm.$emit('submit', formData);
    await flushPromises();

    // Überprüfung des API-Aufrufs mit den korrekten Daten
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/project/123/commercial/456/buildings',
      expectedPayload
    );
});
