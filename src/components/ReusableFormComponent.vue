<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';

const props = defineProps<{
  headline?: string; // Optional headline text
  saveButtonText?: string; // Text for the save button
  cancelButtonText?: string; // Text for the cancel button
  fields: {
    name: string; // Field key
    label: string; // Label for the field
    type: 'text' | 'textarea' | 'checkbox' | 'select'; // Input type
    options?: any[]; // For dropdowns
    required?: boolean; // Is this field required
    validations?: ((value: any) => string | null)[]; // Array of validation functions
  }[];
  initialValues?: Record<string, any>; // Initial form values
  onSubmit?: (values: Record<string, any>) => void; // Submit handler
  onCancel?: () => void; // Cancel handler
}>();

const emit = defineEmits<{
  (e: 'update:values', value: Record<string, any>): void;
  (e: 'submit', value: Record<string, any>): void;
  (e: 'cancel'): void;
}>();

const formValues = ref({ ...props.initialValues });
const validationErrors = ref<Record<string, string>>({});

// make sure the form values are updated when the initial values change upon prop change
watch(
  () => props.initialValues,
  (newValues) => {
    formValues.value = { ...newValues };
    validationErrors.value = {}; // Clear any existing validation errors
  },
  { deep: true, immediate: true }
);


// Compute whether the form is valid
const isFormValid = computed(() => Object.keys(validationErrors.value).length === 0);

// Detect if any values have changed from the initial state
const isChanged = computed(() => {
  return JSON.stringify(formValues.value) !== JSON.stringify(props.initialValues);
});

// Validate a single field
const validateField = (field: typeof props.fields[0]) => {
  const value = formValues.value[field.name];
  const errors: string[] = [];

  // Check if required
  if (field.required && !value) {
    errors.push(`${field.label} is required.`);
  }

  // Run additional validation rules
  if (field.validations && value) {

  }

  // Update validation errors for the field
  if (errors.length > 0) {
    validationErrors.value[field.name] = errors.join(' ');
  } else {
    delete validationErrors.value[field.name];
  }
};

// Validate the entire form
const validateForm = () => {
  props.fields.forEach((field) => validateField(field));
};

watch(formValues, (newValue) => {
  emit('update:values', newValue);
}, { deep: true });

// Submit handler
const handleSubmit = () => {
  validateForm();
  if (isFormValid.value) {
    if (props.onSubmit) props.onSubmit(formValues.value);
    emit('submit', formValues.value);
  }
};

// Cancel handler
const handleCancel = () => {
  if (props.onCancel) props.onCancel();
  emit('cancel');
};
</script>

<template>
  <div class="form-container">
    <h2 v-if="headline">{{ headline }}</h2>
    <div class="form-fields">
      <div
        v-for="field in fields"
        :key="field.name"
        class="field"
      >
        <label :for="field.name">{{ field.label }}</label>
        <br>

        <!-- Text Field -->
        <InputText
          v-if="field.type === 'text'"
          :id="field.name"
          v-model="formValues[field.name]"
          :name="field.name"
          @blur="validateField(field)"
        />

        <!-- Textarea -->
        <Textarea
          v-else-if="field.type === 'textarea'"
          :id="field.name"
          v-model="formValues[field.name]"
          rows="4"
          class="no-resize"
          :name="field.name"
          @blur="validateField(field)"
        />

        <!-- Checkbox -->
        <Checkbox
          v-else-if="field.type === 'checkbox'"
          :id="field.name"
          v-model="formValues[field.name]"
          :name="field.name"
          @blur="validateField(field)"
        />

        <!-- Dropdown -->
        <Select
          v-else-if="field.type === 'select'"
          :id="field.name"
          v-model="formValues[field.name]"
          :options="field.options"
          optionValue="value"
          optionLabel="label"
          :name="field.name"
          @change="validateField(field)"
        />
        <br>
        <!-- Validation Error Messages -->
        <span v-if="validationErrors[field.name]" class="error-message">
          {{ validationErrors[field.name] }}
        </span>
      </div>
    </div>

    <div class="form-actions">
      <Button
        :label="cancelButtonText || 'Cancel'"
        class="p-button-secondary"
        @click="handleCancel"
      />
      <Button
        :label="saveButtonText || 'Save'"
        :disabled="!isChanged || !isFormValid"
        class="p-button-primary"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<style>
.form-container {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 600px;
  margin: 0 auto;
}

.form-fields {
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.error-message {
  color: red;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.no-resize {
  resize: none;
}
</style>