import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, inject, provide, toRef, type PropType, type Ref } from "vue";
import flushPromises from "flush-promises";
import ContractorTable from "@/components/ContractorTable.vue";
import type { Contractor } from "@/services/ContractorService";

vi.mock("@/services/ContractorService", () => ({
  contractorService: {
    getContractors: vi.fn(),
  },
}));

const { contractorService } = await import("@/services/ContractorService");

const PROJECT_ID = "p1";

type ContractorTableVm = {
  isLoading: boolean;
  contractors: Contractor[];
  showArchive: boolean;
  archiveState: Record<string, boolean>;
  toggleArchived: (id: string | undefined, value: boolean) => void;
  reload: () => Promise<void>;
};

const contractorsFixture: Contractor[] = [
  {
    id: "1",
    companyName: "Alpha",
    email: "alpha@mail.com",
    trade: "Dach",
    address: {
      street: "A",
      houseNumber: "10",
      city: "Berlin",
      zip: "11111",
    },
  } as Contractor,
  {
    id: "2",
    companyName: "Beta",
    email: "beta@mail.com",
    trade: "Maler",
    address: {
      street: "X",
      city: "Hamburg",
      zip: "22222",
    },
  } as Contractor,
  {
    id: "3",
    companyName: "Gamma",
    email: "",
    trade: "",
    address: undefined,
  } as Contractor,
];

type TableProps = { projectId?: string };

const DtRowsKey = Symbol("dt-rows");

const DataTableStub = defineComponent({
  props: {
    value: { type: Array as PropType<Contractor[]>, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    // ✅ reaktiv, damit ColumnStub nach API-Load Rows bekommt
    provide(DtRowsKey, toRef(props, "value"));

    return () =>
        h("div", { class: "datatable-stub", "data-loading": String(props.loading) }, [
          slots.default?.(),
          (props.value ?? []).map((row) =>
              h("div", { key: String(row.id), class: "row-stub" }, [slots.expansion?.({ data: row })]),
          ),
        ]);
  },
});

const ColumnStub = defineComponent({
  props: {
    header: { type: String, default: "" },
    field: { type: String, default: "" },
    expander: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const rowsRef = inject<Ref<Contractor[]>>(DtRowsKey, { value: [] } as Ref<Contractor[]>);

    return () =>
        h("div", { class: "column-stub", "data-header": props.header || props.field }, [
          (rowsRef.value ?? []).map((row) =>
              h("div", { key: String(row.id), class: "cell-stub" }, slots.body?.({ data: row }) ?? null),
          ),
        ]);
  },
});

const ButtonStub = defineComponent({
  props: {
    label: { type: String, default: "" },
    icon: { type: String, default: "" },
  },
  emits: ["click"],
  setup(props, { emit, attrs }) {
    const text = props.label || props.icon || String(attrs["aria-label"] ?? "") || "button";
    return () =>
        h(
            "button",
            {
              ...attrs,
              type: "button",
              class: "button-stub",
              onClick: () => emit("click"),
            },
            text,
        );
  },
});

const InputTextStub = defineComponent({
  props: {
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, attrs }) {
    return () =>
        h("input", {
          ...attrs,
          class: "inputtext-stub",
          value: props.modelValue,
          placeholder: props.placeholder,
          onInput: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).value),
        });
  },
});

const CheckboxStub = defineComponent({
  props: {
    modelValue: { type: Boolean, default: false },
    binary: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, attrs }) {
    return () =>
        h("input", {
          ...attrs,
          class: "checkbox-stub",
          type: "checkbox",
          checked: props.modelValue,
          onChange: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).checked),
        });
  },
});

const mountTable = (props: TableProps = { projectId: PROJECT_ID }) =>
    mount(ContractorTable, {
      props,
      global: {
        stubs: {
          DataTable: DataTableStub,
          Column: ColumnStub,
          Button: ButtonStub,
          InputText: InputTextStub,
          Checkbox: CheckboxStub,
          Transition: false,
        },
        directives: {
          tooltip: () => {},
        },
      },
    });

describe("ContractorTable.vue", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    (contractorService.getContractors as ReturnType<typeof vi.fn>).mockReset();
    (contractorService.getContractors as ReturnType<typeof vi.fn>).mockResolvedValue({
      contractors: contractorsFixture,
    });

    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("loads contractors on mount", async () => {
    const wrapper = mountTable();
    await flushPromises();

    const vm = wrapper.vm as unknown as ContractorTableVm;

    expect(contractorService.getContractors).toHaveBeenCalledWith(PROJECT_ID);
    expect(vm.contractors.length).toBe(3);
    expect(vm.isLoading).toBe(false);

    const text = wrapper.text();
    expect(text).toContain("Auftragnehmer gefunden");
    expect(text).toContain("Alpha");
    expect(text).toContain("Beta");
    expect(text).toContain("Gamma");
  });

  it("logs warning and does not call service when projectId is missing", async () => {
    const wrapper = mountTable({ projectId: undefined });
    await flushPromises();

    expect(contractorService.getContractors).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(wrapper.text()).toContain("0 Auftragnehmer gefunden");
  });

  it("handles service errors by logging and clearing list", async () => {
    (contractorService.getContractors as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("boom"));

    const wrapper = mountTable();
    await flushPromises();

    expect(errorSpy).toHaveBeenCalled();
    expect(wrapper.text()).toContain("0 Auftragnehmer gefunden");
  });

  it("updates list when projectId changes (covers watch)", async () => {
    const wrapper = mountTable({ projectId: "p1" });
    await flushPromises();

    await wrapper.setProps({ projectId: "p2" });
    await flushPromises();

    expect(contractorService.getContractors).toHaveBeenCalledWith("p2");
  });

  it("filters contractors via search (company/email/trade)", async () => {
    const wrapper = mountTable();
    await flushPromises();

    const input = wrapper.find("input.inputtext-stub");
    await input.setValue("beta");
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain("Beta");
    expect(text).not.toContain("Alpha");
    expect(text).not.toContain("Gamma");
  });

  it("toggles archive state and switches between active/archive lists", async () => {
    const wrapper = mountTable();
    await flushPromises();

    // ✅ Checkbox ist in Column #body → jetzt wird er gerendert
    const checkboxes = wrapper.findAll("input.checkbox-stub");
    expect(checkboxes.length).toBeGreaterThan(0);

    // Alpha archivieren
    await checkboxes[0].setValue(true);
    await flushPromises();

    // Aktiv-Ansicht: Alpha ist raus
    let text = wrapper.text();
    expect(text).not.toContain("Alpha");

    // Toolbar Button: Archiv anzeigen
    const toggleBtn = wrapper.findAll("button.button-stub").find((b) => b.text().includes("Archiv anzeigen"));
    expect(toggleBtn).toBeTruthy();

    await toggleBtn!.trigger("click");
    await flushPromises();

    // Archiv-Ansicht: Alpha wieder da + Adresse Branches
    text = wrapper.text();
    expect(text).toContain("archivierte Auftragnehmer gefunden");
    expect(text).toContain("Alpha");
    expect(text).toMatch(/A\s*10/);
    expect(text).toMatch(/11111\s+Berlin/);
    expect(text).toContain("Keine Adresse");
  });

  it("emits edit and delete when action buttons are clicked", async () => {
    const wrapper = mountTable();
    await flushPromises();

    const buttons = wrapper.findAll("button.button-stub");

    const editBtn = buttons.find((b) => b.text().includes("pi pi-pencil"));
    const delBtn = buttons.find((b) => b.text().includes("pi pi-trash"));

    expect(editBtn).toBeTruthy();
    expect(delBtn).toBeTruthy();

    await editBtn!.trigger("click");
    await delBtn!.trigger("click");

    const editEmits = wrapper.emitted("edit") ?? [];
    const deleteEmits = wrapper.emitted("delete") ?? [];

    expect(editEmits.length).toBe(1);
    expect(deleteEmits.length).toBe(1);

    expect((editEmits[0] as unknown[])[0]).toMatchObject({ companyName: "Alpha" });
    expect((deleteEmits[0] as unknown[])[0]).toMatchObject({ companyName: "Alpha" });
  });

  it("reloads contractors via exposed reload()", async () => {
    const wrapper = mountTable();
    await flushPromises();

    const vm = wrapper.vm as unknown as ContractorTableVm;

    await vm.reload();
    await flushPromises();

    expect(contractorService.getContractors).toHaveBeenCalledTimes(2);
  });
});
