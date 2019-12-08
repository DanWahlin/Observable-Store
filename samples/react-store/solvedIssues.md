## Types error for Node when running `npm start`

When doing the observable store build ensure that all .d.ts files copied into the react project are deleted. Otherwise it makes a .tsconfig file
and types for Node and other items are missing which causes the error.

## Browserlist Error: BrowserslistError: Unknown browser query `android all`

https://github.com/facebook/create-react-app/issues/7239

## Overriding the ModuleScopePlugin (to go outside of src) and adding Aliases

https://github.com/timarney/react-app-rewired#how-to-rewire-your-create-react-app-project
https://medium.com/front-end-weekly/creating-alias-for-package-imports-in-react-99d455284029
https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory

1. `npm install react-app-rewired react-app-rewire-aliases --save-dev`
1. Add a `config-overrides.js` file into the root of the project
1. Add the following into the `config-overrides.js` file:

```javascript
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const { paths } = require('react-app-rewired');
const path = require('path');

module.exports = function override(config, env) {
    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));
    config = rewireAliases.aliasesOptions({
		'@codewithdan': path.resolve('../../dist-extensions') // path.resolve(__dirname, `${paths.appSrc}/components/`)
	})(config, env);
    return config;
};
```

1. Change:

```javascript
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
```

To:

```javascript
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    "eject": "react-scripts eject"
  },
```


