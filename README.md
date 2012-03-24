Qwery - The Tiny Selector Engine
-----
Qwery is a small *blazing fast* query selector engine allowing you to select elements with CSS1|2|3|4 queries

##Acceptable selectors

``` css
basic
#foo {} id
.bar {} class
a#foo.bar {} element attribute combinations

attributes
#foo a[href] {} simple
#foo a[href=bar] {} attribute values
#foo a[lang|=en] {} subcodes
#foo a[title~=hello] {} attribute contains
#foo a[href^="http://"] {} attribute starts with
#foo a[href$=com] {} attribute ends with
#foo a[href*=twitter] {} attribute wildcards

descendants
#foo a {} all descendants
ul#list > li {} direct children
> div.foo {} relationship-first, direct child of context

siblings
span ~ strong {} all adjacent
p + p {} immediate adjacent

combos
div,p {}

variations
#foo.bar.baz {}
div#baz.thunk a[-data-info*="hello world"] span + strong {}
#thunk[title$='huzza'] {}

CSS 4 selector subjects
div! > .foo {} select the div
```

Contexts
-------
Each query can optionally pass in a context

``` js
qwery('div', node); // existing DOM node or...
qwery('div', '#foo'); // another query
```

Pseudo selectors
-------------------
Optionally, Qwery provides a [pseudo selector interface](https://github.com/ded/qwery/blob/master/pseudos/qwery-pseudos.js) allowing you to extend into advanced CSS 3 & 4 matchers.

Currently implemented pseudo selectors:

```
:contains(str) {} textual child content contains str
:matches(sel) {} matches given sub-selector
:not(sel) {} does not match given sub-selector
:nth-child(n) {} n-th child of its parent
:nth-last-child(n) {} n-th child of its parent, counting from the last one 
:nth-of-type(n) {} n-th sibling of its type
:nth-last-of-type(n) {} n-th sibling of its type, counting from the last one
:nth-match(n of sel) {} n-th match of given sub-selector
:nth-match(n of sel) {} n-th match of given sub-selector, counting from the last one
:first-child
:last-child
:first-of-type
:last-of-type
:only-child
:only-of-type
:checked {} element is 'checked'
:enabled {} element is not 'disabled'
:disabled {} element is 'disabled'
:empty {} element has no children, not even text
:target {} element is the target of the current URI

##Pseudo selector API

Implementing custom pseudo selectors is easy:

``` js
qwery.pseudos['first-child'] = function (el, val) {
  var p;
  return el.parentNode && (p = el.parentNode) && (childs = p.getElementsByTagName('*')) && childs[0] == el;
};
```

To create a new pseudo matcher you must set a property on `qwery.psuedos` with a boolean method that is passed back a candidate element, and a value (if any). For example:

``` js
qwery('#content p.surprise:foo(bar)')

qwery.pseudos.foo = function (el, val) {
  // val == 'bar'
  return el.getAttribute(val)
}

qwery.pseudos.humanoid = function (el, val) {
  return qwery.is(el, 'li:contains(human)') || qwery.is(el, 'ol:contains(human)')
}
``

Configuring Qwery
-----------------

The `configure()` method takes an options object allowing you to adjust the way that Qwery works internally. Currently only the `useNativeQSA` option is available to turn on and off the use of native `querySelectorAll()` where available.

``` js
qwery.configure({
  useNativeQSA: false
})
```

Browser Support
---------------
Qwery attempts to stay up to date with Yahoo's [Grade A Browser Support](http://developer.yahoo.com/yui/articles/gbs) in addition to future browser candidates.

  - IE6+
  - Chrome 1+
  - Safari 3+
  - Firefox 2+
  - Opera

Dev Env & Testing
-----

    $ npm install smoosh sink-test
    $ make
    $ open tests/index.html

Note
----
Qwery uses <code>querySelectorAll</code> when available. All <code>querySelectorAll</code> default behavior then applies.

Ender support
-------------
Qwery is the recommended selector engine for [Ender](http://ender.no.de). If you don't have Ender, install it, and don't ever look back.

    $ npm install ender -g

To include Query in a custom build of Ender you can include it as such:

    $ ender build qwery [module2 [module3 ...]]

Or add it to an existing Ender installation

    $ ender add qwery

## Pseudo selectors in Ender

Use *qwery-pseudos* to include the pseudo selectors module in an Ender build:

    $ ender build qwery qwery-pseudos [module3 [module4 ...]]

Ender bridge additions
---------
Assuming you already know the happs on Ender -- Qwery provides some additional niceties when included with Ender:

``` js
// the context finder - find all p elements descended from a div element
$('div').find('p')

// join one set with another
$('div').and('p')

// test nodes against selectors
$('#foo').is('div.bar'); // => true if any nodes match

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
      $(this).hide().unbind('click.button')
    }
  })
```

Qwery Mobile!
------------
If you're building a Webkit (iPhone / Android / Chrome OS) application, you may be interested in qwery-mobile! Include this (instead of qwery) in your Ender build and get a full qwery interface for just 600 bytes :)

    $ ender add qwery-mobile

Contributors
-------
  * [Dustin Diaz](https://github.com/ded/qwery/commits/master?author=ded)
  * [Rod Vagg](https://github.com/ded/qwery/commits/master?author=rvagg)
  * [Jacob Thornton](https://github.com/ded/qwery/commits/master?author=fat)
  * [Andrew McCollum](https://github.com/ded/qwery/commits/master?author=amccollum)
