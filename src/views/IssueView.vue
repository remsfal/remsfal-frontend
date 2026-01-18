<script setup lang="ts">
    import { onMounted, ref, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import Button from 'primevue/button';
    import Dialog from 'primevue/dialog';
    import InputText from 'primevue/inputtext';
    import IssueTable from '@/components/IssueTable.vue';
    import {
      IssueService,
      ISSUE_TYPE_TASK,
      StatusValues,
      type Status,
      type IssueItem,
    } from '@/services/IssueService';
    
    const props = defineProps<{
      projectId: string;
      owner?: string;
      status?: Status;
      category?: string;
    }>();
    
    const issueService = new IssueService();
    const router = useRouter();
    
    // Reactive state
    const title = ref('');
    const description = ref('');
    const visible = ref(false);
    const issues = ref<IssueItem[]>([]);
    const issuesByStatusOpen = ref<IssueItem[]>([]);
    const myIssues = ref<IssueItem[]>([]);
    
    // --- Dialog ---
    const openCreateIssueDialog = () => {
      title.value = '';
      description.value = '';
      visible.value = true;
    };
    
    // --- Create a new issue ---
    const createIssue = async () => {
      try {
        const newIssue = await issueService.createIssue(props.projectId, {
          projectId: props.projectId,
          title: title.value,
          description: description.value,
          type: props.category === 'DEFECT' ? 'DEFECT' : ISSUE_TYPE_TASK,
          // ownerId intentionally omitted (backend requires null)
        });
    
        // Close dialog and reset fields
        visible.value = false;
        title.value = '';
        description.value = '';
    
        // --- Update tables reactively ---
        issues.value = [...issues.value, newIssue];
    
        // Open issues table
        if (newIssue.status === StatusValues.OPEN) {
          issuesByStatusOpen.value = [...issuesByStatusOpen.value, newIssue];
        }
    
        // My issues table (assign owner locally)
        if (props.owner) {
          myIssues.value = [
            ...myIssues.value,
            {
              ...newIssue,
              owner: props.owner, // frontend-only field
            },
          ];
        }
      } catch (error) {
        console.error('Error creating issue:', error);
      }
    };
    
    // --- Load all issues ---
    const loadIssues = async () => {
      try {
        // Signature: (projectId, status, category)
        const issueList = await issueService.getIssues(
          props.projectId,
          undefined,
          props.category
        );
        issues.value = issueList?.issues ?? [];
      } catch (err) {
        console.error(err);
      }
    };
    
    // --- Load only open issues ---
    const loadIssuesWithOpenStatus = async () => {
      try {
        const issueList = await issueService.getIssues(
          props.projectId,
          StatusValues.OPEN,
          props.category
        );
        issuesByStatusOpen.value = issueList?.issues ?? [];
      } catch (err) {
        console.error(err);
      }
    };
    
    // --- Load issues for current owner ---
    const loadMyIssues = async () => {
      try {
        const issueList = await issueService.getIssues(
          props.projectId,
          undefined,
          props.category
        );
    
        myIssues.value =
          issueList?.issues?.map(issue => ({
            ...issue,
            owner: props.owner,
          })) ?? [];
      } catch (err) {
        console.error(err);
      }
    };
    
    // --- Handle row selection ---
    const onIssueSelect = (issue: IssueItem) => {
      router.push({ name: 'IssueDetails', params: { issueId: issue.id } });
    };
    
    // --- Initialize on mount ---
    onMounted(() => {
      loadIssues();
      loadIssuesWithOpenStatus();
      if (props.owner) loadMyIssues();
    });
    
    // --- Watch for prop changes ---
    watch(
      () => props,
      () => {
        loadIssues();
        loadIssuesWithOpenStatus();
        if (props.owner) loadMyIssues();
      },
      { deep: true }
    );
    </script>
    
    <template>
      <main>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <h1 class="w-full">
              <span v-if="props.category === 'DEFECT'">
                <span v-if="props.owner">Meine Mängel</span>
                <span v-else-if="props.status">Offene Mängel</span>
                <span v-else>Alle Mängel</span>
              </span>
              <span v-else>
                <span v-if="props.owner">Meine Aufgaben</span>
                <span v-else-if="props.status">Offene Aufgaben</span>
                <span v-else>Alle Aufgaben</span>
              </span>
            </h1>
          </div>
    
          <div class="col-span-12">
            <div class="card">
              <!-- Create Issue Dialog -->
              <Dialog
                v-model:visible="visible"
                modal
                header="Aufgabe erstellen"
                :style="{ width: '50rem' }"
              >
                <div class="flex items-center gap-6 mb-6">
                  <label for="title" class="font-semibold w-24">Titel</label>
                  <InputText id="title" v-model="title" class="flex-auto" />
                </div>
    
                <div class="flex items-center gap-6 mb-20">
                  <label for="description" class="font-semibold w-24">Beschreibung</label>
                  <InputText id="description" v-model="description" class="flex-auto" />
                </div>
    
                <div class="flex justify-end gap-2">
                  <Button label="Abbrechen" severity="secondary" @click="visible = false" />
                  <Button label="Erstellen" @click="createIssue" />
                </div>
              </Dialog>
    
              <!-- Issues Table -->
              <div v-if="props.owner">
                <IssueTable :issues="myIssues" @rowSelect="onIssueSelect" />
              </div>
    
              <div v-else-if="props.status">
                <IssueTable :issues="issuesByStatusOpen" @rowSelect="onIssueSelect" />
              </div>
    
              <div v-else>
                <IssueTable :issues="issues" @rowSelect="onIssueSelect" />
              </div>
    
              <!-- Create Button -->
              <div class="flex justify-end mt-6">
                <Button
                  :label="props.category === 'DEFECT' ? 'Mangel melden' : 'Aufgabe erstellen'"
                  @click="openCreateIssueDialog"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
    