import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApartmentCreationView from '../../src/views/ApartmentCreationView.vue';
import axios from 'axios';

// Mock für die Router-Parameter
vi.mock('vue-router', () => ({
    useRoute: () => ({
        params: {
            projectId: '123',
        },
        query: {
            parentId: '456', // Mock parentId aus query
        },
    }),
    useRouter: () => ({
        push: vi.fn(), // Mock push-Funktion
    }),
}));

// Mock Axios
vi.mock('axios');

describe('ApartmentCreationView.vue', () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(ApartmentCreationView, {
            global: {
                stubs: ['ReusableFormComponent'], // Stub für das Formular
            },
        });
    });



    it('handles submit correctly', async () => {
        // Mock-Daten für das Formular
        const mockFormData = {
            title: 'New Apartment',
            location: 'Berlin',
            heatingSpace: 55,
            livingSpace: 75,
            description: 'Nice Apartment',
            usableSpace: 85,
        };

        // Mock für axios und vue-router
        const mockPush = vi.fn();
        (axios.post as vi.Mock).mockResolvedValue({}); // Simuliere erfolgreichen API-Aufruf
        (wrapper.vm as any).router.push = mockPush;

        // Rufe handleSubmit auf
        await (wrapper.vm as any).handleSubmit(mockFormData);

        // Überprüfe, ob der API-Aufruf korrekt war
        expect(axios.post).toHaveBeenCalledWith(
            '/project/123/building/456/apartments', // Korrekte URL mit parentId
            mockFormData
        );

        // Überprüfe, ob die Weiterleitung nach der Erstellung korrekt war
        expect(mockPush).toHaveBeenCalledWith('/project/123/buildings/456');
    });

    it('handles cancel correctly', () => {
        // Mock für vue-router
        const mockPush = vi.fn();
        (wrapper.vm as any).router.push = mockPush;

        // Rufe handleCancel auf
        (wrapper.vm as any).handleCancel();

        // Überprüfe, ob die Weiterleitung korrekt war
        expect(mockPush).toHaveBeenCalledWith('/project/123/buildings/456');
    });

    it('displays an error if creation fails', async () => {
        // Mock für fehlgeschlagenen API-Aufruf
        (axios.post as vi.Mock).mockRejectedValue(new Error('Creation Error'));

        // Mock-Daten für das Formular
        const mockFormData = {
            title: 'New Apartment',
            location: 'Berlin',
            heatingSpace: 55,
            livingSpace: 75,
            description: 'Nice Apartment',
            usableSpace: 85,
        };

        // Fange das alert-Event ab
        window.alert = vi.fn();

        // Rufe handleSubmit auf
        await (wrapper.vm as any).handleSubmit(mockFormData);

        // Überprüfe, ob ein Alert angezeigt wurde
        expect(window.alert).toHaveBeenCalledWith('Failed to create apartment. Please try again.');
    });
});
