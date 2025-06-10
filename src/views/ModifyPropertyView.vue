<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { propertyService } from '@/services/PropertyService';
import { tenancyService, type TenantItem } from '@/services/TenancyService';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const router = useRouter();
const { t } = useI18n();
const title = ref('');
const description = ref('');
const district = ref<string>('');
const corridor = ref<string>('');
const parcel = ref<string>('');
const landRegistry = ref<string>('');
const usageType = ref<string | null>(null);
const plotArea = ref<string | null>(null);
const street = ref('');
const zip = ref('');
const city = ref('');
const province = ref('');
const country = ref('');
const countryCode = ref('');
const tenant = ref<string>('');
const tenants = ref<TenantItem[]>([]);
const selectedTenant = ref<TenantItem | null>(null);

// Validation errors
const errors = ref<Record<string, string>>({});

const usageOptions = [
  { label: 'Keine Auswahl', value: null },
  { label: 'GF Wohnen', value: 'GF Wohnen' },
  { label: 'GF Handel und Dienstleistung', value: 'GF Handel und Dienstleistung' },
  { label: 'GF zu Versorgungsanlagen', value: 'GF zu Versorgungsanlagen' },
  { label: 'GF zu Entsorgungsanlagen', value: 'GF zu Entsorgungsanlagen' },
  { label: 'GF Gewerbe und Industrie', value: 'GF Gewerbe und Industrie' },
  { label: 'GF Land- und Forstwirtschaft', value: 'GF Land- und Forstwirtschaft' },
  { label: 'GF öffentliche Zwecke', value: 'GF öffentliche Zwecke' },
  { label: 'Bauplatz', value: 'Bauplatz' },
  { label: 'BF Abbauland Sand', value: 'BF Abbauland Sand' },
  { label: 'BF Abbauland Kies', value: 'BF Abbauland Kies' },
  { label: 'BF Abbauland Lehm, Ton, Mergel', value: 'BF Abbauland Lehm, Ton, Mergel' },
  { label: 'BF Abbauland Gestein', value: 'BF Abbauland Gestein' },
  { label: 'BF Abbauland Kohle, Torf', value: 'BF Abbauland Kohle, Torf' },
  { label: 'BF Halde', value: 'BF Halde' },
  { label: 'BF Lagerplatz', value: 'BF Lagerplatz' },
  { label: 'BF Versorgungsanlage', value: 'BF Versorgungsanlage' },
  { label: 'BF Entsorgungsanlage', value: 'BF Entsorgungsanlage' },
  {
    label: 'Abbauland, noch nicht aufgeschlüsselt',
    value: 'Abbauland, noch nicht aufgeschlüsselt',
  },
  { label: 'Sportfläche', value: 'Sportfläche' },
  { label: 'Kleingartenanlage', value: 'Kleingartenanlage' },
  { label: 'Wochenendgelände', value: 'Wochenendgelände' },
  { label: 'Andere Grünanlage', value: 'Andere Grünanlage' },
  { label: 'Campingplatz', value: 'Campingplatz' },
  {
    label: 'Erholungsfläche, noch nicht aufgeschlüsselt',
    value: 'Erholungsfläche, noch nicht aufgeschlüsselt',
  },
  { label: 'Straße', value: 'Straße' },
  { label: 'Weg', value: 'Weg' },
  { label: 'Platz', value: 'Platz' },
  { label: 'Bahngelände', value: 'Bahngelände' },
  { label: 'Flugplatz', value: 'Flugplatz' },
  { label: 'Verkehrsfläche Schiffsverkehr', value: 'Verkehrsfläche Schiffsverkehr' },
  {
    label: 'Verkehrsfläche, noch nicht aufgeschlüsselt',
    value: 'Verkehrsfläche, noch nicht aufgeschlüsselt',
  },
  { label: 'Grünland', value: 'Grünland' },
  { label: 'Ackerland', value: 'Ackerland' },
  { label: 'Gartenland', value: 'Gartenland' },
  { label: 'Moor', value: 'Moor' },
  { label: 'Heide', value: 'Heide' },
  { label: 'Weingarten', value: 'Weingarten' },
  { label: 'Obstanbaufläche', value: 'Obstanbaufläche' },
  { label: 'Brachland', value: 'Brachland' },
  { label: 'Laubwald', value: 'Laubwald' },
  { label: 'Nadelwald', value: 'Nadelwald' },
  { label: 'Mischwald', value: 'Mischwald' },
  { label: 'Gehölz', value: 'Gehölz' },
  {
    label: 'Waldfläche, noch nicht aufgeschlüsselt',
    value: 'Waldfläche, noch nicht aufgeschlüsselt',
  },
  { label: 'Fließgewässer', value: 'Fließgewässer' },
  { label: 'Kanal', value: 'Kanal' },
  { label: 'Hafen', value: 'Hafen' },
  { label: 'Bach, Graben', value: 'Bach, Graben' },
  { label: 'Stehendes Gewässer', value: 'Stehendes Gewässer' },
  { label: 'Sumpf', value: 'Sumpf' },
  {
    label: 'Wasserfläche, noch nicht aufgeschlüsselt',
    value: 'Wasserfläche, noch nicht aufgeschlüsselt',
  },
  { label: 'Militärisches Übungsgelände', value: 'Militärisches Übungsgelände' },
  { label: 'Anderes Übungsgelände', value: 'Anderes Übungsgelände' },
  { label: 'Schutzfläche', value: 'Schutzfläche' },
  { label: 'Historische Anlage', value: 'Historische Anlage' },
  { label: 'Friedhof', value: 'Friedhof' },
  { label: 'Unland', value: 'Unland' },
  { label: 'Nutzung noch nicht zugeordnet', value: 'Nutzung noch nicht zugeordnet' },
];

const originalValues = ref<{
  title: string;
  description: string;
  district: string;
  corridor: string;
  parcel: string;
  landRegistry: string;
  usageType: string | null;
  plotArea: string | null;
  tenant: string;
}>({
  title: '',
  description: '',
  district: '',
  corridor: '',
  parcel: '',
  landRegistry: '',
  usageType: null,
  plotArea: null,
  tenant: '',
});

onMounted(() => {
  if (props.unitId) {
    fetchPropertyDetails();
  }

  tenancyService.fetchTenantData().then((data) => {
    tenants.value = data;
  });
});

watch(selectedTenant, (newValue) => {
  if (newValue) {
    tenant.value = `${newValue.firstName} ${newValue.lastName}`;
  } else {
    tenant.value = '';
  }
});

const fetchPropertyDetails = () => {
  propertyService
    .getProperty(props.projectId, props.unitId)
    .then((property) => {
      title.value = property.title || '';
      description.value = property.description || '';
      district.value = property.district || '';
      corridor.value = property.corridor || '';
      parcel.value = property.parcel || '';
      landRegistry.value = property.landRegistry || '';
      usageType.value = property.usageType || null;
      plotArea.value =
        property.plotArea !== undefined && property.plotArea !== null
          ? String(property.plotArea)
          : null;
      tenant.value = property.tenant || '';

      if (property.tenant) {
        const [firstName, lastName] = property.tenant.split(' ');
        const foundTenant = tenants.value.find(
          (t) => t.firstName === firstName && t.lastName === lastName,
        );
        selectedTenant.value = foundTenant || null;
      }

      originalValues.value = {
        title: title.value,
        description: description.value,
        district: district.value,
        corridor: corridor.value,
        parcel: parcel.value,
        landRegistry: landRegistry.value,
        usageType: usageType.value,
        plotArea: plotArea.value,
        tenant: tenant.value,
      };
    })
    .catch((err) => {
      console.error('Fehler beim Laden der Objektdetails:', err);
    });
};

const isModified = computed(() => {
  return (
    title.value !== originalValues.value.title ||
    description.value !== originalValues.value.description ||
    district.value !== originalValues.value.district ||
    corridor.value !== originalValues.value.corridor ||
    parcel.value !== originalValues.value.parcel ||
    landRegistry.value !== originalValues.value.landRegistry ||
    usageType.value !== originalValues.value.usageType ||
    plotArea.value !== originalValues.value.plotArea ||
    tenant.value !== originalValues.value.tenant
  );
});

const validateForm = (): boolean => {
  errors.value = {};

  // Validate title (required)
  if (!title.value.trim()) {
    errors.value.title = t('validation.required');
  }

  // Validate description (required)
  if (!description.value.trim()) {
    errors.value.description = t('validation.required');
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

  // Validate tenant (required)
  if (!tenant.value.trim()) {
    errors.value.tenant = t('validation.required');
  }

  // Validate plotArea (required)
  if (!plotArea.value) {
    errors.value.plotArea = t('validation.required');
  }

  return Object.keys(errors.value).length === 0;
};

const updateProperty = () => {
  if (!validateForm()) {
    return;
  }

  propertyService
    .updateProperty(props.projectId, props.unitId, {
      title: title.value,
      description: description.value,
      district: district.value || '',
      corridor: corridor.value || '',
      parcel: parcel.value || '',
      landRegistry: landRegistry.value || '',
      usageType: usageType.value ?? null,
      plotArea: plotArea.value ? Number(plotArea.value) : 0,
      usable_space: plotArea.value ? Number(plotArea.value) : 0,
      tenant: tenant.value || '',
      street: street.value || '',
      zip: zip.value || '',
      city: city.value || '',
      province: province.value || '',
      country: country.value || '',
      countryCode: countryCode.value || '',
      effective_space: 0,
    })
    .then(() => {
      // Redirect to PropertyDetailView instead of RentableUnitsView
      router.push({
        name: 'PropertyDetailView',
        params: { projectId: props.projectId, unitId: props.unitId },
      });
    })
    .catch((err) => {
      console.error('Fehler beim Aktualisieren des Eigentums:', err);
    });
};

const cancel = () => {
  router.push(`/project/${props.projectId}/units`);
};
</script>

<template>
  <div class="col-span-12">
    <h5>{{ t('property.update', { id: props.unitId }) }}</h5>
    <div class="card-container">
      <Card>
        <template #title>
          <h4>{{ t('property.details') }}</h4>
        </template>
        <template #content>
          <div class="p-fluid formgrid grid grid-cols-12 gap-4">
            <div class="input-container col-span-12">
              <label class="label" for="title"
                >{{ t('property.title') }} <span class="required-field">*</span></label
              >
              <InputText
                id="title"
                v-model="title"
                type="text"
                :class="{ 'p-invalid': errors.title }"
              />
              <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
            </div>

            <div class="input-container col-span-12">
              <label class="label" for="description"
                >{{ t('property.description') }} <span class="required-field">*</span></label
              >
              <Textarea
                id="description"
                v-model="description"
                class="no-resize"
                rows="4"
                :class="{ 'p-invalid': errors.description }"
              />
              <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="district">{{ t('property.district') }}</label>
              <InputText id="district" v-model="district" type="text" />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="corridor">{{ t('property.corridor') }}</label>
              <InputText id="corridor" v-model="corridor" type="text" />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="parcel">{{ t('property.parcel') }}</label>
              <InputText id="parcel" v-model="parcel" type="text" />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="landRegistry">{{ t('property.landRegister') }}</label>
              <InputText id="landRegistry" v-model="landRegistry" type="text" />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="plotArea"
                >Fläche (m²) <span class="required-field">*</span></label
              >
              <InputText
                id="plotArea"
                v-model="plotArea"
                type="number"
                :class="{ 'p-invalid': errors.plotArea }"
              />
              <small v-if="errors.plotArea" class="p-error">{{ errors.plotArea }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="usageType">{{ t('property.usageType') }}</label>
              <Dropdown
                id="usageType"
                v-model="usageType"
                :options="usageOptions"
                class="w-full"
                filter
                filterPlaceholder="Tippen Sie, um zu suchen..."
                optionLabel="label"
              />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="selectedTenant"
                >{{ t('rentableUnits.table.tenant') }} <span class="required-field">*</span></label
              >
              <Dropdown
                id="selectedTenant"
                v-model="selectedTenant"
                :options="tenants"
                optionLabel="lastName"
                placeholder="Mieter auswählen"
                class="w-full"
                :class="{ 'p-invalid': errors.tenant }"
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
              <small v-if="errors.tenant" class="p-error">{{ errors.tenant }}</small>
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
              <label class="label" for="street"
                >{{ t('property.address.street') }} <span class="required-field">*</span></label
              >
              <InputText
                id="street"
                v-model="street"
                type="text"
                :class="{ 'p-invalid': errors.street }"
              />
              <small v-if="errors.street" class="p-error">{{ errors.street }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="zip"
                >{{ t('property.address.zip') }} <span class="required-field">*</span></label
              >
              <InputText id="zip" v-model="zip" type="text" :class="{ 'p-invalid': errors.zip }" />
              <small v-if="errors.zip" class="p-error">{{ errors.zip }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="city"
                >{{ t('property.address.city') }} <span class="required-field">*</span></label
              >
              <InputText
                id="city"
                v-model="city"
                type="text"
                :class="{ 'p-invalid': errors.city }"
              />
              <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="province"
                >{{ t('property.address.province') }} <span class="required-field">*</span></label
              >
              <InputText
                id="province"
                v-model="province"
                type="text"
                :class="{ 'p-invalid': errors.province }"
              />
              <small v-if="errors.province" class="p-error">{{ errors.province }}</small>
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="country"
                >{{ t('property.address.country') }} <span class="required-field">*</span></label
              >
              <InputText
                id="country"
                v-model="country"
                type="text"
                :class="{ 'p-invalid': errors.country }"
              />
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
        @click="updateProperty"
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
