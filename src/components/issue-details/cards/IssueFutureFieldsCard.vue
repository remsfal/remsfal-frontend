<script setup lang="ts">
import Card from 'primevue/card';
import Badge from 'primevue/badge';
</script>

<template>
  <Card class="border-2 border-dashed border-gray-300">
    <template #title>
      <div class="flex items-center gap-2">
        <span>Future Fields</span>
        <Badge value="Placeholder" severity="secondary" size="small" />
      </div>
    </template>
    <template #content>
      <div class="flex flex-col gap-6">
        <!-- Attachments -->
        <div>
          <h4 class="font-semibold mb-3 text-gray-700">📎 Attachments</h4>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
              <div class="flex items-center gap-2">
                <i class="pi pi-file text-blue-500"></i>
                <span>screenshot-login-error.png</span>
                <span class="text-xs text-gray-500">(245 KB)</span>
              </div>
              <span class="text-xs text-gray-500">Uploaded: 2024-12-01</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
              <div class="flex items-center gap-2">
                <i class="pi pi-file-pdf text-red-500"></i>
                <span>error-logs.pdf</span>
                <span class="text-xs text-gray-500">(1.2 MB)</span>
              </div>
              <span class="text-xs text-gray-500">Uploaded: 2024-12-02</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
              <div class="flex items-center gap-2">
                <i class="pi pi-file text-green-500"></i>
                <span>session-trace.log</span>
                <span class="text-xs text-gray-500">(89 KB)</span>
              </div>
              <span class="text-xs text-gray-500">Uploaded: 2024-12-05</span>
            </div>
          </div>
        </div>

        <!-- Time Tracking -->
        <div>
          <h4 class="font-semibold mb-3 text-gray-700">⏱️ Time Tracking</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-blue-50 rounded">
              <span class="text-sm text-gray-600">Estimated</span>
              <p class="text-2xl font-bold text-blue-600">8h</p>
            </div>
            <div class="p-3 bg-green-50 rounded">
              <span class="text-sm text-gray-600">Logged</span>
              <p class="text-2xl font-bold text-green-600">5.5h</p>
            </div>
          </div>
          <div class="mt-3 text-sm">
            <p class="font-medium mb-2">Time Entries:</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Alice Johnson - 3h (Investigation)</li>
              <li>Jane Smith - 2.5h (Implementation)</li>
            </ul>
          </div>
        </div>

        <!-- Workflow Stage -->
        <div>
          <h4 class="font-semibold mb-3 text-gray-700">🔄 Workflow Stage</h4>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium">Stage 3 of 5:</span>
            <span class="text-primary">Development</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="flex-1 h-2 bg-green-500 rounded-l"></div>
            <div class="flex-1 h-2 bg-green-500"></div>
            <div class="flex-1 h-2 bg-blue-500"></div>
            <div class="flex-1 h-2 bg-gray-300"></div>
            <div class="flex-1 h-2 bg-gray-300 rounded-r"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Backlog</span>
            <span>Planning</span>
            <span>Development</span>
            <span>Testing</span>
            <span>Done</span>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <h4 class="font-semibold mb-3 text-gray-700">🏷️ Tags</h4>
          <div class="flex flex-wrap gap-2">
            <Badge value="bug" severity="danger" />
            <Badge value="mobile" severity="info" />
            <Badge value="authentication" severity="warn" />
            <Badge value="high-priority" severity="danger" />
            <Badge value="session-management" severity="secondary" />
          </div>
        </div>

        <!-- Custom Metadata -->
        <div>
          <h4 class="font-semibold mb-3 text-gray-700">📋 Custom Metadata</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">Affected Modules</span>
              <span class="text-sm font-medium">Auth, Session</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">Client Environment</span>
              <span class="text-sm font-medium">Mobile App v2.3.1</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">Severity Level</span>
              <span class="text-sm font-medium text-red-600">Critical</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">Browser Compatibility</span>
              <span class="text-sm font-medium">iOS Safari, Android Chrome</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">API Version</span>
              <span class="text-sm font-medium">v1.5.2</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
