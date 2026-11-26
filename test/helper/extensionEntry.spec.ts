import { describe, expect, it, vi } from 'vitest';
import { createApp } from 'vue';
import { createExtensionsPlugin } from '@/helper/extensionEntry';

const Root = { render: () => null };

describe('extensionEntry', () => {
  it('installs every downstream entry point on the app', () => {
    const install = vi.fn();
    const app = createApp(Root);
    app.use(createExtensionsPlugin({ '/src/extensions/main.ts': { install } }));
    expect(install).toHaveBeenCalledWith(app);
  });

  it('accepts entry points without install function and no entry points at all', () => {
    expect(() => createApp(Root).use(createExtensionsPlugin({ '/src/extensions/main.ts': {} }))).not.toThrow();
    expect(() => createApp(Root).use(createExtensionsPlugin({}))).not.toThrow();
  });
});
