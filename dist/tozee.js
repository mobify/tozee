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
        INNERBAR: 'tozee__bar-inner',
        ITEM: 'tozee__item',
        LETTER: 'tozee__letter',

        // Modifiers
        STICKY: 'sticky',
        OVERFLOWSCROLL: 'scrollable',
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

    Tozee.VERSION = '1.1.2';

    Tozee.DEFAULTS = {
        alphaSet: ['#', 'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        skipLetters: false,
        minLetterHeight: 20,
        resizingDelta: 1,
        overflowScroll: false
    };


    Plugin.create('tozee', Tozee, {
        _init: function(element) {
            this.$element = $(element);
            this.$list = this.$element.find('.' + classes.LIST);
            this.$items = this.$list.children();

            if (!this.$items.length) {
                throw new Error('Tozee must be initialized against an element that contains a non-empty list');
            }

            if (this.options.overflowScroll) {
                this.$list.addClass(classes.OVERFLOWSCROLL);
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
            var barHTML = '<nav class="' + classes.BAR + '"><ul class="' + classes.INNERBAR + '">';

            // Filter alphabet: find only those letters that exist in the list
            $.each(this.options.alphaSet, function(_, letter) {
                if ((self.options.skipLetters || letter === '#') && !self._getTarget(letter).length) {
                    return;
                }

                barHTML += '<li class="' + classes.LETTER + '"  data-tozee="' + letter + '">' + letter + '</li>';
            });

            barHTML += '</ul></nav>';

            // Crete bar DOM
            this.$bar = $(barHTML);
            this.$inner = this.$bar.find('.' + classes.INNERBAR);
            this.$letters = this.$bar.find('.' + classes.LETTER);

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

            return this._selectLetter(letter);
        },

        // Find letter under touch position
        _getTouchedLetter: function(e) {
            // Get element under the finger
            // NOTE: touchmove only returns an element that had touchstart and we want constantly update scroll position while moving through the letters
            var eTouches = e.touches || (e.originalEvent && e.originalEvent.touches);
            var event = (eTouches) ? eTouches[0] : e;
            var innerOffset = this.$inner.offset();
            var letter;

            // Get touch position in the bar to access even those letters that are currently hidden
            // The letter is calculated based on the relative position of the tap on the bar.
            var barTouchedPosition = (event.pageY - innerOffset.top - this.$letters.first().height() / 2) / (this.$inner.height() - this.$letters.first().height() / 2 - this.$letters.last().height() / 2);

            // Normalize bar tap position
            barTouchedPosition = Math.max(0,  Math.min(1, barTouchedPosition));

            var letterTouchedID = Math.round((this.$letters.length - 1) * barTouchedPosition);
            letter = this.$letters.eq(letterTouchedID).attr('data-tozee');

            console.log(letter, letterTouchedID, (this.$letters.length - 1)  * barTouchedPosition, barTouchedPosition);

            return letter;
        },

        // Handle letter selection
        _selectLetter: function(letter) {
            // check if touchmove element returns an element within the Tozee list panel
            if (!letter) {
                return false;
            }

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

            var top;
            var limits;

            if (this.options.overflowScroll) {
                top = this.$list.scrollTop() + $destination.position().top;
            } else {
                top = $destination.offset().top;
                limits = this._getScrollLimits();

                if (top > limits.bottom) {
                    top = limits.bottom;
                }
            }

            this.$element.trigger('tozeeScroll', letter, $destination);
            this._scrollTo(top);

            return true;
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
            var newHeight = (this.options.overflowScroll) ? this.$element.height() :  window.innerHeight;

            // Update bar height if window size has changed more thant resizingDelta
            if (this.barHeight && Math.abs(newHeight - this.barHeight) < this.options.resizingDelta) {
                return false;
            }

            this.barHeight = newHeight;

            this.$bar.css({
                height: this.barHeight
            });
        },

        // Figure out if any letters should be skipped due based on their density
        // e.g in landscape mode
        _skipLetters: function() {
            // Find what letters step is required so that letter hight was more than this.options.minLetterHeight
            var self = this;
            var letterStep = Math.ceil(this.options.minLetterHeight * this.$letters.length / this.$inner.height());

            // Display letters according to step rule
            $.each(this.$letters, function(i, letter) {
                var $letter = $(letter);

                // Skip letters
                // NOTE: make sure the first and last one are always visible
                $letter.prop('hidden', (i > 0 && i < self.$letters.length - 1 && i % letterStep !== 0));
            });

            // Calculate relative height for visible letters
            var letterHeight = 100 / this.$letters.not('[hidden]').length;

            this.$letters.css({
                height: letterHeight + '%'
            });

            // Toggle classname on the bar to indicate if all letters are shown
            this.$element.toggleClass(classes.COMPACT, letterStep > 1);
        },

        _setPosition: function() {
            if (this.options.overflowScroll) {
                return;
            }

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
            if (this.options.overflowScroll) {
                this.$list.scrollTop(top);
            } else {
                window.scrollTo(0, top);
            }
        }
    });

    return $;
}));
