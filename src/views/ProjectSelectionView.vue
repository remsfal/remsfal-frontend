<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';

export default defineComponent({
  setup() {
    const projectStore = useProjectStore();
    const router = useRouter();

    // Access the getters reactively using computed
    const projectList = computed(() => projectStore.projectList);

    const onRowClick = (event: any) => {
      const projectId = event.data.id;
      router.push(`/project/${projectId}`);
    };

    return {
      projectList,
      onRowClick,
    };
  },
});
</script>

<template>
  <div class="grid">
    <h1>Project List</h1>
    <div class="col-12">
      <div class="card">
        <DataTable
            :value="projectList"
            rowGroupMode="subheader"
            groupRowsBy="title"
            sortMode="single"
            sortField="title"
            :sortOrder="1"
            scrollable
            scrollHeight="400px"
            @row-click="onRowClick"
            :rowHover="true"
        >
          <Column field="title" header="Project Title" style="min-width: 200px"></Column>
          <Column field="id" header="Project ID" style="min-width: 200px"></Column>
          <Column field="members" header="Members" style="min-width: 400px">
            <template #body="{ data }">
              <div v-for="member in data.members" :key="member.id" class="flex align-items-center gap-2">
                <span>{{ member.email }} ({{ member.role }})</span>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>




