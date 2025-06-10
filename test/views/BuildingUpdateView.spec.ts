// test/views/ApartmentUpdateView.spec.ts

import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApartmentUpdateView from '../../src/views/ApartmentUpdateView.vue';
import axios from 'axios';

// Router-Mock
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// i18n-Mock
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key: string) => key,
    }),
}));

// Axios-Mock
vi.mock('axios');

describe('ApartmentUpdateView.vue', () => {
    let wrapper: VueWrapper<any>;
    const mockPush = vi.fn();

    beforeEach(async () => {
        vi.clearAllMocks();

        // Mock Daten für GET
        (axios.get as vi.Mock).mockResolvedValue({
            data: {
                title: 'Test Apartment',
                description: 'Test Description',
                location: 'Test Location',
                livingSpace: 50,
                usableSpace: 60,
                heatingSpace: 70,
                street: 'Test Street',
                zip: '12345',
                city: 'Test City',
                province: 'Test Province',
                country: 'Test Country',
                countryCode: 'TC',
            },
        });

        wrapper = mount(ApartmentUpdateView, {
            props: {
                projectId: '123',
                buildingId: '456',
                apartmentId: '789',
            },
            global: {
                stubs: ['InputText', 'Textarea', 'Button', 'Card'],
                provide: {
                    useRouter: () => ({ push: mockPush }),
                },
            },
        });

        // Warte, bis onMounted und fetch abgeschlossen ist
        await new Promise(resolve => setTimeout(resolve));
    });

    // 🧪 Test: Laden von Apartment-Daten
    it('fetches apartment data on mount', () => {
        expect(wrapper.vm.title).toBe('Test Apartment');
        expect(axios.get).toHaveBeenCalledWith('/api/v1/projects/123/apartments/789');
    });

    // 🧪 Test: Validierung fehlschlägt bei fehlenden Pflichtfeldern
    it('shows validation errors on empty required fields', () => {
        wrapper.vm.title = '';
        wrapper.vm.street = '';
        wrapper.vm.zip = '';
        wrapper.vm.city = '';
        wrapper.vm.province = '';
        wrapper.vm.country = '';
        wrapper.vm.livingSpace = null;
        wrapper.vm.usableSpace = null;
        wrapper.vm.heatingSpace = null;

        const valid = wrapper.vm.validateForm();
        expect(valid).toBe(false);
        expect(wrapper.vm.errors).toHaveProperty('title');
        expect(wrapper.vm.errors).toHaveProperty('livingSpace');
        expect(wrapper.vm.errors).toHaveProperty('street');
    });

    // 🧪 Test: Absenden des Formulars mit korrekten Werten
    it('handles submit correctly', async () => {
        const formData = {
            title: 'Updated Title',
            description: 'Updated Description',
            location: 'Updated Location',
            livingSpace: 80,
            usableSpace: 90,
            heatingSpace: 60,
        };

        (axios.patch as vi.Mock).mockResolvedValue({});

        await wrapper.vm.handleSubmit(formData);

        expect(axios.patch).toHaveBeenCalledWith(
          '/api/v1/projects/123/apartments/789',
          expect.objectContaining({
              title: 'Updated Title',
              description: 'Updated Description',
              location: 'Updated Location',
              livingSpace: 80,
              usableSpace: 90,
              heatingSpace: 60,
          })
        );
    });

    // 🧪 Test: Cancel-Button führt Navigation aus
    it('handles cancel correctly', () => {
        wrapper.vm.handleCancel();
        expect(mockPush).toHaveBeenCalledWith('/project/123/buildings/456');
    });
});
