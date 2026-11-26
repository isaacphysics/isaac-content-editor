# Isaac Content Editor

The Isaac Content Editor is a React app built with Vite.

## Local development

From the repository root, run:

```sh
yarn --frozen-lockfile
yarn run start
```

Open [http://localhost:8421](http://localhost:8421) to view it in the browser. The page will update if you make edits, and runs TypeScript and ESLint checks.

To switch the running version of the development site between Isaac and Ada, replace the [DEFAULT_DEV_SITE](https://github.com/isaacphysics/isaac-content-editor/blob/b979c8ab6490287fa490bfefd46f6ce462da0df3/src/services/site.ts#L3) constant.

## Scripts

| Command | What it does |
| --- | --- |
| `yarn run start` | Starts the Vite development server. |
| `yarn run lint` | Runs ESLint on `src/`. |
| `yarn run test` | Runs the Jest test suite. |
| `yarn run build` | Builds the production app into `build/`. |


