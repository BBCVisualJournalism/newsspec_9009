module.exports = function (grunt) {

    grunt.config(['copy', 'assets'], {
        files: [{
            expand: true,
            cwd: 'source/assets',
            src: ['**/*.*'],
            dest: 'content/<%= config.services.default %>/assets'
        }]
    });
};