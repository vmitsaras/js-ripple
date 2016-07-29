module.exports = {
	dist: {
		options: {
			position: "top",
			banner: "<%= banner %>"
		},
		files: {
			src: [ "<%= pkg.config.dist %>/_js/*.js", "<%= pkg.config.dist %>/_css/*.css", "<%= pkg.config.dist %>/_css/*/*.css" ]
		}
	}
};
