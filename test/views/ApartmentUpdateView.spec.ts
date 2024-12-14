import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApartmentUpdateView from '@/views/ApartmentUpdateView.vue';
import axios from 'axios';

// Mock für die Router-Parameter
vi.mock('vue-router', () => ({
    useRoute: () => ({
        params: {
            projectId: '123',
            buildingId: '456',
            apartmentId: '789',
        },
    }),
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// Mock Axios
vi.mock('axios');

describe('ApartmentUpdateView.vue', () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(ApartmentUpdateView, {
            global: {
                stubs: ['ReusableFormComponent'], // Falls ReusableFormComponent verwendet wird
            },
        });
    });

    it('renders the update form correctly', () => {
        expect(wrapper.find('h1').text()).toBe('Update Apartment');
        expect(wrapper.find('button[type="submit"]').text()).toBe('Update');
    });

    it('fetches apartment data on mount', async () => {
        const mockResponse = {
            data: {
                title: 'Test Apartment',
                location: 'Berlin',
                heatingSpace: 50,
                livingSpace: 70,
                description: 'Test Description',
                usableSpace: 80,
            },
        };

        (axios.get as vi.Mock).mockResolvedValue(mockResponse);

        // Call fetchApartmentData
        await (wrapper.vm as any).fetchApartmentData();

        expect(axios.get).toHaveBeenCalledWith(
            '/project/123/building/456/apartments/789'
        );

        const titleField = wrapper.find('input[name="title"]');
        expect((titleField.element as HTMLInputElement).value).toBe('Test Apartment');
    });

    it('handles submit correctly', async () => {
        const mockFormData = {
            title: 'Updated Title',
            location: 'Updated Location',
            heatingSpace: 55,
            livingSpace: 75,
            description: 'Updated Description',
            usableSpace: 85,
        };

        const mockPush = vi.fn();
        (axios.patch as vi.Mock).mockResolvedValue({});
        (wrapper.vm as any).router.push = mockPush;

        // Call handleSubmit
        await (wrapper.vm as any).handleSubmit(mockFormData);

        expect(axios.patch).toHaveBeenCalledWith(
            '/project/123/building/456/apartments/789',
            mockFormData
        );
        expect(mockPush).toHaveBeenCalledWith('/project/123/buildings/456');
    });

    it('handles cancel correctly', () => {
        const mockPush = vi.fn();
        (wrapper.vm as any).router.push = mockPush;

        // Call handleCancel
        (wrapper.vm as any).handleCancel();

        expect(mockPush).toHaveBeenCalledWith('/project/123/buildings/456');
    });

    it('displays error if fetching apartment data fails', async () => {
        (axios.get as vi.Mock).mockRejectedValue(new Error('Fetch Error'));

        // Call fetchApartmentData
        await (wrapper.vm as any).fetchApartmentData();

        expect(wrapper.text()).toContain('Failed to load apartment data. Please try again.');
    });

    it('displays error if update fails', async () => {
        const mockFormData = {
            title: 'Updated Title',
            location: 'Updated Location',
            heatingSpace: 55,
            livingSpace: 75,
            description: 'Updated Description',
            usableSpace: 85,
        };

        (axios.patch as vi.Mock).mockRejectedValue(new Error('Update Error'));

        // Call handleSubmit
        await (wrapper.vm as any).handleSubmit(mockFormData);

        expect(wrapper.text()).toContain('Failed to update apartment. Please try again.');
    });
});
