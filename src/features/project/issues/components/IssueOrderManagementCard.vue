<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import BaseCard from '@/components/common/BaseCard.vue';
import QuotationRequestTable from './QuotationRequestTable.vue';
import QuoteTable from './QuoteTable.vue';
import OrderTable from './OrderTable.vue';

defineProps<{ projectId: string; issueId: string }>();

const { t } = useI18n();
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('issueOrderManagement.card.title') }}
    </template>
    <template #content>
      <Tabs value="quotationRequests">
        <TabList>
          <Tab value="quotationRequests">{{ t('issueOrderManagement.tabs.quotationRequests') }}</Tab>
          <Tab value="quotations">{{ t('issueOrderManagement.tabs.quotations') }}</Tab>
          <Tab value="orders">{{ t('issueOrderManagement.tabs.orders') }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="quotationRequests">
            <QuotationRequestTable :projectId="projectId" :issueId="issueId" />
          </TabPanel>
          <TabPanel value="quotations">
            <QuoteTable :issueId="issueId" />
          </TabPanel>
          <TabPanel value="orders">
            <OrderTable />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </template>
  </BaseCard>
</template>
