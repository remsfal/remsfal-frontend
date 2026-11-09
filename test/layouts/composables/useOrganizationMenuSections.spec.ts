import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useOrganizationMenuSections } from '@/layouts/composables/useOrganizationMenuSections';
import { useOrganizationStore } from '@/stores/OrganizationStore';

function mountSections(i18nPrefix = 'managerMenu', basePath = '/manager') {
  let sections!: ReturnType<typeof useOrganizationMenuSections>;
  mount(defineComponent({
    setup() {
      sections = useOrganizationMenuSections(i18nPrefix, basePath);
      return {};
    },
    template: '<div />',
  }));
  return sections;
}

describe('useOrganizationMenuSections', () => {
  let orgStore: ReturnType<typeof useOrganizationStore>;

  beforeEach(() => {
    orgStore = useOrganizationStore();
    orgStore.$reset();
    vi.spyOn(orgStore, 'fetchUserOrganization').mockResolvedValue();
    vi.mocked(orgStore.fetchUserOrganization).mockClear();
  });

  it('fetches the organizations on mount when the store is not initialized', () => {
    mountSections();
    expect(orgStore.fetchUserOrganization).toHaveBeenCalledOnce();
  });

  it('does not fetch the organizations again when the store is initialized', () => {
    orgStore.initialized = true;
    mountSections();
    expect(orgStore.fetchUserOrganization).not.toHaveBeenCalled();
  });

  it('builds one section per organization with a settings link below the base path', () => {
    orgStore.userOrganizations = [{ id: 'org-1', name: 'Muster GmbH' }];
    const sections = mountSections('contractorMenu', '/contractor');

    expect(sections.value).toEqual([{
      rawLabel: 'Muster GmbH',
      label: 'contractorMenu.organization',
      items: [{
        label: 'contractorMenu.organization.settings',
        icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
        to: '/contractor/organizations/org-1',
      }],
    }]);
  });

  it('falls back to the translated label for organizations without name and skips those without id', () => {
    orgStore.userOrganizations = [{ id: 'org-1' }, { name: 'Ohne Id GmbH' }];
    const sections = mountSections();

    expect(sections.value).toHaveLength(1);
    expect(sections.value[0]!.rawLabel).toBe('Organisation');
  });

  it('updates the sections when the organizations change', async () => {
    const sections = mountSections();
    expect(sections.value).toHaveLength(0);

    orgStore.userOrganizations = [{ id: 'org-1', name: 'A' }, { id: 'org-2', name: 'B' }];
    await nextTick();

    expect(sections.value.map((section) => section.rawLabel)).toEqual(['A', 'B']);
  });
});
