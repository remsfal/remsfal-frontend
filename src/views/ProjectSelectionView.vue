<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import NewProjectForm from "@/components/NewProjectForm.vue";
import ProjectService from "@/services/ProjectService";

export default defineComponent({
  components: { NewProjectForm },
  setup() {
    const projectStore = useProjectStore();
    const router = useRouter();

    const projectList = computed(() => {
      const roles: Record<'PROPRIETOR' | 'MANAGER' | 'LESSOR', string> = {
        PROPRIETOR: "Eigentuemer",
        MANAGER: "Verwalter",
        LESSOR: "Vermieter",
      };

      return projectStore.projectList.map((project) => ({
        ...project,
        memberGerman: roles[project.memberRole as 'PROPRIETOR' | 'MANAGER' | 'LESSOR'],
      }));
    });

    const onRowClick = (event: any) => {
      projectStore.setSelectedProject(event.data);
      router.push({ name: "ProjectDashboard", params: { projectId: event.data.id } });
    };

    const display = ref(false);

    const open = () => {
      display.value = true;
    };

    const close = () => {
      display.value = false;
    };

    const dt = ref();
    const loading = ref(false);
    const totalRecords = ref(0);
    const projects = ref([]);
    const selectAll = ref(false);
    const first = ref(0);
    const rows = ref(10);
    const filters = ref({
      'name': { value: '', matchMode: 'contains' },
      'id': { value: '', matchMode: 'contains' },
      'memberGerman': { value: '', matchMode: 'contains' }
    });
    const lazyParams = ref({
      limit: rows.value,
      offset: first.value,
      sortField: null,
      sortOrder: null,
      filters: filters.value
    });

    const loadLazyData = (event = {}) => {
      loading.value = true;

      if (event.first !== undefined) {
        lazyParams.value.offset = event.first;
      }
      if (event.rows !== undefined) {
        lazyParams.value.limit = event.rows;
      }
      if (event.sortField !== undefined) {
        lazyParams.value.sortField = event.sortField;
      }
      if (event.sortOrder !== undefined) {
        lazyParams.value.sortOrder = event.sortOrder;
      }
      if (event.filters !== undefined) {
        lazyParams.value.filters = event.filters;
      }

      ProjectService.getProjects(lazyParams.value.limit, lazyParams.value.offset)
          .then((data) => {
            projects.value = data.projects;
            totalRecords.value = data.total;
            loading.value = false;
          })
          .catch((error) => {
            console.error(error);
            loading.value = false;
          });
    };

    const onPage = (event) => {
      loadLazyData(event);
    };

    const onSort = (event) => {
      loadLazyData(event);
    };

    const onFilter = (event) => {
      lazyParams.value.filters = filters.value;
      loadLazyData(event);
    };

    onMounted(() => {
      loadLazyData();
    });

    return {
      projects,
      onRowClick,
      display,
      open,
      close,
      loading,
      totalRecords,
      first,
      rows,
      onPage,
      onSort,
      onFilter
    };
  },
});
</script>

<template>
  <div class="grid">
    <div class="col-10">
      <div class="card">
        <h5>Projekt Übersicht</h5>
        <DataTable
            :value="projects"
            lazy
            paginator
            :first="first"
            :rows="rows"
            sortMode="single"
            scrollable
            scrollHeight="500px"
            @row-click="onRowClick"
            :rowHover="true"
            @page="onPage"
            @sort="onSort"
            @filter="onFilter"
            :totalRecords="totalRecords"
            :loading="loading"
            filterDisplay="row"
            :globalFilterFields="['name', 'id', 'memberGerman']"
        >
          <Column field="name" header="Titel" sortable style="min-width: 200px"></Column>
          <Column field="id" header="Projekt-ID" sortable style="min-width: 200px"></Column>
          <Column field="memberGerman" header="Eigentümer Rolle" sortable style="min-width: 200px"></Column>
        </DataTable>
      </div>
    </div>
    <div class="col-2">
      <Button label="Projekt hinzufügen" icon="pi pi-plus" style="width: auto" @click="open" />
      <Dialog
          header="Projekt hinzufügen"
          v-model:visible="display"
          :breakpoints="{ '960px': '75vw' }"
          :style="{ width: '30vw' }"
          :modal="true"
      >
        <div style="margin-top: 1.5em">
          <NewProjectForm />
        </div>
      </Dialog>
    </div>
  </div>
</template>
