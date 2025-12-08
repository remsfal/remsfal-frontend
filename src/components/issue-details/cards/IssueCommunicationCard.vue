<script setup lang="ts">
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import UserAvatar from '@/components/issue-details/user/UserAvatar.vue';
import MemberRoleBadge from '@/components/issue-details/badges/MemberRoleBadge.vue';
</script>

<template>
  <Card>
    <template #title>Communication</template>
    <template #content>
      <TabView>
        <!-- Comments Tab -->
        <TabPanel header="Comments">
          <div class="flex flex-col gap-4">
            <!-- Comment 1 -->
            <div class="flex gap-3 p-3 border rounded">
              <UserAvatar name="Alice Johnson" color="bg-green-500" />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-semibold">Alice Johnson</span>
                  <MemberRoleBadge role="STAFF" />
                  <span class="text-sm text-gray-500">2024-12-07 2:30 PM</span>
                </div>
                <p class="text-sm">
                  I've investigated this issue and it appears to be related to the session token expiration logic. 
                  The mobile app is not properly refreshing the token before it expires.
                </p>
              </div>
            </div>

            <!-- Comment 2 -->
            <div class="flex gap-3 p-3 border rounded">
              <UserAvatar name="Bob Williams" color="bg-orange-500" />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-semibold">Bob Williams</span>
                  <MemberRoleBadge role="MANAGER" />
                  <span class="text-sm text-gray-500">2024-12-08 9:00 AM</span>
                </div>
                <p class="text-sm">
                  Thanks for the analysis, Alice. I've assigned this to Jane who can work on the token refresh logic. 
                  This is blocking several other issues so let's prioritize it.
                </p>
              </div>
            </div>

            <!-- Add Comment Form (non-functional) -->
            <div class="flex flex-col gap-2 mt-4">
              <Textarea 
                placeholder="Write a comment..." 
                rows="3" 
                class="w-full"
                disabled
              />
              <div class="flex justify-end">
                <Button label="Post" icon="pi pi-send" size="small" disabled />
              </div>
              <span class="text-xs text-gray-500 text-right">Note: Comment functionality is non-functional (placeholder only)</span>
            </div>
          </div>
        </TabPanel>

        <!-- Activity Log Tab -->
        <TabPanel header="Activity Log">
          <div class="flex flex-col gap-3">
            <!-- Activity 1 -->
            <div class="flex gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
              <i class="pi pi-arrow-right text-blue-500 mt-1"></i>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-sm">Status Changed</span>
                  <span class="text-xs text-gray-500">2024-12-07 10:00 AM</span>
                </div>
                <p class="text-sm">
                  <span class="font-medium">John Doe</span> changed status from 
                  <span class="font-mono bg-gray-200 px-1 rounded">OPEN</span> to 
                  <span class="font-mono bg-yellow-200 px-1 rounded">IN_PROGRESS</span>
                </p>
              </div>
            </div>

            <!-- Activity 2 -->
            <div class="flex gap-3 p-3 border-l-4 border-purple-500 bg-purple-50">
              <i class="pi pi-user text-purple-500 mt-1"></i>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-sm">Owner Changed</span>
                  <span class="text-xs text-gray-500">2024-12-08 9:05 AM</span>
                </div>
                <p class="text-sm">
                  <span class="font-medium">Bob Williams</span> assigned this issue to 
                  <span class="font-medium">Jane Smith</span>
                </p>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </template>
  </Card>
</template>
