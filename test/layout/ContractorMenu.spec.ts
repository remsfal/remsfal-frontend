import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, reactive, type PropType } from "vue";

type MenuNode = {
  label?: string;
  to?: string;
  items?: MenuNode[];
};

vi.mock("vue-i18n", () => ({useI18n: () => ({t: (key: string) => key,}),}));

const routerPush = vi.fn();

vi.mock("vue-router", async () => {
  const actual = await vi.importActual<typeof import("vue-router")>("vue-router");

  return {
    ...actual,
    useRouter: () => ({ push: routerPush }),
  };
});

const projectStoreState = reactive<{ projectId?: string }>({ projectId: undefined });

vi.mock("@/stores/ProjectStore", () => ({useProjectStore: () => projectStoreState,}));

vi.mock("@/stores/UserSession", () => ({useUserSessionStore: () => ({ user: { id: "u1" } }),}));

vi.mock("@/services/IssueService.ts", () => ({StatusValues: { OPEN: "OPEN" },}));

function flatten(node: MenuNode): MenuNode[] {
  const children = Array.isArray(node.items) ? node.items : [];
  const out: MenuNode[] = [];

  for (const child of children) {
    out.push(child, ...flatten(child));
  }

  return out;
}

const AppMenuItemStub = defineComponent({
  name: "AppMenuItemStub",
  props: {
    item: {
      type: Object as PropType<MenuNode>,
      required: true,
    },
    index: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  setup(props) {
    return () =>
        h(
            "ul",
            {},
            flatten(props.item).map((child) =>
                h("li", {
                  key: `${child.label ?? ""}|${child.to ?? ""}`,
                  class: "stub-menu-item",
                  "data-label": child.label ?? "",
                  "data-to": child.to ?? "",
                }),
            ),
        );
  },
});

function getContractorsTo(wrapper: ReturnType<typeof mount>) {
  const el = wrapper.find('[data-label="managerMenu.masterData.contractors"]');

  expect(el.exists()).toBe(true);
  return el.attributes("data-to");
}

async function mountFreshManagerMenu() {
  vi.resetModules();

  const { default: ManagerMenu } = await import("@/layout/ManagerMenu.vue");

  return mount(ManagerMenu, {global: {stubs: {AppMenuItem: AppMenuItemStub,},},});
}

describe("ContractorMenu.spec.ts", () => {
  beforeEach(() => {
    routerPush.mockClear();
    projectStoreState.projectId = undefined;
  });

  it('sets contractors link to "/" when projectId is undefined', async () => {
    projectStoreState.projectId = undefined;

    const wrapper = await mountFreshManagerMenu();
    await nextTick();

    expect(getContractorsTo(wrapper)).toBe("/");
  });

  it("sets contractors link to project route when projectId exists", async () => {
    projectStoreState.projectId = "p123";

    const wrapper = await mountFreshManagerMenu();
    await nextTick();

    expect(getContractorsTo(wrapper)).toBe("/projects/p123/contractors");
  });
});
