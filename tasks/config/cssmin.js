module.exports = function(grunt) {
    return {
        core: {
            src: 'dist/tozee.css',
            dest: 'dist/tozee.min.css'
        },
        style: {
            src: 'dist/tozee-theme.css',
            dest: 'dist/tozee-theme.min.css'
        }
    };
};