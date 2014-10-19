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
                src: ['src/wixmedia.js'],
                dest: 'dist/wixmedia.min.js'
            },
            build : {
                src: ['src/wixmedia.js'],
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
        }

    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha');
    // Default task(s).
    grunt.registerTask('web', ['clean:dist', 'jshint', 'browserify:dist']);
    grunt.registerTask('web-tests', ['clean:build', 'browserify:build', 'browserify:specs', 'mocha']);

};