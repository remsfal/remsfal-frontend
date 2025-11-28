import { mount, VueWrapper } from '@vue/test-utils';
import {beforeEach, describe, expect, it} from 'vitest';
import ProjectNewTenancy from '../../src/views/ProjectNewTenancy.vue';

describe('ProjectTenancies.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(ProjectNewTenancy);
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
