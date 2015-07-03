(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            '$',
            'plugin'
        ], factory);
    } else {
        var framework = window.Zepto || window.jQuery;
        factory(framework, window.Plugin);
    }
}(function($, Plugin) {
    var classes = {
        TOZEE: 'tozee',
        LIST: 'tozee__list',
        BAR: 'tozee__bar',
        ITEM: 'tozee__item',
        LETTER: 'tozee__letter',

        // Modifiers
        STICKY: 'sticky',
        COMPACT: 'compact'
    };

    /**
     * Function.prototype.bind polyfill required for < iOS6
     */
    /* jshint ignore:start */
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {},
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis
                            ? this
                            : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }
    /* jshint ignore:end */

    function Tozee(element, options) {
        Tozee.__super__.call(this, element, options, Tozee.DEFAULTS);
    }

    Tozee.VERSION = '0';

    Tozee.DEFAULTS = {
        alphaSet: ['#', 'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        skipLetters: false,
        minLetterHeight: 24,
        resizingDelta: 1
    };


    Plugin.create('tozee', Tozee, {
        _init: function(element) {
            this.$element = $(element);
            this.$list = this.$element.find('.' + classes.LIST);
            this.$items = this.$list.children();

            if (!this.$items.length) {
                throw new Error('Tozee must be initialized against an element that contains a non-empty list');
            }

            this._createBar();
            this._bindEvents();

            // Reset state
            this._positionHandler();
        },

        destroy: function() {
            this.$element.removeData(this.name);

            this.$bar.remove();
            this.$bar = [];

            this.$element
                .removeClass(classes.STICKY)
                .removeClass(classes.COMPACT);
        },


        // Create alphabet bar
        // ===================
        _createBar: function() {
            var self = this;
            var barHTML = '<ul class="' + classes.BAR + '">';

            // Filter alphabet: find only those letters that exist in the list
            $.each(this.options.alphaSet, function(_, letter) {
                if ((self.options.skipLetters || letter === '#') && !self._getTarget(letter).length) {
                    return;
                }

                barHTML += '<li class="' + classes.LETTER + '"  data-tozee="' + letter + '">' + letter + '</li>';
            });

            barHTML += '</ul>';

            // Crete bar DOM
            this.$bar = $(barHTML);

            // Append bar to the document DOM
            this.$bar.appendTo(this.$element);
        },


        // Bind Events
        // ===========
        _bindEvents: function() {
            $(window)
                .on('resize scroll touchmove', this._positionHandler.bind(this));

            this.$bar
                .on('click touchstart touchmove', this._touchHandler.bind(this));
        },

        // Letter touch event handler
        _touchHandler: function(e) {
            e.preventDefault();

            var letter = this._getTouchedLetter(e);

            // check if touchmove element returns an element within the Tozee list panel
            if (letter) {
                this._selectLetter(letter);
            }

            return false;
        },

        // Find letter under touch position
        _getTouchedLetter: function(event) {
            // Get element under the finger
            // Why so complicated?
            // Because touchmove only returns an element that had touchstart and we want constantly update scroll position while moving through the letters
            var $letter;
            var eTouches = event.touches || (event.originalEvent && event.originalEvent.touches);

            if (eTouches) {
                // Touch screen
                $letter = $(document.elementFromPoint(eTouches[0].pageX - window.pageXOffset, eTouches[0].pageY - window.pageYOffset));

                    // if (!$letter.length) {
                    //     // iOS4 and lower calculates elementFromPoint based on document rather than viewport
                    //     $letter = $(document.elementFromPoint(eTouches[0].pageX, eTouches[0].pageY));
                    // }
            } else {
                // Desktop browser (including Chrome with emulation enabled)
                $letter = $(event.target);
            }

            var letter = $letter.closest('.' + classes.LETTER).attr('data-tozee');

            console.log('TOZEE', event.touches, letter);

            return letter;
        },

        // Handle letter selection
        _selectLetter: function(letter) {
            var $destination = this._getTarget(letter);
            var letterIndex = this.options.alphaSet.indexOf(letter);

            if (!$destination.length) {
                // Find closest existing letter in the list
                // if the letter that is touched is not represented
                // First walk up the list to find previous available letter
                while (!$destination.length && letterIndex >= 0) {
                    letterIndex--;
                    $destination = this._getTarget(this.options.alphaSet[letterIndex]);
                }
                // Then walk down the list to find next available letter
                while (!$destination.length && letterIndex < this.options.alphaSet.length) {
                    letterIndex++;
                    $destination = this._getTarget(this.options.alphaSet[letterIndex]);
                }

                if (!$destination.length) {
                    console.log('TOZEE', 'Could not find target for letter', letter);
                    return false;
                }
            }

            var top = $destination.offset().top;
            var limits = this._getScrollLimits();

            if (top > limits.bottom) {
                top = limits.bottom;
            }

            this.$element.trigger('tozeeScroll', letter, $destination);
            this._scrollTo(top);
        },


        // Handle Tozee bar position and size change on page
        _positionHandler: function() {
            if (!this.$bar.length) {
                return false;
            }

            this._setHeight();
            this._setPosition();
            this._skipLetters();
        },

        // Resize Bar
        _setHeight: function() {
            // Update bar height if window size has changed more thant resizingDelta
            if (this.barHeight && Math.abs(window.innerHeight - this.barHeight) < this.options.resizingDelta) {
                return false;
            }

            this.barHeight = window.innerHeight;

            this.$bar.css({
                height: this.barHeight
            });
        },

        // Figure out if any letters should be skipped due based on their density
        // e.g in landscape mode
        _skipLetters: function() {
            // Find what step is required so that letter hight was more than this.options.minLetterHeight
            var $letters = this.$bar.find('.' + classes.LETTER);
            var barInnerHeight = this.$bar.height();
            var letterStep = Math.ceil(this.options.minLetterHeight * $letters.length / barInnerHeight);

            // Display letters according to step rule
            $.each($letters, function(i, letter) {
                var $letter = $(letter);

                // Skip letters
                // NOTE: make sure the first and last one are always visible
                $letter.prop('hidden', (i > 0 && i < $letters.length - 1 && i % letterStep !== 0));
            });

            // Calculate relative height for visible letters
            var letterHeight = 100 / $letters.not('[hidden]').length;

            $letters.css({
                height: letterHeight + '%'
            });

            // Toggle classname on the bar to indicate if all letters are shown
            this.$element.toggleClass(classes.COMPACT, letterStep > 1);
        },

        _setPosition: function() {
            var self = this;
            var top = window.pageYOffset;
            var limits = this._getScrollLimits();
            var stickyClass = classes.STICKY;

            if (top < limits.top) {
                this.$element.removeClass(stickyClass);
                this.$bar.css({
                    top: 0,
                    bottom: 'auto'
                });
            } else if (top > limits.bottom && limits.bottom > limits.top) {
                this.$element.removeClass(stickyClass);
                this.$bar.css({
                    top: 'auto',
                    bottom: 0
                });
            } else {
                this.$element.addClass(stickyClass);
                this.$bar.css({
                    top: 0,
                    bottom: 0
                });
            }
        },


        // Utils
        // =====

        // Find scrolling boundries
        _getScrollLimits: function() {
            // returns object that contains min and max container top position
            return {
                'top': this.$element.offset().top,
                'bottom': this.$element.offset().top + this.$element.height() - this.$bar.height()
            };
        },

        // Find letter target
        _getTarget: function(letter) {
            return this.$list.find('[data-tozee="' + letter + '"]').first();
        },

        // Scrolling engine
        _scrollTo: function(top) {
            window.scrollTo(0, top);
        }
    });

    return $;
}));
