import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectSettingsView from '@/views/ProjectSettingsView.vue';
import ProjectMemberService from '@/services/ProjectMemberService';

vi.mock('@/services/ProjectMemberService');

describe('ProjectSettingsView.vue', () => {
    let wrapper: any;

    beforeEach(() => {
        wrapper = mount(ProjectSettingsView, {
            props: {
                projectId: 'test-project-id',
            },
            global: {
                mocks: {
                    $route: {
                        params: {
                            projectId: 'test-project-id',
                        },
                    },
                },
            },
        });

        vi.clearAllMocks();
    });

    // Test für fetchMembers
    describe('fetchMembers', () => {
        test('lädt Mitglieder erfolgreich', async () => {
            const mockMembers = [
                { id: '1', email: 'test1@example.com', role: 'MANAGER' },
                { id: '2', email: 'test2@example.com', role: 'TENANCY' },
            ];
            ProjectMemberService.getMembers.mockResolvedValueOnce(mockMembers);

            await wrapper.vm.fetchMembers();
            expect(wrapper.vm.members).toEqual(mockMembers);
            expect(ProjectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
        });
    });

    // Test für addMember
    describe('addMember', () => {
        test('fügt ein neues Mitglied erfolgreich hinzu', async () => {
            ProjectMemberService.addMember.mockResolvedValueOnce({});
            ProjectMemberService.getMembers.mockResolvedValueOnce([]);

            wrapper.vm.newMemberEmail = 'test@example.com';
            wrapper.vm.newMemberRole = 'MANAGER';

            await wrapper.vm.addMember();

            expect(ProjectMemberService.addMember).toHaveBeenCalledWith('test-project-id', {
                email: 'test@example.com',
                role: 'MANAGER',
            });
            expect(wrapper.vm.newMemberEmail).toBe('');
            expect(wrapper.vm.newMemberRole).toBe('');
        });
    });

    // Test für updateMemberRole
    describe('updateMemberRole', () => {
        test('aktualisiert die Rolle eines Mitglieds erfolgreich', async () => {
            ProjectMemberService.updateMemberRole.mockResolvedValueOnce({});
            const member = { id: '1', email: 'test@example.com', role: 'MANAGER' };

            await wrapper.vm.updateMemberRole(member);

            expect(ProjectMemberService.updateMemberRole).toHaveBeenCalledWith('test-project-id', member, 'MANAGER');
        });
    });

    // Test für removeMember
    test('entfernt ein Mitglied erfolgreich', async () => {
        const validMemberId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa'; // Gültige UUID
        ProjectMemberService.removeMember.mockResolvedValueOnce({});
        ProjectMemberService.getMembers.mockResolvedValueOnce([]);

        await wrapper.vm.removeMember(validMemberId); // Verwende gültige UUID

        expect(ProjectMemberService.removeMember).toHaveBeenCalledWith('test-project-id', validMemberId);
        expect(ProjectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
    });
});
