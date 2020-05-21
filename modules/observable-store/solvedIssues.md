## To build the project(s)

To build Observable Store:  

`npm run build` or `npm run build:w`

To build Observable Store extensions cd into the folder and run:

`npm run build` or `npm run build:w`

## To publish to npm

1. Update the version in `package.json`.
1. Run `npm run build` to create the dist folder (ensure tsconfig.json is set to copy the build there)
1. Run `npm publish --access public` and enter the 2FA code for npm in 1Password

## To run the Observable Store npm module locally without publishing to npm

1. Run `npm link` at the root of the `observable-store` project
1. Go into the target sample project and run `npm link @codewithdan/observable-store`

When done you can unlink by running `npm unlink @codewithdan/observable-store` in the target sample project

## Access Angular Zone Outside of Angular

https://stackoverflow.com/questions/47619350/access-angular-ngzone-instance-from-window-object
https://medium.com/nextfaze/devmod-probing-your-angular-application-for-fun-and-debugging-d7e07c688247

Window object will have `ng` and `getAllAngularRootElements`:

ng.probe(getAllAngularRootElements()[0]).injector.get(ng.coreTokens.NgZone)

## To run samples with local Observable Store Code for testing (old)

1. Run `npm install` at root of the project
1. Remove `@codewithdan/observable-store` from `package.json` file for sample.
1. Change the import in the service(s) from:

    `import { ObservableStore } from '@codewithdan/observable-store';`

    To:

    `import { ObservableStore } from '../../../../../src/observable-store';`

1. Delete `node_modules` and run `npm install` again for the sample project.
1. Run `ng server -o`

## Copy README.md from root into modules/observable-store folder

`npm run build` now automatically copies the file into the folder for deployment. Any updates should be made to the root README.md.