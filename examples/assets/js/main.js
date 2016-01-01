require(['config'], function() {
    require([
        '$',
        'tozee'
    ],
    function($) {
        $('#myTozee').tozee();
        $('#myTozeeOverflow').tozee({
            overflowScroll: true
        });
    });
});
