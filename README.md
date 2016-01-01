# ToZee

A mobile-first alphabetic scroll jumping list

## Usage

    <!-- include tozee.css -->
    <link rel="stylesheet" href="tozee.css">

    <!-- the viewport -->
    <div class="m-tozee">
        <!-- the content list -->
        <div class="m-tozee__list">
            <!-- the items -->
            <div data-tozee="a">
              A
            </div>
            <div data-tozee="b">
              B
            </div>
            <div data-tozee="c">
              C
            </div>
        </div>
    </div>

    <!-- include zepto.js or jquery.js -->
    <script src="zepto.js"></script>
    <!-- include tozee.js -->
    <script src="tozee.js"></script>
    <!-- construct the carousel -->
    <script>$('.m-tozee').tozee()</script>



## Methods

### .tozee(options)

Constructs the alphabetic bar with options.

    $('.m-tozee').tozee({
        alphaSet: ['#', 'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
      , skipLetters: true
      , minLetterHeight: 24
      , ignoreResizeDelta: 1
      , overflowScroll: false
      , classPrefix: 'm-'
      , classNames: {
            outer: 'tozee'
          , list: 'tozee__list'
          , bar: 'tozee__bar'
          , item: 'tozee__item'
          , letter: 'tozee__letter'
          , sticky: '-stick'
        }
    });

`skipLetters (bool)` — if true, only letters present in the list will be displayed. If fallse, all letters A to Z will be displayed, however # symbol would still be conditional if resent in the list.

`minLetterHeight (int)` — minimal height of a single letter. If letters appear to dense, every n-th letter will be skipped to sutisfy this height.
This is recalculated on orientation change and window resize.

`ignoreResizeDelta (int)` — do not recalculate bar height for minor window resizes (e.g. address bar shown or hidden in mobile browser). The value represents window height change delta that should be considered minor (e.g. use `70` for targeting iOS8 address and footer bar)

`overflowScroll (bool)` — if true, the list is handled as the one with a fixed height and overflow: scroll. As opposed to a static list in page main content that is scrolled with the page (default behavior). Use this property for styling lists in modals.

### .tozee('destroy')

Removes the alphabetic bar and its event handlers from the DOM.

    $('.m-tozee').tozee('destroy');


## Events

The viewport emits the following events:

| Name          | Arguments                 | Description                               |
|---------------|---------------------------|-------------------------------------------|
| tozeeScroll   | letter, $target           | Fired before scrolling to element         |

## Browser Compatibility

### Mobile Browsers

The following mobile browsers are fully supported:

| Browser           | Version |
|-------------------|---------|
| Mobile Safari     | 6.0+    |
| Android           | 4.1+    |

## Building
### Requirements
* [node.js 0.8.x/npm](http://nodejs.org/download/)

### Steps
1. `npm install -g grunt-cli`
2. `npm install`
3. `grunt`

The build directory will be populated with minified versions of the css and
javascript files and a .zip of the original source files (for distribution and
use with whatever build system you might use).


