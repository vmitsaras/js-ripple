module.exports = {
	js: {
		src: [
			"src/<%= pkg.name %>.js"
		]
	},
	pkgd: {
		src: [
			"bower_components/js-utilities/utils.js",
			"src/<%= pkg.name %>.js"
		]
	}
};
