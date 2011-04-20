domReady
--------
It's easy. Works like this:

    domReady(function () {
      // dom is loaded!
    });

Browser support
---------------

  * IE6,7,8,9
  * Firefox 2,3,4
  * Safari 3,4,5
  * Chrome 1-10
  * Opera

Building
--------

    git clone git://github.com/ded/domready.git
    cd domready
    git submodule update --init
    make

Including with Ender
--------------------
Don't already have [Ender](http://ender.no.de)? Ender relies on [Node](http://nodejs.org), and [NPM](http://npmjs.org). Install it like this:

    npm install ender

Once you're good with that. Include domready in your package:

    ender -b domready[,a,b,c]

With Ender:

    $.domReady(function () {
      $(document.body).html('<p>boosh</p>');
    });