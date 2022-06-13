const defaultTheme = require("tailwindcss/defaultTheme");

const colors = require("tailwindcss/colors");

module.exports = {
	content: [
		"./src/signals_assets/**/*.{js,jsx,ts,tsx}",
		"node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
		"./node_modules/flowbite/**/*.js",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter var", ...defaultTheme.fontFamily.sans],
			},
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
			signalBlue: {
				1: "#ecfafd",
				50: "#92C3DC",
				100: "#6AAACB",
				200: "#458EB2",
				300: "#2E85B1",
				400: "#177DB1",
				500: "#0075b0",
				600: "#0A7CB6",
				700: "#00466A",
				800: "#00273B",
				900: "#43302b",
			},
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
		require("@tailwindcss/aspect-ratio"),
		require("flowbite/plugin"),
	],
};
