define([
    'test-sandbox',
    'text!fixtures/tozee.html'
], function(testSandbox, fixture) {
    var Tozee;
    var $element;
    var $;

    describe('Tozee events', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Tozee = $.fn.tozee.Constructor;
                $element = $(fixture);

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('creates a tozee instance', function() {
            var tozee = new Tozee($element, {
            });

            expect(tozee).to.be.defined;
        });

        it('page scrolls when clicking on a letter', function() {
            $('.tozee__letter').last().click();
            expect($(window).scrollTop() > 0);
        });

        it('bar gets sticky', function() {
            expect($element.hasClass('sticky'));
        });
    });
});