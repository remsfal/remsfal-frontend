import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApartmentUpdateView from '../../src/views/ApartmentUpdateView.vue';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('../../../src/services/ApartmentService', () => {
    return {
        apartmentService: {
            getApartment: vi.fn().mockResolvedValue({
                title: 'Test Apartment',
                description: 'Nice place',
                location: 'City Center',
                livingSpace: 50,
                usableSpace: 60,
                heatingSpace: 55,
                street: 'Main St',
                zip: '12345',
                city: 'Sample City',
                province: 'Sample Province',
                country: 'Sample Country',
                countryCode: 'DE',
            }),
            updateApartment: vi.fn(), // optional: kannst du später für Save-Tests nutzen
        },
    };
});

describe('ApartmentUpdateView.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks(); // reset für jeden Testlauf
    });

    it('navigates correctly when Cancel button is clicked', async () => {
        const wrapper = mount(ApartmentUpdateView, {
            props: {
                projectId: '123',
                buildingId: '456',
                apartmentId: '789',
            },
            global: {
                mocks: {
                    $t: (msg) => msg, // i18n mock
                },
            },
        });

        await flushPromises(); // warten auf getApartment

        const cancelButton = wrapper.find('button.p-button-secondary');
        expect(cancelButton.exists()).toBe(true);

        await cancelButton.trigger('click');

        expect(mockPush).toHaveBeenCalledWith('/project/123/units');

    });
});
