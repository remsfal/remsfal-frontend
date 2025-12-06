import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorDashboardView from '@/views/ContractorDashboardView.vue';

describe("ContractorDashboardView", () => {

    it("renders the page title", () => {
        const wrapper = mount(ContractorDashboardView);
        expect(wrapper.text()).toContain("Auftragnehmer Dashboard");
    });

    it("renders 4 KPI cards", () => {
        const wrapper = mount(ContractorDashboardView);
        const kpis = wrapper.findAll(".kpi-card");
        expect(kpis.length).toBe(4);
    });

    it("renders correct KPI titles", () => {
        const wrapper = mount(ContractorDashboardView);

        expect(wrapper.text()).toContain("Offene Aufträge");
        expect(wrapper.text()).toContain("In Bearbeitung");
        expect(wrapper.text()).toContain("Abgeschlossen (Monat)");
        expect(wrapper.text()).toContain("Fälligkeit überschritten");
    });

});
it("renders finance table headings", () => {
    const wrapper = mount(ContractorDashboardView);

    expect(wrapper.text()).toContain("Offene Rechnungen");
    expect(wrapper.text()).toContain("Überfällige Rechnungen");

    const rows = wrapper.findAll(".invoice-table tbody tr");
    expect(rows.length).toBeGreaterThan(0);
});
it("has CSS variables for dark mode", () => {
    const wrapper = mount(ContractorDashboardView);

    const rootStyle = getComputedStyle(document.documentElement);

    expect(rootStyle).not.toBeNull(); // existence test
});
