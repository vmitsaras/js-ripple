module.exports = {
	dist: {
		"parseFiles": true,
		"dest": "vendor/modernizr.js",
		"minify": true,
		"classPrefix": "support-",
		"options": [
			"domPrefixes",
			"prefixes",
			"addTest",
			"hasEvent",
			"prefixed",
			"testAllProps",
			"testProp",
			"testStyles",
			"html5shiv",
			"setClasses"
		],
		"feature-detects": [
			"test/touchevents",
			"test/css/animations",
			"test/css/flexbox",
			"test/css/transforms",
			"test/css/transitions"
		],
		"uglify": true
	}
};
