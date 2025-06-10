<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import { propertyService } from '@/services/PropertyService';
import { tenancyService, type TenantItem } from '@/services/TenancyService';

const props = defineProps<{
  projectId: string;
}>();
const emit = defineEmits<{
  (e: 'newUnit', title: string): void;
}>();

const { t } = useI18n();

const visible = ref<boolean>(false);
const title = ref<string | undefined>(undefined);
const description = ref<string | undefined>(undefined);
const tenant = ref<string | undefined>(undefined);
const usableSpace = ref<number | undefined>(undefined);
const tenants = ref<TenantItem[]>([]);
const selectedTenant = ref<TenantItem | null>(null);

const resetForm = () => {
  title.value = undefined;
  description.value = undefined;
  tenant.value = undefined;
  usableSpace.value = undefined;
  selectedTenant.value = null;
};

// Fetch tenant data when component is mounted
onMounted(async () => {
  tenants.value = await tenancyService.fetchTenantData();
});

// Update tenant value when selectedTenant changes
watch(selectedTenant, (newValue) => {
  if (newValue) {
    tenant.value = `${newValue.firstName} ${newValue.lastName}`;
  } else {
    tenant.value = undefined;
  }
});

// Reset form when dialog is closed
watch(visible, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    resetForm();
  }
});

const createProperty = async () => {
  console.log('createProperty called');
  if (!title.value) {
    console.log('Title is empty, no creation occurs');
    alert('Titel ist ein Pflichtfeld!');
    return;
  }

  visible.value = false;
  propertyService
    .createProperty(props.projectId, {
      title: title.value!,
      description: description.value,
      tenant: tenant.value,
      usable_space: usableSpace.value,
    })
    .then((newProperty) => {
      console.log('Property created:', newProperty);
      emit('newUnit', title.value!);
      resetForm();
    })
    .catch((err) => {
      console.error('Failed to create property:', err);
    });
};
</script>

<template>
  <Button
    type="button"
    icon="pi pi-plus"
    :label="t('rentableUnits.button.addProperty')"
    severity="success"
    @click="visible = true"
  />

  <Dialog
    v-model:visible="visible"
    modal
    :header="t('rentableUnits.button.addProperty')"
    :style="{ width: '35rem' }"
  >
    <div class="flex items-center gap-6 mb-6">
      <label for="title" class="font-semibold w-24">Titel</label>
      <InputText
        id="title"
        v-model="title"
        type="text"
        placeholder="Titel der neun Einheit"
        class="flex-auto"
        autocomplete="on"
      />
    </div>
    <div class="flex items-center gap-6 mb-6">
      <label for="description" class="font-semibold w-24">Beschreibung</label>
      <Textarea id="description" v-model="description" rows="4" class="flex-auto" />
    </div>
    <div class="flex items-center gap-6 mb-6">
      <label for="selectedTenant" class="font-semibold w-24">Mieter</label>
      <Dropdown
        id="selectedTenant"
        v-model="selectedTenant"
        :options="tenants"
        optionLabel="lastName"
        placeholder="Mieter auswählen"
        class="flex-auto"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value">
            {{ slotProps.value.firstName }} {{ slotProps.value.lastName }}
          </div>
          <span v-else>{{ tenant || 'Mieter auswählen' }}</span>
        </template>
        <template #option="slotProps">
          {{ slotProps.option.firstName }} {{ slotProps.option.lastName }}
        </template>
      </Dropdown>
    </div>
    <div class="flex items-center gap-6 mb-20">
      <label for="usableSpace" class="font-semibold w-24">Fläche (m²)</label>
      <InputText
        id="usableSpace"
        v-model="usableSpace"
        type="number"
        placeholder="Nutzbare Fläche in m²"
        class="flex-auto"
      />
    </div>

    <div class="flex justify-end gap-2">
      <Button
        type="button"
        :label="t('button.cancel')"
        severity="secondary"
        @click="
          () => {
            visible = false;
            resetForm();
          }
        "
      ></Button>
      <Button type="button" :label="t('button.add')" @click="createProperty"></Button>
    </div>
  </Dialog>
</template>

<style scoped></style>
