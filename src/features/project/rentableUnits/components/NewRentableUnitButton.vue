<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Popover from 'primevue/popover';
import Textarea from 'primevue/textarea';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
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
const titleMatchesLocation = ref(true);
const currentTitle = ref('');
const initialValues = ref({
 title: '', location: '', description: '' 
});
const formKey = ref(0);

const schema = z.object({
  title: z.string().trim().min(3, { message: t('validation.minLength', { min: 3 }) }),
  location: z.string().trim().optional().or(z.literal('')),
  description: z.string().trim().optional().or(z.literal('')),
});

const resolver = zodResolver(schema);

watch(titleMatchesLocation, (checked) => {
  if (checked) {
    initialValues.value = { ...initialValues.value, location: currentTitle.value };
    formKey.value++;
  }
});

const op = ref<InstanceType<typeof Popover>>();

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
        label: t('rentableUnits.type.building.label'),
        description: t('rentableUnits.type.building.description'),
      },
      {
        type: EntityType.Site,
        icon: UNIT_TYPE_ICONS.SITE,
        label: t('rentableUnits.type.site.label'),
        description: t('rentableUnits.type.site.description'),
      },
    ];
  }
  if (props.type === EntityType.Building) {
    return [
      {
        type: EntityType.Apartment,
        icon: UNIT_TYPE_ICONS.APARTMENT,
        label: t('rentableUnits.type.apartment.label'),
        description: t('rentableUnits.type.apartment.description'),
      },
      {
        type: EntityType.Commercial,
        icon: UNIT_TYPE_ICONS.COMMERCIAL,
        label: t('rentableUnits.type.commercial.label'),
        description: t('rentableUnits.type.commercial.description'),
      },
      {
        type: EntityType.Storage,
        icon: UNIT_TYPE_ICONS.STORAGE,
        label: t('rentableUnits.type.storage.label'),
        description: t('rentableUnits.type.storage.description'),
      },
    ];
  }
  return [];
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;

  if (!props.parentId && newUnitType.value === EntityType.Property) {
    console.error('Parent ID is missing');
    return;
  }

  const s = event.states;
  const titleVal = s.title?.value as string;
  const loc = titleMatchesLocation.value ? titleVal : (s.location?.value || undefined);
  const desc = s.description?.value || undefined;

  let creationPromise: Promise<void> = Promise.resolve();
  switch (newUnitType.value) {
    case EntityType.Property:
      creationPromise = createProperty(titleVal, loc, desc);
      break;
    case EntityType.Site:
      creationPromise = createSite(titleVal, loc, desc);
      break;
    case EntityType.Building:
      creationPromise = createBuilding(titleVal, loc, desc);
      break;
    case EntityType.Apartment:
      creationPromise = createApartment(titleVal, loc, desc);
      break;
    case EntityType.Commercial:
      creationPromise = createCommercial(titleVal, loc, desc);
      break;
    case EntityType.Storage:
      creationPromise = createStorage(titleVal, loc, desc);
      break;
  }

  creationPromise
    .then(() => {
      emit('newUnit', titleVal);
      titleMatchesLocation.value = true;
      currentTitle.value = '';
      initialValues.value = {
 title: '', location: '', description: '' 
};
      formKey.value++;
      visible.value = false;
    })
    .catch((err) => {
      console.error('Failed to create rentable unit:', err);
    });
}

async function createProperty(title: string, loc: string | undefined, desc: string | undefined): Promise<void> {
  console.log('createProperty called');
  return propertyService
    .createProperty(props.projectId, {
 title, location: loc, description: desc, plotArea: 0 
})
    .then((newProperty) => {
      console.log('Property created:', newProperty);
    });
}

async function createSite(title: string, loc: string | undefined, desc: string | undefined): Promise<void> {
  console.log('createSite called');
  return siteService
    .createSite(props.projectId, props.parentId!, {
 title, location: loc, description: desc 
})
    .then((newSite) => {
      console.log('Site created:', newSite);
    });
}

async function createBuilding(title: string, loc: string | undefined, desc: string | undefined): Promise<void> {
  console.log('createBuilding called');
  return buildingService
    .createBuilding(props.projectId, props.parentId!, {
 title, location: loc, description: desc 
})
    .then((newBuilding) => {
      console.log('Building created:', newBuilding);
    });
}

async function createApartment(title: string, loc: string | undefined, desc: string | undefined): Promise<void> {
  console.log('createApartment called');
  return apartmentService
    .createApartment(props.projectId, props.parentId!, {
 title, location: loc, description: desc 
})
    .then((newApartment) => {
      console.log('Apartment created:', newApartment);
    });
}

async function createCommercial(title: string, loc: string | undefined, desc: string | undefined): Promise<void> {
  console.log('createCommercial called');
  return commercialService
    .createCommercial(props.projectId, props.parentId!, {
 title, location: loc, description: desc 
})
    .then((newCommercial) => {
      console.log('Commercial created:', newCommercial);
    });
}

async function createStorage(title: string, loc: string | undefined, desc: string | undefined): Promise<void> {
  console.log('createStorage called');
  return storageService
    .createStorage(props.projectId, props.parentId!, {
 title, location: loc, description: desc 
})
    .then((newStorage) => {
      console.log('Storage created:', newStorage);
    });
}
</script>

<template>
  <Button
    v-if="props.type === EntityType.Project"
    type="button"
    icon="pi pi-plus"
    :label="t('rentableUnits.button.createProperty')"
    severity="success"
    pt:root="min-w-[188px]"
    @click="
      visible = true;
      newUnitType = EntityType.Property;
    "
  />

  <template v-else-if="props.type === EntityType.Property || props.type === EntityType.Building">
    <Button
      type="button"
      icon="pi pi-plus"
      :label="props.type === EntityType.Property ? t('rentableUnits.button.addAnnexation') : t('rentableUnits.button.addUnit')"
      pt:root="min-w-[188px]"
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
            <div class="text-sm text-surface-500">
              {{ option.description }}
            </div>
          </div>
        </li>
      </ul>
    </Popover>
  </template>

  <Dialog v-model:visible="visible" modal :header="t('rentableUnits.dialog.addUnit')" :style="{ width: '35rem' }">
    <Form
      :key="formKey"
      v-slot="$form"
      :initialValues
      :resolver
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-6">
        <!-- Titel -->
        <div class="flex flex-col gap-1">
          <label for="title" class="font-semibold">{{ t('rentableUnits.form.title') }}</label>
          <InputText
            id="title"
            name="title"
            :placeholder="t('rentableUnits.form.titlePlaceholder')"
            fluid
            autofocus
            @update:modelValue="(v) => (currentTitle = v as string)"
          />
          <Message
            v-if="$form.title?.invalid && $form.title?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.title.error?.message }}
          </Message>
        </div>

        <!-- Lage/Standort -->
        <div class="flex flex-col gap-1">
          <label for="location" class="font-semibold">{{ t('rentableUnits.form.location') }}</label>
          <InputText
            id="location"
            name="location"
            fluid
            :disabled="titleMatchesLocation"
          />
          <div class="flex items-center gap-2 mt-1">
            <Checkbox v-model="titleMatchesLocation" inputId="titleMatchesLocation" binary />
            <label for="titleMatchesLocation" class="text-sm">{{ t('rentableUnits.form.locationMatchesTitle') }}</label>
          </div>
        </div>

        <!-- Beschreibung -->
        <div class="flex flex-col gap-1">
          <label for="description" class="font-semibold">{{ t('rentableUnits.form.description') }}</label>
          <Textarea
            id="description" name="description"
            :rows="4" autoResize
            fluid
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            :label="t('button.cancel')"
            severity="secondary"
            @click="visible = false"
          />
          <Button type="submit" :label="t('button.add')" />
        </div>
      </div>
    </Form>
  </Dialog>
</template>
