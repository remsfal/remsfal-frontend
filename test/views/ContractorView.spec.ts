/* eslint-disable vue/one-component-per-file */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
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
  zip: string;
  province?: string;
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
    address?: ContractorAddressForm;
  } | null;
  form: ContractorForm;
  globalError: string | null;
  showErrors: boolean;
  openCreateDialog: () => void;
  submitForm: () => Promise<void>;
  deleteContractor: (contractor: {
    id?: string;
    companyName?: string;
  }) => Promise<void>;
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
      visible: {
        type: Boolean,
        required: false,
      },
      header: {
        type: String,
        required: false,
      },
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

  const wrapper = mount(ContractorView, {
    props: { projectId },
    global: {
      stubs: {
        Card: {
          template:
              '<div><slot name="title" /><slot name="content" /></div>',
        },
        Dialog: DialogStub,
        InputText: {
          props: ["modelValue"],
          emits: ["update:modelValue"],
          template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
        Button: {
          props: ["label"],
          emits: ["click"],
          template:
              '<button type="button" @click="$emit(\'click\')">{{ label }}</button>',
        },
        ContractorTable: ContractorTableStub,
      },
    },
  });

  return { wrapper, reloadMock };
};

describe("ContractorView.vue", () => {
  beforeEach(() => {
    (contractorService.createContractor as Mock).mockReset();
    (contractorService.updateContractor as Mock).mockReset();
    (contractorService.deleteContractor as Mock).mockReset();
  });

  it("creates contractor with normalized payload and reloads table", async () => {
    const { wrapper, reloadMock } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    vm.openCreateDialog();
    await wrapper.vm.$nextTick();

    vm.form.companyName = "Firma";
    vm.form.email = "firma@test.de";
    vm.form.address.street = "Straße 1";
    vm.form.address.city = "Berlin";
    vm.form.address.zip = "12345";
    vm.form.phone = " ";
    vm.form.trade = " ";

    (contractorService.createContractor as Mock).mockResolvedValue({ id: "c1" });

    await vm.submitForm();

    expect(contractorService.createContractor).toHaveBeenCalledTimes(1);
    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(vm.showDialog).toBe(false);
  });

  it("updates contractor in edit mode", async () => {
    const { wrapper, reloadMock } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    vm.isEditMode = true;
    vm.currentContractor = {
      id: "c1",
      companyName: "Alt",
      email: "alt@test.de",
      address: {
 street: "Alt", city: "Alt", zip: "11111" 
},
    };

    vm.form.companyName = "Neu";
    vm.form.email = "neu@test.de";
    vm.form.address.street = "Neu";
    vm.form.address.city = "Neu";
    vm.form.address.zip = "22222";

    (contractorService.updateContractor as Mock).mockResolvedValue({});

    await vm.submitForm();

    expect(contractorService.updateContractor).toHaveBeenCalledTimes(1);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("does not delete contractor when confirm is false", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    vi.spyOn(globalThis, "confirm").mockReturnValue(false);

    await vm.deleteContractor({ id: "x", companyName: "X" });

    expect(contractorService.deleteContractor).not.toHaveBeenCalled();
  });

  it("deletes contractor when confirm is true", async () => {
    const { wrapper } = makeMount();
    const vm = wrapper.vm as ContractorViewVm;

    vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    (contractorService.deleteContractor as Mock).mockResolvedValue(undefined);

    await vm.deleteContractor({ id: "x", companyName: "X" });

    expect(contractorService.deleteContractor).toHaveBeenCalledWith(
        PROJECT_ID,
        "x",
    );
  });
});
