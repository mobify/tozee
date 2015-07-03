define([
    'test-sandbox',
    'text!fixtures/tozee.html'
], function(testSandbox, fixture) {
    var Tozee;
    var $element;
    var $;

    describe('Tozee constructor', function() {
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

        it('creates an alphabetic bar', function() {
            expect($('.tozee__letter').length > 0);
        });
    });
});