import { describe, it, expect } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Step3AttachmentsForm from '@/features/tenant/tenantIssues/components/Step3AttachmentsForm.vue';
import i18n from '@/i18n/i18n';

describe('Step3AttachmentsForm', () => {
  const file1 = new File(['a'], 'foto.jpg', { type: 'image/jpeg' });
  const file2 = new File(['b'], 'bericht.pdf', { type: 'application/pdf' });

  const mountForm = (files: File[] = []) => mount(Step3AttachmentsForm, { props: { files } });

  const findBackButton = (wrapper: VueWrapper) =>
    wrapper.findAllComponents(Button).find((btn) => btn.props('icon') === 'pi pi-arrow-left')!;

  const findNextButton = (wrapper: VueWrapper) =>
    wrapper.findAllComponents(Button).find((btn) => btn.props('icon') === 'pi pi-arrow-right')!;

  it('renders the step title', () => {
    const wrapper = mountForm();
    expect(wrapper.find('h3').text()).toBe(i18n.global.t('tenantIssue.step3.title'));
  });

  it('emits update:files with the newly selected files', async () => {
    const wrapper = mountForm();
    await wrapper.findComponent(FileUpload).vm.$emit('select', { files: [file1, file2] });

    expect(wrapper.emitted('update:files')?.at(-1)).toEqual([[file1, file2]]);
  });

  it('removes a specific file when it is removed from the upload widget', async () => {
    const wrapper = mountForm();
    await wrapper.findComponent(FileUpload).vm.$emit('select', { files: [file1, file2] });
    await wrapper.findComponent(FileUpload).vm.$emit('remove', { file: file1 });

    expect(wrapper.emitted('update:files')?.at(-1)).toEqual([[file2]]);
  });

  it('initializes local files from props', async () => {
    const wrapper = mountForm([file1]);
    await findNextButton(wrapper).trigger('click');

    expect(wrapper.emitted('update:files')?.at(-1)).toEqual([[file1]]);
  });

  it('emits update:files and next when the next button is clicked', async () => {
    const wrapper = mountForm();
    await findNextButton(wrapper).trigger('click');

    expect(wrapper.emitted('update:files')).toBeTruthy();
    expect(wrapper.emitted('next')).toBeTruthy();
  });

  it('emits update:files and back when the back button is clicked', async () => {
    const wrapper = mountForm();
    await findBackButton(wrapper).trigger('click');

    expect(wrapper.emitted('update:files')).toBeTruthy();
    expect(wrapper.emitted('back')).toBeTruthy();
  });
});
