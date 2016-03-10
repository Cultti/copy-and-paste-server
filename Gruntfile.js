'use strict';
module.exports = function(grunt) {
    // Load tasks
    grunt.loadNpmTasks('grunt-wiredep');

    grunt.initConfig({
        wiredep: {
            task: {
                src: ['public/index.html']
            }
        }
    });

    // Register tasks
    grunt.registerTask('default', ['wiredep']);

};
