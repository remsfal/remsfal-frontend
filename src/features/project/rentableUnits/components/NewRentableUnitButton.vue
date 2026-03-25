<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Popover from 'primevue/popover';
import Textarea from 'primevue/textarea';
import { EntityType, propertyService } from '@/services/PropertyService';
import { UNIT_TYPE_ICONS } from '../unitTypeIcons';
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

const op = ref();

function toggle(event: Event) {
  op.value.toggle(event);
}

function selectType(type: EntityType) {
  op.value.hide();
  newUnitType.value = type;
  visible.value = true;
}

const options = computed(() => {
  if (props.type === EntityType.Property) {
    return [
      {
        type: EntityType.Building,
        icon: UNIT_TYPE_ICONS.BUILDING,
        label: 'Gebäude',
        description: 'Kann aus Wohnungen, Garagen, Nebennutzungsräumen und Gewerbeeinheiten bestehen',
      },
      {
        type: EntityType.Site,
        icon: UNIT_TYPE_ICONS.SITE,
        label: 'Außenanlage',
        description: 'Garten, Stellplatz oder Grundstücksteil mit reiner Außenanlagenfläche',
      },
    ];
  }
  if (props.type === EntityType.Building) {
    return [
      {
        type: EntityType.Apartment,
        icon: UNIT_TYPE_ICONS.APARTMENT,
        label: 'Wohnung',
        description: 'Verfügt über eine Wohnfläche nach Wohnflächenverordnung (WoFlV)',
      },
      {
        type: EntityType.Commercial,
        icon: UNIT_TYPE_ICONS.COMMERCIAL,
        label: 'Gewerbe',
        description: 'Gewerbeflächen nach DIN 277',
      },
      {
        type: EntityType.Storage,
        icon: UNIT_TYPE_ICONS.STORAGE,
        label: 'Nebennutzungsraum',
        description: 'Kann eine Garage, Keller oder Hobbyraum sein mit reiner Nutzfläche',
      },
    ];
  }
  return [];
});

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
      plotArea: 0,
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
  <Button
    v-if="props.type === EntityType.Project"
    type="button"
    icon="pi pi-plus"
    label="Grundstück erstellen"
    severity="success"
    @click="
      visible = true;
      newUnitType = EntityType.Property;
    "
  />

  <template v-else-if="props.type === EntityType.Property || props.type === EntityType.Building">
    <Button
      type="button"
      icon="pi pi-plus"
      :label="props.type === EntityType.Property ? 'Anlage hinzufügen' : 'Einheit hinzufügen'"
      @click="toggle"
    />
    <Popover ref="op">
      <ul class="list-none p-0 m-0 flex flex-col min-w-64">
        <li
          v-for="option in options"
          :key="option.type"
          class="flex items-center gap-3 px-3 py-3 hover:bg-emphasis cursor-pointer rounded-border"
          @click="selectType(option.type)"
        >
          <i :class="option.icon" class="text-xl" />
          <div>
            <span class="font-medium block">{{ option.label }}</span>
            <div class="text-sm text-surface-500">{{ option.description }}</div>
          </div>
        </li>
      </ul>
    </Popover>
  </template>

  <Dialog v-model:visible="visible" modal header="Einheit hinzufügen" :style="{ width: '35rem' }">
    <div class="flex items-center gap-6 mb-6">
      <label for="title" class="font-semibold w-24">Titel</label>
      <InputText
        id="title"
        v-model="title"
        type="text"
        placeholder="Titel der neuen Einheit"
        class="flex-auto"
        autocomplete="on"
        autofocus
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
      />
      <Button type="button" :label="t('button.add')" @click="createRentableUnit" />
    </div>
  </Dialog>
</template>
