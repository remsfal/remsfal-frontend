import { describe, it, expect } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import Step2DetailsForm from '@/features/tenant/tenantIssues/components/Step2DetailsForm.vue';
import type { IssueType } from '@/services/IssueService';
import i18n from '@/i18n/i18n';

describe('Step2DetailsForm', () => {
  const defaultProps = {
    issueType: 'DEFECT' as IssueType | null,
    causedBy: null,
    causedByUnknown: false,
    location: null,
    description: null,
  };

  const mountForm = (props: Partial<typeof defaultProps> = {}) =>
    mount(Step2DetailsForm, { props: { ...defaultProps, ...props } });

  const findBackButton = (wrapper: VueWrapper) =>
    wrapper.findAllComponents(Button).find((btn) => btn.props('icon') === 'pi pi-arrow-left')!;

  const findNextButton = (wrapper: VueWrapper) =>
    wrapper.findAllComponents(Button).find((btn) => btn.props('icon') === 'pi pi-arrow-right')!;

  it('renders the step title', () => {
    const wrapper = mountForm();
    expect(wrapper.find('h3').text()).toBe(i18n.global.t('tenantIssue.step2.title'));
  });

  it('shows causedBy and location fields for DEFECT', () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });
    expect(wrapper.find('input[name="causedBy"]').exists()).toBe(true);
    expect(wrapper.find('input[name="location"]').exists()).toBe(true);
  });

  it('hides causedBy and location fields for INQUIRY', () => {
    const wrapper = mountForm({ issueType: 'INQUIRY' });
    expect(wrapper.find('input[name="causedBy"]').exists()).toBe(false);
    expect(wrapper.find('input[name="location"]').exists()).toBe(false);
  });

  it('hides causedBy and location fields for TERMINATION', () => {
    const wrapper = mountForm({ issueType: 'TERMINATION' });
    expect(wrapper.find('input[name="causedBy"]').exists()).toBe(false);
    expect(wrapper.find('input[name="location"]').exists()).toBe(false);
  });

  it('uses the message label/placeholder for TERMINATION', () => {
    const wrapper = mountForm({ issueType: 'TERMINATION' });
    const label = wrapper.findAll('label').find((l) => l.attributes('for') === 'description');
    expect(label?.text()).toContain(i18n.global.t('tenantIssue.step2.messageLabel'));
    expect(wrapper.find('textarea[name="description"]').attributes('placeholder'))
      .toBe(i18n.global.t('tenantIssue.step2.messagePlaceholder'));
  });

  it('uses the description label/placeholder for DEFECT and INQUIRY', () => {
    const wrapper = mountForm({ issueType: 'INQUIRY' });
    const label = wrapper.findAll('label').find((l) => l.attributes('for') === 'description');
    expect(label?.text()).toContain(i18n.global.t('tenantIssue.step2.descriptionLabel'));
    expect(wrapper.find('textarea[name="description"]').attributes('placeholder'))
      .toBe(i18n.global.t('tenantIssue.step2.descriptionPlaceholder'));
  });

  it('disables the causedBy field when causedByUnknown is checked', async () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });
    expect(wrapper.find('input[name="causedBy"]').attributes('disabled')).toBeUndefined();

    await wrapper.findComponent(Checkbox).vm.$emit('update:modelValue', true);

    expect(wrapper.find('input[name="causedBy"]').attributes('disabled')).toBeDefined();
  });

  it('keeps the next button disabled until the description is touched', async () => {
    const wrapper = mountForm({ issueType: 'INQUIRY' });
    expect(findNextButton(wrapper).attributes('disabled')).toBeDefined();

    await wrapper.find('textarea[name="description"]').setValue('Kurze Nachricht');

    expect(findNextButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  it('keeps the next button disabled for DEFECT until causedBy is filled', async () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });
    await wrapper.find('textarea[name="description"]').setValue('Es tropft aus der Wand');

    expect(findNextButton(wrapper).attributes('disabled')).toBeDefined();

    await wrapper.find('input[name="causedBy"]').setValue('Nachbar 2. OG');

    expect(findNextButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  it('enables the next button for DEFECT when causedByUnknown is checked instead of causedBy', async () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });
    await wrapper.find('textarea[name="description"]').setValue('Es tropft aus der Wand');
    await wrapper.findComponent(Checkbox).vm.$emit('update:modelValue', true);

    expect(findNextButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  it('emits back when the back button is clicked', async () => {
    const wrapper = mountForm();
    await findBackButton(wrapper).trigger('click');

    expect(wrapper.emitted('back')).toBeTruthy();
  });

  it('emits update events with trimmed values and next on valid DEFECT submit', async () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });

    await wrapper.find('input[name="causedBy"]').setValue('  Nachbar 2. OG  ');
    await wrapper.find('input[name="location"]').setValue('  Küche  ');
    await wrapper.find('textarea[name="description"]').setValue('  Es tropft aus der Wand  ');

    await wrapper.findComponent(Form).trigger('submit');
    await flushPromises();

    expect(wrapper.emitted('update:causedBy')?.at(-1)).toEqual(['Nachbar 2. OG']);
    expect(wrapper.emitted('update:causedByUnknown')?.at(-1)).toEqual([false]);
    expect(wrapper.emitted('update:location')?.at(-1)).toEqual(['Küche']);
    expect(wrapper.emitted('update:description')?.at(-1)).toEqual(['Es tropft aus der Wand']);
    expect(wrapper.emitted('next')).toBeTruthy();
  });

  it('does not emit next when DEFECT submit is missing the required description', async () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });

    await wrapper.find('input[name="causedBy"]').setValue('Nachbar 2. OG');
    const description = wrapper.find('textarea[name="description"]');
    await description.trigger('blur');
    await wrapper.findComponent(Form).trigger('submit');
    await flushPromises();

    expect(wrapper.emitted('next')).toBeFalsy();
    const messages = wrapper.findAllComponents(Message);
    expect(messages.some((m) => m.text() === i18n.global.t('tenantIssue.validation.descriptionRequired'))).toBe(true);
  });

  it('allows submitting INQUIRY without causedBy or description content required by validation', async () => {
    const wrapper = mountForm({ issueType: 'INQUIRY' });

    await wrapper.find('textarea[name="description"]').setValue('Wann ist die nächste Nebenkostenabrechnung fällig?');
    await wrapper.findComponent(Form).trigger('submit');
    await flushPromises();

    expect(wrapper.emitted('next')).toBeTruthy();
    expect(wrapper.emitted('update:description')?.at(-1)).toEqual(['Wann ist die nächste Nebenkostenabrechnung fällig?']);
  });
});
