<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useLayout } from '@/layout/composables/layout';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useI18n } from 'vue-i18n';

const props = withDefaults(defineProps<MenuItemProps>(), {
  item: () => ({}) as MenuItem,
  index: 0,
  root: true,
  parentItemKey: undefined,
});

const { t } = useI18n();

export interface MenuItem {
  label: string;
  icon: { type: 'pi' | 'fa'; name: string | [string, string] } | null;
  to: string | undefined;
  url: string | undefined;
  navigate: () => void;
  command: (event: object) => void;
  disabled: boolean;
  visible: boolean;
  class: string;
  target: string;
  items: MenuItem[];
}

interface MenuItemProps {
  item: MenuItem;
  index: number;
  root?: boolean;
  parentItemKey?: string | undefined;
}

const route = useRoute();
const { layoutState, setActiveMenuItem, onMenuToggle } = useLayout();

const isActiveMenu = ref<boolean>(false);
const itemKey = ref<string | undefined>(undefined);

onBeforeMount(() => {
  itemKey.value = props.parentItemKey
    ? props.parentItemKey + '-' + props.index
    : String(props.index);
});

const itemClick = (event: Event, item: MenuItem) => {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  const { overlayMenuActive, staticMenuMobileActive } = layoutState;

  if ((item.to || item.url) && (staticMenuMobileActive.value || overlayMenuActive.value)) {
    onMenuToggle();
  }

  if (item.command) {
    item.command({ originalEvent: event, item: item });
  }

  if (item.navigate) {
    item.navigate();
  }

  const foundItemKey = item.items
    ? isActiveMenu.value
      ? props.parentItemKey
      : itemKey.value
    : itemKey.value;
  setActiveMenuItem(foundItemKey);

  isActiveMenu.value =
    foundItemKey === itemKey.value || foundItemKey!.startsWith(itemKey.value + '-');
};

const checkActiveRoute = (item: MenuItem) => {
  return route.path === item.to;
};
</script>

<template>
  <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
    <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">
      {{ t(item.label) }}
    </div>
    <a
      v-if="(!item.to || item.items) && item.visible !== false"
      :class="item.class"
      :target="item.target"
      tabindex="0"
      @click="itemClick($event, item)"
    >
      <template v-if="item.icon">
        <i v-if="item.icon.type === 'pi'" :class="item.icon.name" class="layout-menuitem-icon"></i>
        <FontAwesomeIcon
          v-else-if="item.icon.type === 'fa'"
          :icon="item.icon.name"
          class="layout-menuitem-icon"
        />
      </template>
      <span class="layout-menuitem-text">{{ t(item.label) }}</span>
      <i v-if="item.items" class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
    </a>
    <RouterLink
      v-if="item.to && !item.items && item.visible !== false"
      :class="[item.class, { 'active-route': checkActiveRoute(item) }]"
      tabindex="0"
      :to="item.to"
      @click="itemClick($event, item)"
    >
      <template v-if="item.icon">
        <i v-if="item.icon.type === 'pi'" :class="item.icon.name" class="layout-menuitem-icon"></i>
        <FontAwesomeIcon
          v-else-if="item.icon.type === 'fa'"
          :icon="item.icon.name"
          class="layout-menuitem-icon"
        />
      </template>
      <span class="layout-menuitem-text">{{ t(item.label) }}</span>
      <i v-if="item.items" class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
    </RouterLink>
    <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
      <ul v-show="root ? true : isActiveMenu" class="layout-submenu">
        <app-menu-item
          v-for="(child, i) in item.items"
          :key="child.label"
          :index="i"
          :item="child"
          :parentItemKey="itemKey"
          :root="false"
        ></app-menu-item>
      </ul>
    </Transition>
  </li>
</template>
