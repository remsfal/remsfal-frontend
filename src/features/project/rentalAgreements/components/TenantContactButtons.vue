<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import BaseDialog from '@/components/common/BaseDialog.vue';

const props = defineProps<{
  tenantId: string;
  tenantName?: string;
  email?: string;
  mobilePhoneNumber?: string;
  businessPhoneNumber?: string;
  privatePhoneNumber?: string;
  disabled?: boolean;
  deletable?: boolean;
}>();
const emit = defineEmits<{
  click: [];
  delete: [];
}>();

const { t } = useI18n();

const phoneOptions = computed(() => {
  const options: { label: string; value: string }[] = [];
  if (props.mobilePhoneNumber) options.push({ label: t('tenantDetail.form.mobile'), value: props.mobilePhoneNumber });
  if (props.businessPhoneNumber) {
    options.push({ label: t('tenantDetail.form.business'), value: props.businessPhoneNumber });
  }
  if (props.privatePhoneNumber) options.push({ label: t('tenantDetail.form.private'), value: props.privatePhoneNumber });
  return options;
});

const hasPhoneNumbers = computed(() => phoneOptions.value.length > 0);
const phoneActionable = computed(() => !props.disabled && hasPhoneNumbers.value);
const emailActionable = computed(() => !props.disabled && !!props.email);

const deleteconfirm = ref(false);
</script>

<template>
  <div class="flex gap-2">
    <!-- Phone: one button per available number, labeled with its type -->
    <template v-if="!hasPhoneNumbers">
      <Button
        icon="pi pi-phone"
        severity="secondary"
        size="small"
        outlined
        class="!text-black"
        :disabled="!phoneActionable"
        :aria-label="t('tenantList.card.callButton')"
        @click.stop
      />
    </template>
    <template v-else>
      <Button
        v-for="option in phoneOptions"
        :key="option.value"
        as="a"
        :href="`tel:${option.value}`"
        icon="pi pi-phone"
        :label="`${option.label}: ${option.value}`"
        severity="secondary"
        size="small"
        outlined
        class="!text-black"
        :aria-label="`${t('tenantList.card.callButton')} ${option.label}`"
        @click.stop
      />
    </template>

    <!-- Email -->
    <Button
      :as="emailActionable ? 'a' : 'button'"
      :href="emailActionable ? `mailto:${email}` : undefined"
      icon="pi pi-envelope"
      :label="email"
      severity="secondary"
      size="small"
      outlined
      class="!text-black"
      :disabled="!emailActionable"
      :aria-label="t('tenantList.card.messageButton')"
      @click.stop
    />

    <Button
      v-if="deletable"
      icon="pi pi-trash"
      severity="danger"
      size="small"
      text
      aria-label="Löschen"
      @click.stop="deleteconfirm = true"
    />

    <BaseDialog
      v-model:visible="deleteconfirm"
      :header="t('projectTenancies.dialog.confirmationTitle')"
      :closable="false"
      @click.stop
    >
      <p>{{ t('tenantList.card.confirmRemove', { name: tenantName }) }}</p>
      <div class="flex justify-end gap-2 mt-6">
        <Button
          :label="t('button.cancel')"
          severity="secondary"
          type="button"
          @click="deleteconfirm = false"
        />
        <Button
          :label="t('button.delete')"
          icon="pi pi-trash"
          severity="danger"
          type="button"
          @click="emit('delete')"
        />
      </div>
    </BaseDialog>
  </div>
</template>
