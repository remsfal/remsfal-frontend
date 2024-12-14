import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApartmentUpdateView from '../../src/views/ApartmentUpdateView.vue';
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




});
