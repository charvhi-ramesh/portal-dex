# Portal Dex

Portal Dex turns every character from the Rick and Morty API into a holographic collectible card: browse, search, filter, flip, favourite, and pull random characters out of an animated portal.

Unofficial fan project; not affiliated with the show or its owners. Data from [The Rick and Morty API](https://rickandmortyapi.com).

## Live site

Live site: not deployed yet

## Develop

Requires Node 22.18 or newer.

```bash
npm ci
npm run dev      # development server on http://localhost:3000
npm test         # unit tests
npm run build    # production build
```

The smoke runner checks the served HTML of a production build it starts itself (run `npm run build` first):

```bash
node scripts/smoke.ts route:/ "Portal Dex"
```

It can also check a running site, either https or http on localhost:

```bash
node scripts/smoke.ts --base https://your-project.vercel.app route:/ "Portal Dex"
```

## Deploy to Vercel

Deploy from the Vercel dashboard. The app needs no environment variables and no secrets.

1. Push the repository to a Git host Vercel can read (GitHub, GitLab or Bitbucket).
2. In the Vercel dashboard choose Add New, then Project, then Import Git Repository, and pick the repository.
3. Framework Preset: Next.js. Root Directory: `./`. Leave the Build, Install and Output settings on their defaults.
4. Environment Variables: add none.
5. Node.js Version (Project Settings, Build and Deployment): 22.x.
6. Press Deploy and wait for "Ready", then open the production domain.

The Vercel CLI is not used: fetching it through `npx` would add a package this project has not approved.
