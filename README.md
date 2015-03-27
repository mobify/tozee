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
        skipLetters: true,
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


