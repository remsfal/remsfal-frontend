import { ref, watch, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { projectMemberService, type ProjectMemberJson } from '@/services/ProjectMemberService';
import { organizationMemberService } from '@/services/OrganizationMemberService';

export function useProjectMembers(projectId: MaybeRefOrGetter<string>) {
  const members = ref<ProjectMemberJson[]>([]);
  const loading = ref(false);

  async function fetchMembers() {
    loading.value = true;
    try {
      const id = toValue(projectId);
      const [directResult, organizationsResult] = await Promise.allSettled([
        projectMemberService.getMembers(id),
        organizationMemberService.getOrganizations(id),
      ]);

      const merged = new Map<string, ProjectMemberJson>();

      if (directResult.status === 'fulfilled') {
        for (const member of directResult.value.members ?? []) {
          if (member.id) merged.set(member.id, member);
        }
      } else {
        console.error('Failed to fetch project members:', directResult.reason);
      }

      if (organizationsResult.status === 'fulfilled') {
        const organizationMembers = (organizationsResult.value.organizations ?? [])
          .flatMap(organization => organization.members ?? []);
        for (const member of organizationMembers) {
          if (member.id && !merged.has(member.id)) merged.set(member.id, member);
        }
      } else {
        console.error('Failed to fetch organization members:', organizationsResult.reason);
      }

      members.value = Array.from(merged.values());
    } finally {
      loading.value = false;
    }
  }

  watch(() => toValue(projectId), fetchMembers, { immediate: true });

  return {
    members, loading, fetchMembers 
  };
}
