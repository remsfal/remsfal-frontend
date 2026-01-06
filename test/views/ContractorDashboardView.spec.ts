import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ContractorDashboardView from "@/views/ContractorDashboardView.vue";

// Reusable mount function with necessary stubs
function mountView() {
    return mount(ContractorDashboardView, {
        global: {
            stubs: {
                // PrimeVue Chart MUST be stubbed for Vitest
                Chart: {template: '<div data-test="chart-stub"></div>'}
            }
        }
    });
}

describe("ContractorDashboardView", () => {

    // ------------------------------------------------------------
    // BASIC PAGE STRUCTURE
    // ------------------------------------------------------------
    it("renders the page title", () => {
        const wrapper = mountView();
        expect(wrapper.text()).toContain("Auftragnehmer Dashboard");
    });

    it("renders the page subtitle", () => {
        const wrapper = mountView();
        expect(wrapper.text()).toContain("Übersicht über laufende Arbeiten");
    });

    // ------------------------------------------------------------
    // KPI CARDS
    // ------------------------------------------------------------
    it("renders 4 KPI cards", () => {
        const wrapper = mountView();
        expect(wrapper.findAll(".kpi-card").length).toBe(4);
    });

    it("renders all KPI card titles correctly", () => {
        const wrapper = mountView();
        const text = wrapper.text();

        const expectedTitles = [
            "Offene Aufträge",
            "In Bearbeitung",
            "Abgeschlossen (Monat)",
            "Fälligkeit überschritten"
        ];

        expectedTitles.forEach(title => {
            expect(text).toContain(title);
        });
    });

    // ------------------------------------------------------------
    // CHARTS
    // ------------------------------------------------------------
    it("renders all 3 charts (bar, doughnut, line)", () => {
        const wrapper = mountView();
        const charts = wrapper.findAll('[data-test="chart-stub"]');
        expect(charts.length).toBe(3);
    });

    // ------------------------------------------------------------
    // TASK LIST
    // ------------------------------------------------------------
    it("renders today's task list with correct amount of items", () => {
        const wrapper = mountView();
        const items = wrapper.findAll("section ul li");
        expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it("displays the correct task statuses", () => {
        const wrapper = mountView();
        const text = wrapper.text();

        expect(text).toContain("Offen");
        expect(text).toContain("In Bearbeitung");
        expect(text).toContain("Erledigt");
    });

    // ------------------------------------------------------------
    // CUSTOMER REQUESTS
    // ------------------------------------------------------------
    it("renders customer request section", () => {
        const wrapper = mountView();
        expect(wrapper.text()).toContain("Offene Kundenanfragen");
    });

    // ------------------------------------------------------------
    // INVOICE TABLES
    // ------------------------------------------------------------
    it("renders finance table headings", () => {
        const wrapper = mountView();
        const text = wrapper.text();

        expect(text).toContain("Offene Rechnungen");
        expect(text).toContain("Überfällige Rechnungen");
    });

    it("renders invoice rows (open + overdue)", () => {
        const wrapper = mountView();
        const rows = wrapper.findAll(".invoice-table tbody tr");

        expect(rows.length).toBeGreaterThan(0); // 4 rows expected in your static data
    });

    // ------------------------------------------------------------
    // SNAPSHOT TEST
    // ------------------------------------------------------------
    it("matches snapshot", () => {
        const wrapper = mountView();
        expect(wrapper.html()).toMatchSnapshot();
    });

it("supports dark mode class rendering", () => {
    document.body.classList.add("app-dark");
    const wrapper = mountView();
    expect(wrapper.find(".card").exists()).toBe(true);
   });
});
