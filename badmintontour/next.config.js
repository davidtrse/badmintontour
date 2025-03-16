/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Add CSS loader configuration
        const rules = config.module.rules;
        const cssRule = rules.find(rule => rule.test?.test?.('.css'));

        if (cssRule) {
            cssRule.use = [
                ...cssRule.use,
                {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            plugins: [
                                'postcss-preset-env',
                                'autoprefixer',
                            ],
                        },
                    },
                },
            ];
        }

        return config;
    },
};

module.exports = nextConfig; 