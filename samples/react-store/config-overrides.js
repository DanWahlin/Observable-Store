const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const rewireAliases = require('react-app-rewire-aliases');
const { paths } = require('react-app-rewired');
const path = require('path');

// https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory
// https://github.com/aze3ma/react-app-rewire-aliases
// https://github.com/timarney/react-app-rewired#how-to-rewire-your-create-react-app-project

module.exports = (config, env) => {
    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));
    // config = rewireAliases.aliasesOptions({
    // '@codewithdan/observable-store': path.resolve('../../modules/observable-store/dist') // path.resolve(__dirname, `${paths.appSrc}/components/`)
    // '@codewithdan/observable-store-extensions': path.resolve('../../modules/observable-store-extensions/dist')
    // })(config, env);
    return config;
};