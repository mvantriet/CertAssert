const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");

const exampleAppBabelConfig = {
    test: /\.(js|jsx|ts|tsx)$/,
    loader: require.resolve("babel-loader"),
    options: {
        babelrc: false,
        presets: [require.resolve("babel-preset-react-app")],
        compact: true,
    },
};

module.exports = function override(config, env) {
    // disable ModuleScopePlugin to enable type imports from the server
    config.resolve.plugins = config.resolve.plugins.filter(
        (plugin) => !(plugin instanceof ModuleScopePlugin)
    );
    config.module.rules.push(exampleAppBabelConfig);
    return config;
};
