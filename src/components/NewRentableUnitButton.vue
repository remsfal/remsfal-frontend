<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import SplitButton from 'primevue/splitbutton';
import Textarea from 'primevue/textarea';
import { EntityType, propertyService } from '@/services/PropertyService';
import { siteService } from '@/services/SiteService';
import { buildingService } from '@/services/BuildingService';
import { apartmentService } from '@/services/ApartmentService';
import { commercialService } from '@/services/CommercialService';
import { storageService } from '@/services/StorageService.ts';

const props = defineProps<{
  projectId: string;
  parentId?: string;
  type: EntityType;
}>();
const emit = defineEmits<{
  (e: 'newUnit', title: string): void;
}>();

const { t } = useI18n();

const visible = ref<boolean>(false);
const newUnitType = ref<EntityType | undefined>(undefined);
const title = ref<string | undefined>(undefined);
const description = ref<string | undefined>(undefined);

const createRentableUnit = async () => {
  if (!props.parentId && newUnitType.value === EntityType.Property) {
    console.error('Parent ID is missing');
    return;
  }

  if (!title.value) {
    console.log('Title is empty, no creation occurs');
    alert('Titel ist ein Pflichtfeld!');
    return;
  }

  visible.value = false;
  let creationPromise: Promise<void> = Promise.resolve();
  switch (newUnitType.value) {
    case EntityType.Property: {
      creationPromise = createProperty();
      break;
    }
    case EntityType.Site: {
      creationPromise = createSite();
      break;
    }
    case EntityType.Building: {
      creationPromise = createBuilding();
      break;
    }
    case EntityType.Apartment: {
      creationPromise = createApartment();
      break;
    }
    case EntityType.Commercial: {
      creationPromise = createCommercial();
      break;
    }
    case EntityType.Storage: {
      creationPromise = createStorage();
      break;
    }
  }

  creationPromise
    .then(() => {
      emit('newUnit', title.value!);
    })
    .catch((err) => {
      console.error('Failed to create rentable unit:', err);
    });
};

async function createProperty(): Promise<void> {
  console.log('createProperty called');
  return propertyService
    .createProperty(props.projectId, {
      title: title.value!,
      description: description.value,
      plotArea: null,
    })
    .then((newProperty) => {
      console.log('Property created:', newProperty);
      return Promise.resolve();
    });
}

async function createSite(): Promise<void> {
  console.log('createSite called');
  return siteService
    .createSite(props.projectId, props.parentId!, {
      title: title.value!,
      description: description.value,
    })
    .then((newSite) => {
      console.log('Site created:', newSite);
      return Promise.resolve();
    });
}

async function createBuilding(): Promise<void> {
  console.log('createBuilding called');
  return buildingService
    .createBuilding(props.projectId, props.parentId!, {
      title: title.value!,
      description: description.value,
    })
    .then((newBuilding) => {
      console.log('Building created:', newBuilding);
      return Promise.resolve();
    });
}

async function createApartment(): Promise<void> {
  console.log('createApartment called');
  return apartmentService
    .createApartment(props.projectId, props.parentId!, {
      title: title.value!,
      description: description.value,
    })
    .then((newApartment) => {
      console.log('Apartment created:', newApartment);
      return Promise.resolve();
    });
}

async function createCommercial(): Promise<void> {
  console.log('createCommercial called');
  return commercialService
    .createCommercial(props.projectId, props.parentId!, {
      title: title.value!,
      description: description.value,
    })
    .then((newCommercial) => {
      console.log('Commercial created:', newCommercial);
      return Promise.resolve();
    });
}

async function createStorage(): Promise<void> {
  console.log('createStorage called');
  return storageService
    .createStorage(props.projectId, props.parentId!, {
      title: title.value!,
      description: description.value,
    })
    .then((newStorage) => {
      console.log('Storage created:', newStorage);
      return Promise.resolve();
    });
}
</script>

<template>
  <div v-if="props.type === EntityType.Project">
    <Button
      type="button"
      icon="pi pi-plus"
      label="Grundstück erstellen "
      severity="success"
      @click="
        visible = true;
        newUnitType = EntityType.Property;
      "
    />
  </div>
  <div v-if="props.type === EntityType.Property">
    <SplitButton
      label="Erstellen"
      severity="success"
      :model="[
        {
          label: 'Gebäude erstellen',
          icon: 'pi pi-building',
          command: () => {
            visible = true;
            newUnitType = EntityType.Building;
          },
        },
        {
          label: 'Außenanlage erstellen',
          icon: 'pi pi-sun',
          command: () => {
            visible = true;
            newUnitType = EntityType.Site;
          },
        },
      ]"
    />
  </div>
  <div v-if="props.type === EntityType.Building">
    <SplitButton
      label="Erstellen"
      severity="success"
      :model="[
        {
          label: 'Wohnung erstellen',
          icon: 'pi pi-building',
          command: () => {
            visible = true;
            newUnitType = EntityType.Apartment;
          },
        },
        {
          label: 'Gewerbe erstellen',
          icon: 'pi pi-briefcase',
          command: () => {
            visible = true;
            newUnitType = EntityType.Commercial;
          },
        },
        {
          label: 'Nebennutzungsraum erstellen',
          icon: 'pi pi-car',
          command: () => {
            visible = true;
            newUnitType = EntityType.Storage;
          },
        },
      ]"
    />
  </div>

  <Dialog v-model:visible="visible" modal header="Einheit hinzufügen" :style="{ width: '35rem' }">
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
    <div class="flex items-center gap-6 mb-20">
      <label for="description" class="font-semibold w-24">Beschreibung</label>
      <Textarea id="description" v-model="description" rows="4" class="flex-auto" />
    </div>
    <div class="flex justify-end gap-2">
      <Button
        type="button"
        :label="t('button.cancel')"
        severity="secondary"
        @click="visible = false"
      ></Button>
      <Button type="button" :label="t('button.add')" @click="createRentableUnit"></Button>
    </div>
  </Dialog>
</template>
