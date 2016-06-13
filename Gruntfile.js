'use strict';
module.exports = function(grunt) {
    // Load tasks
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-jscoverage');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.initConfig({
        wiredep: {
            task: {
                src: ['public/index.html']
            }
        },
        jslint: {
            server: {
                src: 'api/**/*.js',
                directives: {
                    node: true,
                    white: true
                },
                options: {
                    failOnError: false
                }
            }
        },
        jscoverage: {
            src: {
                expand: true,
                cwd: 'api/',
                src: ['**/*.js'],
                dest: 'api-cov',
                ext: '.js'
            }
        },
        mochaTest: {
            travis: {
                options: {
                    reporter: 'mocha-lcov-reporter',
                    captureFile: './api-cov/output/mocha-lcov-reporter.out',
                    quiet: false
                },
                src: ['test/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        coveralls: {
            options: {
                force: false
            },
            test: {
                src: './api-cov/output/mocha-lcov-reporter.out'
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'test/api/**/*.js'
            },
            coveralls: {
                src: 'test/api/**/*.js',
                options: {
                    coverage: true
                }
            }
        }
    });

    // Register tasks
    grunt.registerTask('default', ['wiredep']);
    grunt.registerTask('test', ['jslint', 'mocha_istanbul:coverage']);
    grunt.registerTask('travis', ['jslint', 'mocha_istanbul:coveralls']);

    // For coveralls
    grunt.event.on('coverage', function(lcov, done) {
        console.log(lcov);
        require('coveralls').handleInput(lcov, function(err) {
            console.log(err);
            if (err) {
                return done(err);
            }
            done();
        });
    });
};