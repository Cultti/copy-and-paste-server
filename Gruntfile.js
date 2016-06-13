'use strict';
module.exports = function(grunt) {
    // Load tasks
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-jscoverage');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-coveralls');

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
        }
    });

    // Register tasks
    grunt.registerTask('default', ['wiredep']);
    grunt.registerTask('test', ['jslint', 'jscoverage', 'mochaTest:test']);
    grunt.registerTask('travis', ['jslint', 'jscoverage', 'mochaTest:travis', 'coveralls:test']);
};