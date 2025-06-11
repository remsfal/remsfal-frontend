<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { buildingService } from '@/services/BuildingService';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  projectId: string;
  buildingId: string;
}>();

const router = useRouter();
const { t } = useI18n();
const title = ref('');
const description = ref('');
const location = ref('');
const livingSpace = ref<number | null>(null);
const commercialSpace = ref<number | null>(null);
const usableSpace = ref<number | null>(null);
const heatingSpace = ref<number | null>(null);
const street = ref('');
const zip = ref('');
const city = ref('');
const province = ref('');
const country = ref('');
const countryCode = ref('');

// Validation errors
const errors = ref<Record<string, string>>({});

const originalValues = ref<{
  title: string;
  description: string;
  location: string;
  livingSpace: number | null;
  commercialSpace: number | null;
  usableSpace: number | null;
  heatingSpace: number | null;
  street: string;
  zip: string;
  city: string;
  province: string;
  country: string;
  countryCode: string;
}>({
  title: '',
  description: '',
  location: '',
  livingSpace: null,
  commercialSpace: null,
  usableSpace: null,
  heatingSpace: null,
  street: '',
  zip: '',
  city: '',
  province: '',
  country: '',
  countryCode: '',
});

onMounted(() => {
  if (props.buildingId) {
    fetchBuildingDetails();
  }
});

const fetchBuildingDetails = () => {
  buildingService
    .getBuilding(props.projectId, props.buildingId)
    .then((building) => {
      title.value = building.title || '';
      description.value = building.description || '';
      location.value = building.location || '';
      livingSpace.value = building.livingSpace !== undefined ? building.livingSpace : null;
      commercialSpace.value = building.commercialSpace !== undefined ? building.commercialSpace : null;
      usableSpace.value = building.usableSpace !== undefined ? building.usableSpace : null;
      heatingSpace.value = building.heatingSpace !== undefined ? building.heatingSpace : null;
      street.value = building.street || '';
      zip.value = building.zip || '';
      city.value = building.city || '';
      province.value = building.province || '';
      country.value = building.country || '';
      countryCode.value = building.countryCode || '';

      // Log the loaded data to help with debugging
      console.log('Loaded building details:', {
        title: title.value,
        description: description.value,
        location: location.value,
        livingSpace: livingSpace.value,
        commercialSpace: commercialSpace.value,
        usableSpace: usableSpace.value,
        heatingSpace: heatingSpace.value,
        street: street.value,
        zip: zip.value,
        city: city.value,
        province: province.value,
        country: country.value,
        countryCode: countryCode.value
      });

      originalValues.value = {
        title: title.value,
        description: description.value,
        location: location.value,
        livingSpace: livingSpace.value,
        commercialSpace: commercialSpace.value,
        usableSpace: usableSpace.value,
        heatingSpace: heatingSpace.value,
        street: street.value,
        zip: zip.value,
        city: city.value,
        province: province.value,
        country: country.value,
        countryCode: countryCode.value
      };
    })
    .catch((err) => {
      console.error('Fehler beim Laden der Gebäudedetails:', err);
    });
};

const isModified = computed(() => {
  return (
    title.value !== originalValues.value.title ||
    description.value !== originalValues.value.description ||
    location.value !== originalValues.value.location ||
    livingSpace.value !== originalValues.value.livingSpace ||
    commercialSpace.value !== originalValues.value.commercialSpace ||
    usableSpace.value !== originalValues.value.usableSpace ||
    heatingSpace.value !== originalValues.value.heatingSpace ||
    street.value !== originalValues.value.street ||
    zip.value !== originalValues.value.zip ||
    city.value !== originalValues.value.city ||
    province.value !== originalValues.value.province ||
    country.value !== originalValues.value.country ||
    countryCode.value !== originalValues.value.countryCode
  );
});

const validateForm = (): boolean => {
  errors.value = {};

  // Validate title (required)
  if (!title.value.trim()) {
    errors.value.title = t('validation.required');
  }

  // Validate address fields (required except countryCode)
  if (!street.value.trim()) {
    errors.value.street = t('validation.required');
  }

  if (!zip.value.trim()) {
    errors.value.zip = t('validation.required');
  }

  if (!city.value.trim()) {
    errors.value.city = t('validation.required');
  }

  if (!province.value.trim()) {
    errors.value.province = t('validation.required');
  }

  if (!country.value.trim()) {
    errors.value.country = t('validation.required');
  }

  return Object.keys(errors.value).length === 0;
};

const updateBuilding = () => {
  if (!validateForm()) {
    return;
  }

  buildingService
    .updateBuilding(props.projectId, props.buildingId, {
      title: title.value,
      description: description.value,
      location: location.value,
      livingSpace: livingSpace.value !== null ? livingSpace.value : undefined,
      commercialSpace: commercialSpace.value !== null ? commercialSpace.value : undefined,
      usableSpace: usableSpace.value !== null ? usableSpace.value : undefined,
      heatingSpace: heatingSpace.value !== null ? heatingSpace.value : undefined,
      street: street.value || '',
      zip: zip.value || '',
      city: city.value || '',
      province: province.value || '',
      country: country.value || '',
      countryCode: countryCode.value || '',
    })
    .then(() => {
      // Stay on the current page after saving
      // Update originalValues to reflect the saved state
      originalValues.value = {
        title: title.value,
        description: description.value,
        location: location.value,
        livingSpace: livingSpace.value,
        commercialSpace: commercialSpace.value,
        usableSpace: usableSpace.value,
        heatingSpace: heatingSpace.value,
        street: street.value,
        zip: zip.value,
        city: city.value,
        province: province.value,
        country: country.value,
        countryCode: countryCode.value
      };
    })
    .catch((err) => {
      console.error('Fehler beim Aktualisieren des Gebäudes:', err);
    });
};

const cancel = () => {
  router.push(`/project/${props.projectId}/units`);
};
</script>

<template>
  <div class="col-span-12">
    <h5>{{ t('building.update', { id: props.buildingId }) }}</h5>
    <div class="card-container">
      <Card>
        <template #title>
          <h4>{{ t('building.details') }}</h4>
        </template>
        <template #content>
          <div class="p-fluid formgrid grid grid-cols-12 gap-4">
            <div class="input-container col-span-12">
              <label class="label" for="title">{{ t('building.title') }} <span class="required-field">*</span></label>
              <InputText id="title" v-model="title" type="text" :class="{ 'p-invalid': errors.title }" />
              <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
            </div>

            <div class="input-container col-span-12">
              <label class="label" for="description">{{ t('building.description') }}</label>
              <Textarea id="description" v-model="description" class="no-resize" rows="4" />
            </div>

            <div class="input-container col-span-12">
              <label class="label" for="location">{{ t('building.location') }}</label>
              <InputText id="location" v-model="location" type="text" />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="livingSpace">{{ t('building.livingSpace') }}</label>
              <InputText id="livingSpace" v-model="livingSpace" type="number" />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="commercialSpace">{{ t('building.commercialSpace') }}</label>
              <InputText id="commercialSpace" v-model="commercialSpace" type="number" />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="usableSpace">{{ t('building.usableSpace') }}</label>
              <InputText id="usableSpace" v-model="usableSpace" type="number" />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="heatingSpace">{{ t('building.heatingSpace') }}</label>
              <InputText id="heatingSpace" v-model="heatingSpace" type="number" />
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>
          <h4>{{ t('property.address.title') }}</h4>
        </template>
        <template #content>
          <div class="p-fluid formgrid grid grid-cols-12 gap-4">
            <div class="input-container col-span-12">
              <label class="label" for="street">{{ t('property.address.street') }} <span class="required-field">*</span></label>
              <InputText id="street" v-model="street" type="text" :class="{ 'p-invalid': errors.street }" />
              <small v-if="errors.street" class="p-error">{{ errors.street }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="zip">{{ t('property.address.zip') }} <span class="required-field">*</span></label>
              <InputText id="zip" v-model="zip" type="text" :class="{ 'p-invalid': errors.zip }" />
              <small v-if="errors.zip" class="p-error">{{ errors.zip }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="city">{{ t('property.address.city') }} <span class="required-field">*</span></label>
              <InputText id="city" v-model="city" type="text" :class="{ 'p-invalid': errors.city }" />
              <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="province">{{ t('property.address.province') }} <span class="required-field">*</span></label>
              <InputText id="province" v-model="province" type="text" :class="{ 'p-invalid': errors.province }" />
              <small v-if="errors.province" class="p-error">{{ errors.province }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="country">{{ t('property.address.country') }} <span class="required-field">*</span></label>
              <InputText id="country" v-model="country" type="text" :class="{ 'p-invalid': errors.country }" />
              <small v-if="errors.country" class="p-error">{{ errors.country }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="countryCode">{{ t('property.address.countryCode') }}</label>
              <InputText
                id="countryCode"
                v-model="countryCode"
                type="text"
                style="text-transform: uppercase"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="buttons-container centered-buttons mt-4">
      <Button
        :disabled="!isModified"
        class="mr-2"
        icon="pi pi-check"
        :label="t('button.save')"
        @click="updateBuilding"
      />
      <Button
        class="p-button-secondary"
        icon="pi pi-times"
        :label="t('button.cancel')"
        @click="cancel"
      />
    </div>
  </div>
</template>

<style>
.text-right {
  text-align: right;
}

.no-resize {
  resize: none;
}

.card-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (width <= 768px) {
  .card-container {
    grid-template-columns: 1fr;
  }

  .buttons-container {
    grid-template-columns: 1fr;
  }
}

.buttons-container {
  display: grid;
  grid-template-columns: repeat(2, auto);
  justify-content: center;
  gap: 20px;
}

.input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.label {
  font-weight: 600;
  margin-bottom: 4px;
}

input,
textarea,
.p-inputtext,
.p-dropdown {
  padding: 6px;
  font-size: 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea:focus,
input:focus {
  border-color: #80bdff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 0.25);
}

.required-field {
  color: red;
  margin-left: 2px;
}

.p-invalid {
  border-color: #f44336;
}

.p-error {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
}
</style>
