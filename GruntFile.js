module.exports = function(grunt) {
    // Project configuration.

    var distOptions = {
        debug: false,
        transform : ['uglifyify'],
        bundleOptions : {
            standalone: "wixmedia"
        }
    };
	var buildOptions = {
		debug: false,
		bundleOptions : {
			standalone: "wixmedia"
		}
	};

	var distImageApiOptions = {
		debug: false,
		transform : ['uglifyify'],
		bundleOptions : {
			standalone: "imageApi"
		}
	};
	var buildImageApiOptions = {
		debug: false,
		bundleOptions : {
			standalone: "imageApi"
		}
	};

    grunt.initConfig({
        clean : {
            dist : {
                files: [
                    {
                        dot: true,
                        src: [
                            'dist/*'
                        ]
                    }
                ]
            },
            build : {
                files: [
                    {
                        dot: true,
                        src: [
                            'build/*'
                        ]
                    }
                ]
            },
            jsdoc : {
                files: [
                    {
                        dot: true,
                        src: [
                            'docs/*'
                        ]
                    }
                ]
            }
        },
        jshint: {
            options : {
                jshintrc : true
            },
            all: ['src/**/*.js']
        },
        browserify: {
            options: {
                debug: true
            },
            dist: {
                options: distOptions,
                src: ['src/wixmedia-browser.js'],
                dest: 'dist/wixmedia.min.js'
            },
            build : {
				options: buildOptions,
                src: ['src/wixmedia-browser.js'],
                dest: 'dist/wixmedia.js'
            },
			distImageApi : {
				options: distImageApiOptions,
				src: ['image-api.js'],
				dest: 'dist/image-api.min.js'
			},
			buildImageApi : {
				options: buildImageApiOptions,
				src: ['image-api.js'],
				dest: 'dist/image-api.js'
			},
            specs: {
                src: ["tests/specs/**/cropHelpersSpec.js", "tests/specs/**/imageAPISpec.js"],
                dest: "build/specs.js"
            }
        },
        mocha: {
            'test-browser': {
                src: ['tests/SpecRunner.html'],
                options: {
                    run: true
                }
            },
        },
		mochacli : {
			options: {
				reporter: 'nyan'
			},
			node : ['tests/specs/*Spec.js']
		},
        jsdoc : {
            dist : {
                src: ['src/images.js', 'src/wixmedia.js', 'src/node/upload.js', 'README.md'],
                options: {
                    destination: 'docs',
                    private : false,
                    configure: 'jsdoc.conf.json',
                    template: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template'
                }
            }
        },
        'gh-pages': {
            options: {
                base: 'docs'
            },
            src: ['**']
        }

    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-mocha-cli');
	grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-gh-pages');

    // Default task(s).
    grunt.registerTask('web', ['clean:dist', 'jshint', 'browserify:dist', 'browserify:build', 'browserify:distImageApi', 'browserify:buildImageApi']);
    grunt.registerTask('web-tests', ['clean:build', 'browserify:build', 'browserify:buildImageApi', 'browserify:specs', 'mocha']);
    grunt.registerTask('docs', ['clean:jsdoc', 'jsdoc']);

    grunt.registerTask('publish', ['docs', 'gh-pages']);


};