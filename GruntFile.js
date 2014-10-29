module.exports = function(grunt) {
    // Project configuration.

    var distOptions = {
        debug: false,
        transform : ['uglifyify'],
        bundleOptions : {
            standalone: "wixmedia"
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
                src: ['src/wixmedia-browser.js'],
                dest: 'dist/wixmedia.js'
            },
            specs: {
                src: ["tests/specs/**/*Spec.js"],
                dest: "build/specs.js"
            }
        },
        mocha: {
            test: {
                src: ['tests/SpecRunner.html'],
                options: {
                    run: true
                }
            }
        },
        jsdoc : {
            dist : {
                src: ['src/images.js', 'src/wixmedia.js', 'README.md'],
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
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-gh-pages');

    // Default task(s).
    grunt.registerTask('web', ['clean:dist', 'jshint', 'browserify:dist']);
    grunt.registerTask('web-tests', ['clean:build', 'browserify:build', 'browserify:specs', 'mocha']);
    grunt.registerTask('docs', ['clean:jsdoc', 'jsdoc']);

    grunt.registerTask('publish', ['docs', 'gh-pages']);


};