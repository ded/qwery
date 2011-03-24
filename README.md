Qwery - The Tiny Selector Engine
-----
<!-- See the [original post](http://dustindiaz.com/qwery) for introduction de -->
Qwery is a 1k selector query engine allowing you to select elements with CSS1 & CSS2 queries, with the exception of (commonly used) [attribute selectors](http://www.w3.org/TR/css3-selectors/#attribute-selectors) from CSS3.

Acceptable queries
---------------

    // basic
    #foo // id
    .bar // class
    #foo a // descendents
    #foo a.bar element attribute comibination

    // attributes
    #foo a[href] // simple
    #foo a[href=bar] // attribute values
    #foo a[href^=http://] // attribute starts with
    #foo a[href$=com] // attribute ends with
    #foo a[href*=twitter] // attribute wildcards

    // combos
    div,p

Contexts
-------
Each query can optionally pass in a context

    qwery('div', node); // existing DOM node or...
    qwery('div', '#foo'); // another query

Build
-----
Qwery uses [JSHint](http://www.jshint.com/) to keep some house rules as well as [UglifyJS](https://github.com/mishoo/UglifyJS) for its compression. For those interested in building Qwery yourself. Run *make* in the root of the project.

Tests
-----
point your browser at _qwery/tests/index.html_

Contributors
-------
  * [Dustin Diaz](https://github.com/polvero)
  * [Jacob Thornton](https://github.com/jacobthornton)
