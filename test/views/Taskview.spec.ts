/*
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory, Router } from 'vue-router';
import TaskView from '../../src/views/TaskView.vue';
import { nextTick } from 'vue';
import { vi } from 'vitest';

// Mock TaskService (als Klasse)
vi.mock('@/services/TaskService', () => {
    return {
        default: class {
            getTasks = vi.fn().mockResolvedValue({
                tasks: [
                    { id: '1', title: 'Task 1', status: 'OPEN', owner: 'owner1' },
                    { id: '2', title: 'Task 2', status: 'CLOSED', owner: 'owner2' }
                ]
            });

            createTask = vi.fn().mockResolvedValue({
                id: '3', title: 'New Task', status: 'OPEN', owner: 'owner1'
            });
        },
        Status: {
            OPEN: 'OPEN',
            CLOSED: 'CLOSED'
        }
    }
});

describe('TaskView.vue', () => {
    let router: Router;

    beforeEach(() => {
        router = createRouter({
            history: createWebHistory(),
            routes: [
                {
                    path: '/project/:projectId/tasks',
                    name: 'TaskOverview',
                    component: TaskView
                }
            ]
        });

        // Optional: Fehlerbehandlung für Router-Navigationsfehler
        router.onError((err) => {
            console.error('Router error:', err);
        });
    });

    it('loads tasks on mount', async () => {
        await router.push({ name: 'TaskOverview', params: { projectId: '1' }, query: { owner: 'Owner' } });
        await router.isReady();

        const wrapper = mount(TaskView, {
            global: {
                plugins: [router]
            },
            props: {
                projectId: '1'
            }
        });

        await nextTick();

        expect(wrapper.text()).toContain('Task 1');
        expect(wrapper.text()).toContain('Task 2');
    });

    it('creates a new task', async () => {
        await router.push({ name: 'TaskOverview', params: { projectId: '1' }, query: { owner: 'Owner' } });
        await router.isReady();

        const wrapper = mount(TaskView, {
            global: {
                plugins: [router]
            },
            props: {
                projectId: '1'
            }
        });

        await nextTick();

        // Klick auf den 'Aufgabe erstellen' Button
        await wrapper.find('button[label="Aufgabe erstellen"]').trigger('click');
        await nextTick(); // Stellen Sie sicher, dass der Dialog angezeigt wird

        // Eingabewerte setzen
        const titleInput = wrapper.find('input#title');
        const descriptionInput = wrapper.find('input#description');

        // Sicherstellen, dass die Eingabefelder existieren
        expect(titleInput.exists()).toBe(true);
        expect(descriptionInput.exists()).toBe(true);

        // Werte in die Eingabefelder setzen
        await titleInput.setValue('New Task');
        await descriptionInput.setValue('New Task Description');
        await nextTick(); // Stellen Sie sicher, dass die Werte gesetzt werden

        // Klick auf den 'Erstellen' Button
        await wrapper.find('button[label="Erstellen"]').trigger('click');
        await nextTick(); // Sicherstellen, dass die Aufgabe erstellt wird

        // Überprüfen, ob die neue Aufgabe in der Aufgabenliste erscheint
        expect(wrapper.text()).toContain('New Task');
    });

    it('filters tasks by owner', async () => {
        await router.push({ name: 'TaskOverview', params: { projectId: '1' }, query: { owner: 'owner1' } });
        await router.isReady();

        const wrapper = mount(TaskView, {
            global: {
                plugins: [router]
            },
            props: {
                projectId: '1'
            }
        });

        await nextTick();

        expect(wrapper.text()).toContain('Task 1');
        expect(wrapper.text()).not.toContain('Task 2');
    });

    it('filters tasks by status', async () => {
        await router.push({ name: 'TaskOverview', params: { projectId: '1' }, query: { status: 'OPEN' } });
        await router.isReady();

        const wrapper = mount(TaskView, {
            global: {
                plugins: [router]
            },
            props: {
                projectId: '1'
            }
        });

        await nextTick();

        expect(wrapper.text()).toContain('Task 1');
        expect(wrapper.text()).not.toContain('Task 2');
    });
});

*/