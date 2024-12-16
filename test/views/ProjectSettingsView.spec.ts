import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import ProjectSettingsView from '@/views/ProjectSettingsView.vue';
import ProjectMemberService from '@/services/ProjectMemberService';

vi.mock('@/services/ProjectMemberService');

const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/project/:projectId', component: ProjectSettingsView }],
});

describe('ProjectSettingsView.vue', () => {
    let wrapper: any;

    beforeEach(async () => {
        router.push('/project/test-project-id');
        await router.isReady();

        wrapper = mount(ProjectSettingsView, {
            props: {
                projectId: 'test-project-id',
            },
            global: {
                plugins: [router],
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

    // Test for fetchMembers
    describe('fetchMembers', () => {
        test('loads members successfully', async () => {
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

    // Test for addMember
    describe('addMember', () => {
        test('adds a new member successfully', async () => {
            ProjectMemberService.addMember.mockResolvedValueOnce({});
            ProjectMemberService.getMembers.mockResolvedValueOnce([]);

            wrapper.vm.newMemberEmail = 'test@example.com';
            wrapper.vm.newMemberRole = 'MANAGER';


            await wrapper.vm.addMember();

            expect(ProjectMemberService.addMember).toHaveBeenCalledWith(
                'test-project-id', {
                    "email": "test@example.com",
                    "role": "MANAGER",
            });
            expect(wrapper.vm.newMemberEmail).toBe('');
            expect(wrapper.vm.newMemberRole).toBe('');
        });
    });


    // Test for updateMemberRole
    describe('updateMemberRole', () => {
        test('updates a member\'s role successfully', async () => {
            ProjectMemberService.updateMemberRole.mockResolvedValueOnce({});
            const member = { id: '1', email: 'test@example.com', role: 'MANAGER' };

            await wrapper.vm.updateMemberRole(member);

            expect(ProjectMemberService.updateMemberRole).toHaveBeenCalledWith('test-project-id', member);
        });
    });


    // Test for removeMember
    test('removes a member successfully', async () => {
        const validMemberId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa'; // Valid UUID
        ProjectMemberService.removeMember.mockResolvedValueOnce({});
        ProjectMemberService.getMembers.mockResolvedValueOnce([]);

        await wrapper.vm.removeMember(validMemberId); // Use valid UUID

        expect(ProjectMemberService.removeMember).toHaveBeenCalledWith('test-project-id', validMemberId);
        expect(ProjectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
    });
});