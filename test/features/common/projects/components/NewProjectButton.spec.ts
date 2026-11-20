import {describe, it, expect, vi, beforeEach} from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import NewProjectButton from '@/features/common/projects/components/NewProjectButton.vue';
import { projectService } from '@/features/common/projects/services/ProjectService';
import { useProjectStore } from '@/features/common/projects/stores/ProjectStore';
import { useOrganizationStore } from '@/features/common/organizations';
import { useRouter } from 'vue-router';
import { Form } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import { saveProject } from '@/helper/indexeddb';
import { server } from '../../../../mocks/server';
import { mockEmployee } from '../../../../mocks/handlers/organization.handlers';

vi.mock('@/features/common/projects/services/ProjectService', { spy: true });
vi.mock('@/features/common/projects/stores/ProjectStore', () => ({useProjectStore: vi.fn(),}));
vi.mock('vue-router', () => ({useRouter: vi.fn(),}));
vi.mock('@/helper/indexeddb', () => ({ saveProject: vi.fn() }));

function mockEmployments(employees: Array<typeof mockEmployee | Record<string, unknown>>) {
  server.use(
    http.get('/api/v1/organizations/employments', () => HttpResponse.json({ employees }, { status: 200 })),
  );
}

describe('NewProjectButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewProjectButton>>;
  let pushMock: ReturnType<typeof vi.fn>;
  let storeMock: {
    projectList: Array<{ id: string; name: string; memberRole: string }>;
    refreshProjectList: ReturnType<typeof vi.fn>;
    addProjectToList: ReturnType<typeof vi.fn>;
    setSelectedProject: ReturnType<typeof vi.fn>;
  };

  async function mountButton() {
    wrapper = mount(NewProjectButton, {
      global: {
        stubs: {
          Dialog: {
            props: ['visible'],
            emits: ['update:visible'],
            template: `<div v-if="visible">
              <span class="dialog-close" @click="$emit('update:visible', false)" />
              <slot />
            </div>`,
          },
          Button: {
            props: ['label', 'type', 'disabled'],
            emits: ['click'],
            template: `<button :type="type ?? 'button'" :disabled="disabled" :data-label="label"
              @click="$emit('click')"><slot /></button>`,
          },
        },
        components: {
          Form,
          InputText,
          Message,
        },
      },
    });
    await flushPromises();
  }

  const openDialog = async () => {
    await wrapper.find('button').trigger('click');
    await flushPromises();
  };
  const submitButton = () => wrapper.find('button[type="submit"]');
  const cancelButton = () => wrapper.find('button[data-label="Abbrechen"]');

  async function submitTitle(title: string) {
    await wrapper.find('input[name="projectTitle"]').setValue(title);
    await wrapper.findComponent(Form).trigger('submit');
    await flushPromises();
  }

  beforeEach(async () => {
    vi.spyOn(projectService, 'createProject').mockResolvedValue({
      id: '1',
      title: 'Valid Project',
    });

    storeMock = {
      projectList: [],
      refreshProjectList: vi.fn(),
      addProjectToList: vi.fn(),
      setSelectedProject: vi.fn()
    };
    (useProjectStore as unknown as () => typeof storeMock) = () => storeMock;

    pushMock = vi.fn();
    (useRouter as unknown as () => { push: typeof pushMock }) = () => ({ push: pushMock });

    useOrganizationStore().$reset();
    // by default the user has no organization in which they may create a property
    mockEmployments([]);
  });

  describe('without an eligible organization', () => {
    beforeEach(async () => {
      await mountButton();
    });

    it('opens the dialog when the add button is clicked', async () => {
      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(false);

      await openDialog();

      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(true);
    });

    it('does not show the owner select', async () => {
      await openDialog();

      expect(wrapper.findComponent(Select).exists()).toBe(false);
    });

    it('shows error message if projectTitle is too short', async () => {
      await openDialog();

      const input = wrapper.find('input[name="projectTitle"]');
      await input.setValue('AB');
      await input.trigger('blur');
      await flushPromises();

      expect(wrapper.findComponent(Message).exists()).toBe(true);
    });

    it('shows error message if projectTitle exceeds maxLength', async () => {
      await openDialog();

      const input = wrapper.find('input[name="projectTitle"]');
      await input.setValue('a'.repeat(101));
      await input.trigger('blur');
      await flushPromises();

      const errorMessage = wrapper.findComponent(Message);
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toContain('100');
    });

    it('disables submit button initially', async () => {
      await openDialog();

      expect(submitButton().attributes('disabled')).toBeDefined();
    });

    it('creates a personal property with the trimmed title and navigates to it', async () => {
      await openDialog();
      await submitTitle('  Valid Project  ');

      expect(projectService.createProject).toHaveBeenCalledWith('Valid Project', undefined);
      expect(storeMock.refreshProjectList).toHaveBeenCalled();
      const expectedItem = {
        id: '1',
        name: 'Valid Project',
        memberRole: 'PROPRIETOR',
      };
      expect(storeMock.addProjectToList).toHaveBeenCalledWith(expectedItem);
      expect(storeMock.setSelectedProject).toHaveBeenCalledWith(expectedItem);
      expect(pushMock).toHaveBeenCalledWith({
        name: 'ProjectDashboard',
        params: { projectId: '1' },
      });
    });

    it('selects the project item with the effective role from the refreshed list', async () => {
      const refreshedItem = {
        id: '1',
        name: 'Valid Project',
        memberRole: 'MANAGER',
      };
      storeMock.refreshProjectList.mockImplementation(() => {
        storeMock.projectList = [refreshedItem];
      });

      await openDialog();
      await submitTitle('Valid Project');

      expect(storeMock.setSelectedProject).toHaveBeenCalledWith(refreshedItem);
    });

    it('saves offline and closes the dialog when navigator is offline', async () => {
      const onLineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

      await openDialog();
      await submitTitle('Offline Project');

      expect(saveProject).toHaveBeenCalledWith('Offline Project', undefined);
      expect(projectService.createProject).not.toHaveBeenCalled();
      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(false);

      onLineSpy.mockRestore();
    });

    it('saves offline and closes the dialog when the API response has no id', async () => {
      vi.spyOn(projectService, 'createProject').mockResolvedValue({ id: undefined, title: 'No Id Project' });

      await openDialog();
      await submitTitle('No Id Project');

      expect(saveProject).toHaveBeenCalledWith('No Id Project', undefined);
      expect(storeMock.addProjectToList).not.toHaveBeenCalled();
      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(false);
    });

    it('logs, saves offline, and closes the dialog when createProject fails', async () => {
      vi.spyOn(projectService, 'createProject').mockRejectedValue(new Error('network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await openDialog();
      await submitTitle('Failed Project');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create project online:', expect.any(Error));
      expect(saveProject).toHaveBeenCalledWith('Failed Project', undefined);
      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('closes the dialog on abort', async () => {
      await openDialog();
      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(true);

      await cancelButton().trigger('click');

      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(false);
    });

    it('closes the dialog when the dialog itself is closed', async () => {
      await openDialog();
      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(true);

      await wrapper.find('.dialog-close').trigger('click');

      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(false);
    });

    it('does not create a project when an invalid title is submitted', async () => {
      await openDialog();
      await submitTitle('AB');

      expect(projectService.createProject).not.toHaveBeenCalled();
      expect(saveProject).not.toHaveBeenCalled();
      expect(wrapper.find('input[name="projectTitle"]').exists()).toBe(true);
    });
  });

  describe('with organizations', () => {
    it('offers only organizations in which the user is owner or manager', async () => {
      const employment = (organizationId: string, organizationName: string, employeeRole: string) => ({
        ...mockEmployee,
        organizationId,
        organizationName,
        employeeRole,
      });
      mockEmployments([
        employment('org-owner', 'Owner GmbH', 'OWNER'),
        employment('org-manager', 'Manager GmbH', 'MANAGER'),
        employment('org-staff', 'Staff GmbH', 'STAFF'),
      ]);
      await mountButton();
      await openDialog();

      const select = wrapper.findComponent(Select);
      expect(select.exists()).toBe(true);
      const options = select.props('options') as Array<{ value: string; label: string }>;
      expect(options.map((o) => o.value)).toEqual(['personal', 'org-owner', 'org-manager']);
      expect(options[0]?.label).toBe('Mich selbst (privat)');
    });

    it('does not show the owner select if the user is only staff of an organization', async () => {
      mockEmployments([{ ...mockEmployee, employeeRole: 'STAFF' }]);
      await mountButton();
      await openDialog();

      expect(wrapper.findComponent(Select).exists()).toBe(false);
    });

    it('creates the property for the selected organization', async () => {
      mockEmployments([{ ...mockEmployee, employeeRole: 'MANAGER' }]);
      await mountButton();
      await openDialog();

      // the overlay of the Select is teleported out of the wrapper, so the selection is applied via its model update
      const select = wrapper.findComponent(Select).vm as unknown as {
        updateModel: (event: Event, value: string) => void;
      };
      select.updateModel(new Event('change'), mockEmployee.organizationId);
      await flushPromises();
      await submitTitle('Organization Project');

      expect(projectService.createProject).toHaveBeenCalledWith('Organization Project', mockEmployee.organizationId);
      expect(storeMock.setSelectedProject).toHaveBeenCalledWith({
        id: '1',
        name: 'Valid Project',
        memberRole: 'MANAGER',
      });
    });

    it('creates a personal property if "myself" stays selected', async () => {
      mockEmployments([{ ...mockEmployee, employeeRole: 'OWNER' }]);
      await mountButton();
      await openDialog();

      await submitTitle('Personal Project');

      expect(projectService.createProject).toHaveBeenCalledWith('Personal Project', undefined);
    });
  });
});
