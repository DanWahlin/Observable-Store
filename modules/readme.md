## Instructions

1. Open `modules/observable-store-extensions` and run `npm run build` or `npm run build:w`.

1. Open `modules/observable-store` and run `npm run build` or `npm run build:w`.

1. Open one of the samples and uncomment the lines in `tsconfig.json` for `@codewithdan` (makes local testing easier).

1. Open a sample project in `samples` to test it out.

1. Run `npm publish --access public` and enter the 2FA code for npm


## Publishing Extensions Project

1. Open `modules/observable-store` and run `npm link` to setup linking to `@codewithdan/observable-store`. Alternatively, you can uncomment the lines in `modules/observable-store-extensions/tsconfig.json` to work with it locally.

1. Open `modules/observable-store-extensions` and run `npm link @codewithdan/observable-store`

1. Open `modules/observable-store-extensions/tsconfig.json` and comment out the `paths` property

1. Open `modules/observable-store-extensions` and run `npm run build` or `npm run build:w`.

1. Copy the root `readme.md` file into `modules/observable-store` (need to update the build to automate this).

1. Run `npm publish --access public` and enter the 2FA code for npm

1. When done you can run `npm unlink @codewithdan/observable-store` in `modules/observable-store-extensions`

1. Then run `npm unlink` in `modules/observable-store`

1. IMPORTANT: Make sure that samples have `@codewithdan` sections in `tsconfig.json` commented out before pushing to github.


## import { Observable } from 'rxjs' Error Building Extensions

Delete `dist/observable-store` and rebuild the extensions project. If using linking (see above) there shouldn't be a problem.