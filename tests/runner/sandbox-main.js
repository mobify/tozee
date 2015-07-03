
require(['sandbox-config'], function() {
    require([
        '$',
    
        'plugin',
        'tozee'
    ],
        function(
            $
    ) {

            var dependencies = {};

            dependencies.$ = $;

            window.dependencies = dependencies;

            window.parent.postMessage('loaded', '*');
        });
});
