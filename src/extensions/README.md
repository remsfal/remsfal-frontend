# Downstream Extensions

This folder is reserved for downstream projects (e.g. a commercial fork). The upstream project ships it
empty, so a downstream project only **adds** files here and never has to modify upstream files.
That keeps regular upstream merges free of conflicts.

| Folder       | Purpose                                                                                 |
|--------------|-----------------------------------------------------------------------------------------|
| `overrides/` | Mirror of `src/`. A file here replaces the upstream file with the same relative path.   |
| `pages/`     | Additional routes (file-based routing, same conventions as `src/pages/`).               |
| `features/`  | New downstream code. Import it via `@/extensions/features/...`.                         |
| `locales/`   | `de.json` / `en.json` with additional keys; they are merged over (and may override) the upstream messages. |

Example: `overrides/views/LandingPageView.vue` replaces `src/views/LandingPageView.vue`.
Inside an override the original is still available via `@upstream/views/LandingPageView.vue`.

The build fails if an override has no upstream counterpart (e.g. because the upstream file was renamed).

See the section "Downstream Extensions" in [`AGENT.md`](../../AGENT.md) for all rules.
