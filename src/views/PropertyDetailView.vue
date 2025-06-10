<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { propertyService } from '@/services/PropertyService';
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
const tenant = ref('');

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
  { label: 'Abbauland, noch nicht aufgeschlüsselt', value: 'Abbauland, noch nicht aufgeschlüsselt' },
  { label: 'Sportfläche', value: 'Sportfläche' },
  { label: 'Kleingartenanlage', value: 'Kleingartenanlage' },
  { label: 'Wochenendgelände', value: 'Wochenendgelände' },
  { label: 'Andere Grünanlage', value: 'Andere Grünanlage' },
  { label: 'Campingplatz', value: 'Campingplatz' },
  { label: 'Erholungsfläche, noch nicht aufgeschlüsselt', value: 'Erholungsfläche, noch nicht aufgeschlüsselt' },
  { label: 'Straße', value: 'Straße' },
  { label: 'Weg', value: 'Weg' },
  { label: 'Platz', value: 'Platz' },
  { label: 'Bahngelände', value: 'Bahngelände' },
  { label: 'Flugplatz', value: 'Flugplatz' },
  { label: 'Verkehrsfläche Schiffsverkehr', value: 'Verkehrsfläche Schiffsverkehr' },
  { label: 'Verkehrsfläche, noch nicht aufgeschlüsselt', value: 'Verkehrsfläche, noch nicht aufgeschlüsselt' },
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
  { label: 'Waldfläche, noch nicht aufgeschlüsselt', value: 'Waldfläche, noch nicht aufgeschlüsselt' },
  { label: 'Fließgewässer', value: 'Fließgewässer' },
  { label: 'Kanal', value: 'Kanal' },
  { label: 'Hafen', value: 'Hafen' },
  { label: 'Bach, Graben', value: 'Bach, Graben' },
  { label: 'Stehendes Gewässer', value: 'Stehendes Gewässer' },
  { label: 'Sumpf', value: 'Sumpf' },
  { label: 'Wasserfläche, noch nicht aufgeschlüsselt', value: 'Wasserfläche, noch nicht aufgeschlüsselt' },
  { label: 'Militärisches Übungsgelände', value: 'Militärisches Übungsgelände' },
  { label: 'Anderes Übungsgelände', value: 'Anderes Übungsgelände' },
  { label: 'Schutzfläche', value: 'Schutzfläche' },
  { label: 'Historische Anlage', value: 'Historische Anlage' },
  { label: 'Friedhof', value: 'Friedhof' },
  { label: 'Unland', value: 'Unland' },
  { label: 'Nutzung noch nicht zugeordnet', value: 'Nutzung noch nicht zugeordnet' }
];

onMounted(() => {
  if (props.unitId) {
    fetchPropertyDetails();
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
      plotArea.value = property.plotArea !== undefined && property.plotArea !== null ? String(property.plotArea) : null;
      console.log('Property plotArea:', property.plotArea, 'Type:', typeof property.plotArea, 'Converted value:', plotArea.value);
      tenant.value = property.tenant || '';
      street.value = property.street || '';
      zip.value = property.zip || '';
      city.value = property.city || '';
      province.value = property.province || '';
      country.value = property.country || '';
      countryCode.value = property.countryCode || '';

      // Log the loaded data to help with debugging
      console.log('Loaded property details:', {
        title: title.value,
        description: description.value,
        district: district.value,
        corridor: corridor.value,
        parcel: parcel.value,
        landRegistry: landRegistry.value,
        usageType: usageType.value,
        plotArea: plotArea.value,
        tenant: tenant.value,
        street: street.value,
        zip: zip.value,
        city: city.value,
        province: province.value,
        country: country.value,
        countryCode: countryCode.value
      });
    })
    .catch((err) => {
      console.error('Fehler beim Laden der Objektdetails:', err);
    });
};

const navigateToEdit = () => {
  router.push({
    name: 'PropertyView',
    params: { projectId: props.projectId, unitId: props.unitId },
  });
};

const goBack = () => {
  router.push(`/project/${props.projectId}/units`);
};
</script>

<template>
  <div class="col-span-12">
    <h5>{{ t('property.view', { id: props.unitId }) }}</h5>
    <div class="card-container">
      <Card>
        <template #title>
          <h4>{{ t('property.details') }}</h4>
        </template>
        <template #content>
          <div class="p-fluid formgrid grid grid-cols-12 gap-4">
            <div class="input-container col-span-12">
              <label class="label" for="title">{{ t('property.title') }}</label>
              <InputText id="title" v-model="title" type="text" readonly />
            </div>

            <div class="input-container col-span-12">
              <label class="label" for="description">{{ t('property.description') }}</label>
              <Textarea id="description" v-model="description" class="no-resize" rows="4" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="district">{{ t('property.district') }}</label>
              <InputText id="district" v-model="district" type="text" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="corridor">{{ t('property.corridor') }}</label>
              <InputText id="corridor" v-model="corridor" type="text" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="parcel">{{ t('property.parcel') }}</label>
              <InputText id="parcel" v-model="parcel" type="text" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="landRegistry">{{ t('property.landRegister') }}</label>
              <InputText id="landRegistry" v-model="landRegistry" type="text" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="plotArea">Fläche (m²)</label>
              <InputText id="plotArea" v-model="plotArea" type="number" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="usageType">{{ t('property.usageType') }}</label>
              <Dropdown
                id="usageType"
                v-model="usageType"
                :options="usageOptions"
                class="w-full"
                optionLabel="label"
                disabled
              />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="tenant">{{ t('rentableUnits.table.tenant') }}</label>
              <InputText id="tenant" v-model="tenant" type="text" readonly />
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
              <label class="label" for="street">{{ t('property.address.street') }}</label>
              <InputText id="street" v-model="street" type="text" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="zip">{{ t('property.address.zip') }}</label>
              <InputText id="zip" v-model="zip" type="text" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="city">{{ t('property.address.city') }}</label>
              <InputText id="city" v-model="city" type="text" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="province">{{ t('property.address.province') }}</label>
              <InputText id="province" v-model="province" type="text" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="country">{{ t('property.address.country') }}</label>
              <InputText id="country" v-model="country" type="text" readonly />
            </div>

            <div class="input-container col-span-6">
              <label class="label" for="countryCode">{{ t('property.address.countryCode') }}</label>
              <InputText
                id="countryCode"
                v-model="countryCode"
                type="text"
                style="text-transform: uppercase"
                readonly
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="buttons-container centered-buttons mt-4">
      <Button
        class="mr-2"
        icon="pi pi-pencil"
        :label="t('button.edit')"
        @click="navigateToEdit"
      />
      <Button
        class="p-button-secondary"
        icon="pi pi-arrow-left"
        :label="t('button.back')"
        @click="goBack"
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

/* Read-only styling */
input[readonly],
textarea[readonly] {
  background-color: #f8f9fa;
  cursor: default;
}
</style>
