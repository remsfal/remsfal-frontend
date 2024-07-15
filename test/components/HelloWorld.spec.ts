import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../../src/components/HelloWorld.vue';

describe('HelloWorld', () => {
  test('renders properly', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
