/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const isMock = !!process.env.USE_MOCK_DB;

const config = {
	webpack(config, { isServer }) {
		if (isMock) {
			config.resolve = config.resolve || {};
			config.resolve.alias = {
				...(config.resolve.alias || {}),
				// alias server modules to mocks during development when USE_MOCK_DB=1
				['@/server/db']: require('path').resolve(__dirname, 'src/server/db.mock.ts'),
				['@/server/auth']: require('path').resolve(__dirname, 'src/server/auth.mock.ts'),
			};
		}
		return config;
	},
};

export default config;
