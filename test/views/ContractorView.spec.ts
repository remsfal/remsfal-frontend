/* eslint-disable vue/one-component-per-file */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import type { ComponentPublicInstance } from "vue";
import ContractorView from "@/views/ContractorView.vue";

const PROJECT_ID = "project-123";

vi.mock("@/services/ContractorService", () => ({
  contractorService: {
    createContractor: vi.fn(),
    updateContractor: vi.fn(),
    deleteContractor: vi.fn(),
  },
}));

const { contractorService } = await import("@/services/ContractorService");

type ContractorAddressForm = {
  street: string;
  city: string;
  province?: string;
  zip: string;
  countryCode?: string;
};

type ContractorForm = {
  companyName: string;
  email: string;
  phone?: string;
  trade?: string;
  address: ContractorAddressForm;
};

type ContractorViewVm = ComponentPublicInstance & {
  showDialog: boolean;
  isEditMode: boolean;
  currentContractor: {
    id?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    trade?: string;
    address?: {
      street?: string;
      city?: string;
      province?: string;
      zip?: string;
      countryCode?: string;
    };
  } | null;
  form: ContractorForm;
  globalError: string | null;
  showErrors: boolean;
  openCreateDialog: () => void;
  submitForm: () => Promise<void>;
  deleteContractor: (contractor: { id?: string; companyName?: string }) => Promise<void>;
};

const makeMount = (projectId = PROJECT_ID) => {
  const reloadMock = vi.fn();

  const ContractorTableStub = defineComponent({
    name: "ContractorTableStub",
    emits: ["edit", "delete"],
    setup(_, { expose }) {
      expose({ reload: reloadMock });
      return () => h("div", { class: "contractor-table-stub" });
    },
  });

  const DialogStub = defineComponent({
    name: "DialogStub",
    props: {
      visible: { type: Boolean, required: false },
      header: { type: String, required: false },
    },
    emits: ["update:visible"],
    setup(props, { slots }) {
      return () =>
          props.visible
              ? h("div", { class: "dialog-stub" }, [
                h("div", { class: "dialog-header" }, props.header ?? ""),
                slots.default?.(),
                slots.footer?.(),
              ])
              : null;
    },
  });

  const InputTextStub = defineComponent({
    name: "InputTextStub",
    inheritAttrs: false,
    props: {
      modelValue: {
 type: String, required: false, default: "" 
},
      inputId: {
 type: String, required: false, default: "" 
},
      class: {
 type: [String, Object, Array], required: false, default: "" 
},
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
      return () =>
          h("input", {
            id: props.inputId || undefined,
            value: props.modelValue,
            class: props.class,
            onInput: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).value),
          });
    },
  });

  const ButtonStub = defineComponent({
    name: "ButtonStub",
    props: { label: { type: String, required: false } },
    emits: ["click"],
    setup(props, { emit }) {
      return () =>
          h(
              "button",
              {
                type: "button",
                onClick: () => emit("click"),
              },
              props.label ?? "Button",
          );
    },
  });

  const wrapper = mount(ContractorView, {
    props: { projectId },
    global: {
      stubs: {
        Card: { template: "<div><slot name=\"title\" /><slot name=\"content\" /></div>" },
        Dialog: DialogStub,
        InputText: InputTextStub,
        Button: ButtonStub,
        ContractorTable: ContractorTableStub,
      },
    },
  });

  return { wrapper, reloadMock };
};

const fillRequiredFormViaInputs = async (wrapper: VueWrapper) => {
  const vm = wrapper.vm as ContractorViewVm;
  vm.openCreateDialog();
  await nextTick();

  await wrapper.find("input#companyName").setValue(" ACME ");
  await wrapper.find("input#email").setValue("  acme@test.de ");
  await wrapper.find("input#street").setValue("  Straße 1 ");
  await wrapper.find("input#zip").setValue(" 12345 ");
  await wrapper.find("input#city").setValue("  Berlin ");
};

describe("ContractorView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("does nothing on submit when projectId is falsy", async () => {
    const { wrapper } = makeMount("");
    const vm = wrapper.vm as ContractorViewVm;

    vm.openCreateDialog();
    await nextTick();

    await wrapper.find("input#companyName").setValue("ACME");
    await wrapper.find("input#email").setValue("acme@test.de");
    await wrapper.find("input#street").setValue("Street");
    await wrapper.find("input#zip").setValue("12345");
    await wrapper.find("input#city").setValue("Berlin");

    (contractorService.createContractor as Mock).mockResolvedValue({});
    await vm.submitForm();

    expect(contractorService.createContractor).not.toHaveBeenCalled();
  });

  it("shows missing required fields error and does not call API", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    vm.openCreateDialog();
    await nextTick();

    await vm.submitForm();

    expect(contractorService.createContractor).not.toHaveBeenCalled();
    expect(vm.globalError).toContain("Bitte folgende Pflichtfelder ausfüllen:");
    expect(vm.globalError).toContain("Firma");
    expect(vm.globalError).toContain("E-Mail");
    expect(vm.globalError).toContain("Straße");
    expect(vm.globalError).toContain("PLZ");
    expect(vm.globalError).toContain("Ort");
  });

  it("shows phone validation error when phone is invalid", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    await fillRequiredFormViaInputs(wrapper);
    await wrapper.find("input#phone").setValue("123");

    await vm.submitForm();

    expect(contractorService.createContractor).not.toHaveBeenCalled();
    expect(vm.globalError).toContain("Telefonnummer muss 10–14 Ziffern enthalten");
  });

  it(
      "creates contractor and normalizes payload " +
      "(province->city, countryCode->DE, empty phone/trade -> undefined)",
      async () => {
    const { wrapper, reloadMock } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    await fillRequiredFormViaInputs(wrapper);
    await wrapper.find("input#phone").setValue("   ");
    await wrapper.find("input#trade").setValue("  ");
    await wrapper.find("input#province").setValue("   ");
    await wrapper.find("input#countryCode").setValue("   ");

    (contractorService.createContractor as Mock).mockResolvedValue({});

    await vm.submitForm();

    expect(contractorService.createContractor).toHaveBeenCalledTimes(1);
    const [, payload] = (contractorService.createContractor as Mock).mock.calls[0];
    expect(payload).toMatchObject({
      companyName: "ACME",
      email: "acme@test.de",
      phone: undefined,
      trade: undefined,
      address: {
        street: "Straße 1",
        zip: "12345",
        city: "Berlin",
        province: "Berlin",
        countryCode: "DE",
      },
    });
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("creates contractor and keeps provided province/countryCode and trims phone/trade", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    await fillRequiredFormViaInputs(wrapper);
    await wrapper.find("input#phone").setValue(" +491234567890 ");
    await wrapper.find("input#trade").setValue("  Elektrik ");
    await wrapper.find("input#province").setValue("  BY ");
    await wrapper.find("input#countryCode").setValue("  AT ");

    (contractorService.createContractor as Mock).mockResolvedValue({});

    await vm.submitForm();

    const [, payload] = (contractorService.createContractor as Mock).mock.calls[0];
    expect(payload.phone).toBe("+491234567890");
    expect(payload.trade).toBe("Elektrik");
    expect(payload.address.province).toBe("BY");
    expect(payload.address.countryCode).toBe("AT");
  });

  it("opens edit dialog and pre-fills form with contractor data (including fallbacks)", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    const contractor = {
      id: "c1",
      companyName: "Firma",
      email: "f@test.de",
      phone: undefined,
      trade: undefined,
      address: {
        street: "S",
        city: "C",
        zip: "Z",
      },
    };

    const table = wrapper.findComponent({ name: "ContractorTableStub" });
    table.vm.$emit("edit", contractor);
    await nextTick();

    expect(vm.isEditMode).toBe(true);
    expect(vm.currentContractor?.id).toBe("c1");
    expect(vm.showDialog).toBe(true);
    expect(vm.globalError).toBe(null);
    expect(vm.showErrors).toBe(false);
    expect(vm.form.companyName).toBe("Firma");
    expect(vm.form.email).toBe("f@test.de");
    expect(vm.form.phone).toBe("");
    expect(vm.form.trade).toBe("");
    expect(vm.form.address.province).toBe("");
    expect(vm.form.address.countryCode).toBe("");
  });

  it("closes dialog and resets error state", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    vm.openCreateDialog();
    await nextTick();

    vm.globalError = "x";
    vm.showErrors = true;
    vm.showDialog = true;

    await wrapper.findAll("button").find((b) => b.text() === "Abbrechen")!.trigger("click");
    await nextTick();

    expect(vm.showDialog).toBe(false);
    expect(vm.globalError).toBe(null);
    expect(vm.showErrors).toBe(false);
  });

  it("shows address-invalid error on 400 response when saving fails", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    await fillRequiredFormViaInputs(wrapper);

    (contractorService.createContractor as Mock).mockRejectedValue({ response: { status: 400 } });

    await vm.submitForm();

    expect(vm.globalError).toContain("Adresse");
    expect(vm.globalError).toContain("ungültig");
  });

  it("shows generic save error on non-400 error response", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    await fillRequiredFormViaInputs(wrapper);

    (contractorService.createContractor as Mock).mockRejectedValue({ response: { status: 500 } });

    await vm.submitForm();

    expect(vm.globalError).toContain("Beim Speichern ist ein Fehler aufgetreten");
  });

  it("does not delete contractor when confirm is missing or false", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    vi.stubGlobal("confirm", undefined as unknown as (message?: string) => boolean);

    await vm.deleteContractor({ id: "x", companyName: "X" });
    expect(contractorService.deleteContractor).not.toHaveBeenCalled();

    vi.stubGlobal("confirm", vi.fn().mockReturnValue(false));
    await vm.deleteContractor({ id: "x", companyName: "X" });
    expect(contractorService.deleteContractor).not.toHaveBeenCalled();
  });

  it("deletes contractor when confirm is true", async () => {
    const { wrapper, reloadMock } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    (contractorService.deleteContractor as Mock).mockResolvedValue(undefined);

    await vm.deleteContractor({ id: "x", companyName: "X" });

    expect(contractorService.deleteContractor).toHaveBeenCalledWith(PROJECT_ID, "x");
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("shows delete error when deletion fails", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    (contractorService.deleteContractor as Mock).mockRejectedValue(new Error("fail"));

    await vm.deleteContractor({ id: "x", companyName: "X" });

    expect(vm.globalError).toContain("Beim Löschen ist ein Fehler aufgetreten");
  });

  it("updates contractor when edit mode is active", async () => {
    const { wrapper, reloadMock } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    const contractor = {
      id: "c1",
      companyName: "Alt",
      email: "alt@test.de",
      address: {
 street: "Alt", city: "Alt", zip: "11111" 
},
    };
    wrapper.findComponent({ name: "ContractorTableStub" }).vm.$emit("edit", contractor);
    await nextTick();

    await wrapper.find("input#companyName").setValue("Neu");
    await wrapper.find("input#email").setValue("neu@test.de");
    await wrapper.find("input#street").setValue("Neu");
    await wrapper.find("input#city").setValue("Neu");
    await wrapper.find("input#zip").setValue("22222");

    (contractorService.updateContractor as Mock).mockResolvedValue({});

    await vm.submitForm();

    expect(contractorService.updateContractor).toHaveBeenCalledTimes(1);
    expect(contractorService.updateContractor).toHaveBeenCalledWith(
        PROJECT_ID,
        "c1",
        expect.objectContaining({
          id: "c1",
          companyName: "Neu",
          email: "neu@test.de",
          address: expect.objectContaining({ city: "Neu" }),
        }),
    );
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
