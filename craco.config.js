module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.resolve.extensions.push('.nearley');

            // Add nearley-loader at the beginning of oneOf to ensure priority
            const nearleyLoader = {
                test: /\.nearley$/,
                use: [{ loader: require.resolve('nearley-loader') }],
            };

            // Ensure nearley-loader is prioritized by adding it to the beginning of oneOf
            const oneOfRule = webpackConfig.module.rules.find(rule => Array.isArray(rule.oneOf));
            if (oneOfRule) {
                oneOfRule.oneOf.unshift(nearleyLoader);
            }

            return webpackConfig;
        }
    }
};