const defaultTheme = require("tailwindcss/defaultTheme");

const colors = require("tailwindcss/colors");

module.exports = {
	content: ["./src/avenue_assets/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter var", ...defaultTheme.fontFamily.sans],
			},
			colors: {
				rose: colors.rose,
				transparent: "transparent",
				current: "currentColor",
				"dark-electric-blue": "#646e78ff",
				manatee: "#8d98a7ff",
				almond: "#dcccbbff",
				sunray: "#eab464ff",
				"cafe-au-lait": "#a7754dff",
			},
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
		require("@tailwindcss/aspect-ratio"),
	],
};
