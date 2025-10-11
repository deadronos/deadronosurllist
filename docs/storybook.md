# Storybook (examples & setup)

This project does not currently include a running Storybook instance, but the component-style architecture and small, focused UI primitives make it a good fit for Storybook.

If you'd like to add Storybook to this repository, follow these quick steps:

1. Initialize Storybook in the repository (auto-detects framework):

```bash
npx sb init
```

1. Add convenient npm scripts to `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build:storybook": "storybook build"
  }
}
```

1. Create stories under `src/` (examples below show the PublicCatalog component):

```tsx
// src/stories/PublicCatalog.stories.tsx
import React from 'react';
import { PublicCatalog, PublicCatalogCollection } from '@/app/_components/public-catalog';

const collections: PublicCatalogCollection[] = [
  {
    id: '1',
    name: 'Discover Links',
    description: 'Curated developer links',
    updatedAt: new Date().toISOString(),
    links: [
      { id: 'l1', name: 'GitHub', url: 'https://github.com', comment: null, order: 0 },
    ],
  },
];

export default {
  title: 'Landing/PublicCatalog',
  component: PublicCatalog,
};

export const Default = () => <PublicCatalog collections={collections} />;
```

1. Run Storybook locally:

```bash
npm run storybook
```

Open the local UI at `http://localhost:6006`. To publish Storybook (static build), run `npm run build:storybook` and host the `storybook-static` output on GitHub Pages or a static host.

Hosted placeholder URL

- `https://your-org.github.io/deadronosurllist-storybook` (replace with your project org URL after publishing)

Notes

- Use `src/app/_components/` as the primary place for stories that exercise shared UI primitives (cards, forms, sortable lists).
- When adding stories, mock network calls (or use the in-repo mock DB) to keep stories deterministic.
- Storybook adds dev-time dependencies, so review the installed packages and lockfiles before merging.
