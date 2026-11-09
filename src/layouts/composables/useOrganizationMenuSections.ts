import { computed, onMounted, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import type { MenuItem } from '@/layouts/components/AppMenuItem.vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';

/**
 * Builds one sidebar section per organization of the user, each with a link to the organization settings.
 * Loads the user's organizations on mount unless the store is already initialized.
 *
 * @param i18nPrefix menu i18n prefix, e.g. 'managerMenu' (uses `<prefix>.organization` and `<prefix>.organization.settings`)
 * @param basePath view base path, e.g. '/manager' (links to `<basePath>/organizations/<id>`)
 */
export function useOrganizationMenuSections(i18nPrefix: string, basePath: string): ComputedRef<MenuItem[]> {
  const { t } = useI18n();
  const organizationStore = useOrganizationStore();
  const { userOrganizations, initialized } = storeToRefs(organizationStore);

  onMounted(() => {
    if (!initialized.value) {
      organizationStore.fetchUserOrganization();
    }
  });

  return computed(() => userOrganizations.value
    .filter((org) => !!org.id)
    .map((org): MenuItem => ({
      rawLabel: org.name ?? t(`${i18nPrefix}.organization`),
      label: `${i18nPrefix}.organization`,
      items: [
        {
          label: `${i18nPrefix}.organization.settings`,
          icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
          to: `${basePath}/organizations/${org.id}`,
        },
      ],
    })));
}
