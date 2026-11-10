import { describe, it, expect } from 'vitest';

/**
 * AppRoleLayout stacks the page content with `flex flex-col gap-8`. Views must not wrap their
 * cards in an own spacing container, otherwise the cards get a different spacing than on other pages.
 */
const viewSources = import.meta.glob('/src/features/**/views/*View.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Views outside the role layouts (own full-page layout)
const EXCLUDED = ['/src/features/common/authentication/views/LoginView.vue'];

function firstTemplateElement(source: string): string | undefined {
  const template = source.match(/<template>\s*(?:<!--[\s\S]*?-->\s*)*(<[^>]+>)/);
  return template?.[1];
}

describe('view card spacing', () => {
  const views = Object.entries(viewSources).filter(([path]) => !EXCLUDED.includes(path));

  it('finds the views to check', () => {
    expect(views.length).toBeGreaterThan(0);
  });

  it.each(views.map(([path, source]) => [path, source]))(
    '%s does not wrap its content in an own spacing container',
    (_path, source) => {
      const root = firstTemplateElement(source as string) ?? '';
      expect(root).not.toMatch(/class="[^"]*\b(gap-\d+|p-\d+|space-y-\d+)\b/);
    },
  );
});
