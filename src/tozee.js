/*
    Create alphabetical panel for faster navigation over long lists

    $('.m-tozee').tozee();
*/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        /*
         In AMD environments, you will need to define an alias
         to your selector engine. i.e. either zepto or jQuery.
         */
        define(['$'], factory);
    } else {
        /*
         Browser globals
         */
        var selectorLibrary = window.Mobify && window.Mobify.$ || window.Zepto || window.jQuery;
        factory(selectorLibrary);
    }
}(function ($) {
    var Utils = (function($) {

    })($);

    var Tozee = (function($, Utils) {
        var defaults = {
            alphaSet: ['#', 'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
          , skipLetters: true
          , classPrefix: 'm-'
          , classNames: {
                outer: 'tozee'
              , list: 'tozee__list'
              , bar: 'tozee__bar'
              , item: 'tozee__item'
              , letter: 'tozee__letter'
              , sticky: '-stick'
            }
        }


        // Constructor
        var Tozee = function(element, options) {
            this.setOptions(options);
            this.initElements(element);

            this.createBar();
            this.bind();
        };

        // Expose Defaults
        Tozee.defaults = defaults;

        Tozee.prototype.setOptions = function(opts) {
            var options = this.options || $.extend({}, defaults, opts);

            /* classNames requires a deep copy */
            if (opts) {
                options.classNames = $.extend({}, options.classNames, opts.classNames || {});
            }

            this.options = options;
        };


        Tozee.prototype.initElements = function(element) {
            this.$element = $(element);

            if (!this.$element.length) {
                return false;
            }

            this.$list = this.$element.find('.' + this._getClass('list'));
            this.$items = this.$list.children();
            this.$bar;
        };

        Tozee.prototype.createBar = function() {
            var self = this;
            var barHTML = '<ul class="' + this._getClass('bar') + '">';

            // Filter alphabet: find only those letters that exist in the list
            $.each(this.options.alphaSet, function(_, letter){
                if (self.options.skipLetters && !self._getTarget(letter).length) {
                    return;
                }

                barHTML += '<li class="' + self._getClass('letter') + '"  data-tozee="' + letter + '">' + letter + '</li>';
            });


            barHTML += '</ul>';

            this.$bar = $(barHTML);
            this.$bar.appendTo(this.$element);
        };


        Tozee.prototype.bind = function() {
            var self = this;

            // Letter touch event handler
            this.$bar.on('click touchstart touchmove', function(e){
                e.preventDefault();

                var $letter = self._getTouchedLetter(e);

                if (!$letter || !$letter.length) {
                    return false;
                }

                var letter = $letter.closest('.' + self._getClass('letter')).attr('data-tozee');

                // check if touchmove element returns an element within the Tozee list panel
                if (letter) {
                    self._callback(letter);
                }

                return false;
            });

            this._bindSroll();
        };

        Tozee.prototype._bindSroll = function(){
            var self = this;

            // limit positioning of Tozee list sticket to its content when scrolling
            $(window).on('scroll touchmove', function() {
                self._scrollHandler();
            });

            // Initial positioning
            this._scrollHandler();

            // Fix initial appearance
            // window.setInterval(function(){
            //     self._scrollHandler();
            // }, 1);
        };

        Tozee.prototype._scrollHandler = function() {
            var top = window.pageYOffset;
            var limits = this._getLimits();
            var stickyClass = this._getClass('sticky');

            this.$bar.css({
                height: window.innerHeight
            });

            if (top < limits.top) {
                this.$bar
                    .removeClass(stickyClass)
                    .css({
                        top: 0
                    });
            } else if (top > limits.bottom && limits.bottom > limits.top) {
                this.$bar
                    .removeClass(stickyClass)
                    .css({
                        top: limits.bottom - limits.top
                    });
            } else {
                this.$bar
                    .addClass(stickyClass)
                    .css({
                        top: 0
                    });
            }
        };

        Tozee.prototype._callback = function(letter) {
            var $destination = this._getTarget(letter);

            if (!$destination.length) {
                return false;
            }

            var top = $destination.offset().top;
            var limits = this._getLimits();

            if (top > limits.bottom) {
                top = limits.bottom;
            }

            this.$element.trigger('tozeeScroll', letter, $destination);
            this._scrollTo(top);
        };



        Tozee.prototype._getClass = function(id) {
            return this.options.classPrefix + this.options.classNames[id];
        };

        Tozee.prototype._getLimits = function() {
            // returns object that contains min and max container top position
            return {
                'top': this.$element.offset().top,
                'bottom': this.$element.offset().top + this.$element.height() - this.$bar.height()
            };
        };

        Tozee.prototype._getTarget = function(letter) {
            return this.$list.find('[data-tozee="' + letter + '"]');
        };

        Tozee.prototype._getTouchedLetter = function(event) {
            // Get element under the finger
            // Why so complicated?
            // Because touchmove only returns an element that had touchstart and we want constantly update scroll position while moving through the letters
            var $letter;
            var eTouches = event.touches || event.originalEvent.touches;

            if (eTouches) {
                // Touch screen
                $letter = $(document.elementFromPoint(eTouches[0].pageX - window.pageXOffset, eTouches[0].pageY - window.pageYOffset));

                if(!$letter.length) {
                    // iOS4 and lower calculates elementFromPoint based on document rather than viewport
                    $letter = $(document.elementFromPoint(eTouches[0].pageX, eTouches[0].pageY));
                }
            } else {
                // Desktop browser (including Chrome with emulation enabled)
                $letter = $(event.target)
            }

            if (!$letter || !$letter.length) {
                return false;
            }

            console.log(event.touches, $letter.html());
            return $letter;
        };

        Tozee.prototype._scrollTo = function(top) {
            window.scrollTo(0, top);
        };

        Tozee.prototype.destroy = function() {
            this.$bar.remove();
        };

        return Tozee;

    })($, Utils);


    /**
        jQuery interface to set up a Tozee scroll bar


        @param {String} [action] Action to perform. When no action is passed, the carousel is simply initialized.
        @param {Object} [options] Options passed to the action.
    */
    $.fn.tozee = function (action, options) {
        var initOptions = $.extend({}, $.fn.tozee.defaults);

        // Handle different calling conventions
        if (typeof action == 'object') {
            $.extend(initOptions, action, true);
            options = null;
            action = null;
        }

        options = Array.prototype.slice.apply(arguments);

        this.each(function () {
            var $this = $(this)
              , tozee = this._tozee;


            if (!tozee) {
                tozee = new Tozee(this, initOptions);
            }

            if (action) {
                tozee[action].apply(tozee, options.slice(1));

                if (action === 'destroy') {
                    tozee = null;
                }
            }

            this._tozee = tozee;
        });

        return this;
    };

    $.fn.tozee.defaults = {};
}));