import { mount } from "@vue/test-utils";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { nextTick, reactive } from "vue";

const pushMock = vi.fn();

const projectStore = reactive<{ projectId?: string }>({ projectId: "p1" });
const sessionStore = reactive<{ user?: { id: string } }>({ user: { id: "u1" } });

vi.mock("vue-router", () => ({useRouter: () => ({ push: pushMock }),}));

vi.mock("@/stores/ProjectStore", () => ({useProjectStore: () => projectStore,}));

vi.mock("@/stores/UserSession", () => ({useUserSessionStore: () => sessionStore,}));

vi.mock("@/services/IssueService.ts", () => ({StatusValues: { OPEN: "OPEN" },}));

async function mountMenu() {
    // 🔥 wichtig: wenn ManagerMenu schon irgendwo importiert wurde, Cache leeren
    vi.resetModules();

    const ManagerMenu = (await import("@/layout/ManagerMenu.vue")).default;

    return mount(ManagerMenu, {global: {stubs: {AppMenuItem: true,},},});
}

describe("ManagerMenu", () => {
    beforeEach(() => {
        pushMock.mockClear();
        projectStore.projectId = "p1";
        sessionStore.user = { id: "u1" };
    });

    it("builds links with projectId and navigates correctly", async () => {
        const wrapper = await mountMenu();
        await nextTick();

        const model = (wrapper.vm as any).model as any[];
        const home = model.find((s) => s.label === "managerMenu.home");

        expect(home.items[0].to).toBe("/projects/p1/dashboard");
        expect(home.items[1].to).toBe("/projects/p1/settings");
    });

    it("updates menu when projectId changes (covers watch update)", async () => {
        const wrapper = await mountMenu();
        await nextTick();

        projectStore.projectId = "p2";
        await nextTick();

        const model = (wrapper.vm as any).model as any[];
        const home = model.find((s) => s.label === "managerMenu.home");

        expect(home.items[0].to).toBe("/projects/p2/dashboard");
    });
});
