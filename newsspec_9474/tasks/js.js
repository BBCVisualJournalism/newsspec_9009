module.exports = function (grunt) {

    grunt.registerTask('copy_js_minimum', ['copy:requirejs']);

    grunt.config(['copy', 'requirejs'], {
        files: [{
            expand: true,
            cwd:    'source/js/lib/vendors/require/',
            src:    ['*.js'],
            dest:   'content/<%= config.services.default %>/js/lib/vendors/require/'
        }]
    });
    
    grunt.config(['copy', 'jsAll'], {
        files: [{
            expand: true,
            cwd:    'source/js/',
            src:    ['**'],
            dest:   'content/<%= config.services.default %>/js/'
        }]
    });

    grunt.config(['copy', 'assetsAll'], {
        files: [{
            expand: true,
            cwd:    'source/js/lib/vendors/mapping/',
            src:    ['**'],
            dest:   'content/<%= config.services.default %>/js/lib/vendors/mapping/'
        }]
    });

    grunt.config(['copy', 'd3'], {
        files: [{
            expand: true,
            cwd:    'source/assets/',
            src:    ['**'],
            dest:   'content/<%= config.services.default %>/assets/'
        }]
    });

    grunt.config(['clean', 'allJs'], {
        src: ['content/<%= config.services.default %>/js']
    });
    grunt.config('uglify', {
        options: {
            mangle: true
        },
        my_target: {
            files: {
                'content/<%= config.services.default %>/js/lib/news_special/iframemanager__host.js': ['source/js/lib/news_special/iframemanager__host.js']
            }
        }
    });

    grunt.registerTask('copyRequiredJs', function () {
        if (grunt.config.get('config').debug === 'true') {
            grunt.task.run('copy:jsAll'); 
            grunt.task.run('uglify'); 
        } else {
            grunt.task.run('copy_js_minimum'); 
        }
    });

    grunt.config(['concurrent', 'js'], {
        tasks: ['jshint', 'requirejs:jquery1', 'requirejs:jquery2']
    });
    grunt.registerTask('js', ['clean:allJs', 'overrideImagerImageSizes', 'concurrent:js', 'copyRequiredJs', 'copy:assetsAll']);
};