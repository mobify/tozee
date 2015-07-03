require.config({
    baseUrl: '../',
    paths: {
        'text': 'bower_components/requirejs-text/text',
        '$': 'lib/zeptojs/dist/zepto',
        'plugin': 'bower_components/plugin/dist/plugin',
        'tozee': 'src/js/tozee'
    },
    'shim': {
        '$': {
            exports: '$'
        }
    }
});
