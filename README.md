Q('wery') - The Tiny Selector Engine
-----
Qwery is a 1k *blazing fast* query selector engine allowing you to select elements with CSS1 & CSS2 selectors (including [attribute selectors](http://www.w3.org/TR/css3-selectors/#attribute-selectors)).

Acceptable queries
---------------

``` js
// basic
#foo // id
.bar // class
#foo a // descendents
#foo a.bar element attribute combination

// attributes
#foo a[href] // simple
#foo a[href=bar] // attribute values
#foo a[href^="http://"] // attribute starts with
#foo a[href$=com] // attribute ends with
#foo a[href*=twitter] // attribute wildcards
#foo a[lang|=en] // subcodes

// combos
div,p

// variations
#foo.bar.baz
div#baz.thunk a[-data-info*="hello world"] strong
#thunk[title$='huzza']
```

Contexts
-------
Each query can optionally pass in a context

``` js
qwery('div', node); // existing DOM node or...
qwery('div', '#foo'); // another query
```

Browser Support
---------------
  - IE6, IE7, IE8, IE9
  - Chrome 1 - 10
  - Safari 3, 4, 5
  - Firefox 2, 3, 4

Build
-----
Qwery uses [JSHint](http://www.jshint.com/) to keep some house rules as well as [UglifyJS](https://github.com/mishoo/UglifyJS) for its compression. For those interested in building Qwery yourself. Run *make* in the root of the project.

Tests
-----

    $ open tests/index.html

Note
----
Qwery uses querySelectorAll when available. All querySelectorAll default behavior then applies.

Ender support
-------------
Qwery is the recommended selector engine for [Ender](http://ender.no.de). If you don't have Ender, install it, and don't ever look back.

    $ npm install ender -g

To include Query in a custom build of Ender you can include it as such:

    $ ender -b qwery[,mod2,mod3,...]

Or add it to an existing Ender installation

    $ ender add qwery

Ender bridge additions
---------
Assuming you already know the happs on Ender -- Qwery provides some additional niceties when included with Ender:

``` js
// the context finder - find all p elements descended from a div element
$('div').find('p')

// join one set with another
$('div').and('p')

// element creation
$('<p>hello world</p>'); // => [HTMLParagraphElement "hello world"]
```
Recommended sibling modules
----------
In most cases, if you're hunting for a selector engine, you probably want to pair Qwery with a DOM module. In that case qwery pairs quite nicely with [Bonzo](https://github.com/ded/bonzo) (a DOM util) and [Bean](https://github.com/fat/bean) (an event util). Add them to your Ender installation as such:

    $ ender -b qwery bonzo bean

Then write code like a boss:

``` js
$('a.boosh')
  .css({
    color: 'red',
    background: 'white'
  })
  .after('√')
  .bind({
    'click.button': function () {
      $(this).hide().remove('click.button');
    }
  });
```

Qwery Mobile!
------------
If you're building a Webkit (iPhone / Android / Chrome OS) application, you may be interested in qwery-mobile! Include this (instead of qwery) in your Ender build and get a full qwery interface for just 600 bytes :)

    $ ender add qwery-mobile

Contributors
-------
  * [Dustin Diaz](https://github.com/ded/qwery/commits/master?author=ded)
  * [Jacob Thornton](https://github.com/ded/qwery/commits/master?author=fat)
