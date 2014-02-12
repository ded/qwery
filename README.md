## Qwery
Qwery is a modern selector engine built on top of `querySelectorAll` giving you practical utility.

## Deprecation Notice!

As of version `4.0`, `qwery` no longer supports IE6 - IE8. If your application still requires this level of support, please see the final [`3.x` release](https://github.com/ded/qwery/tree/v3.4.2).

### Browser Support

  - IE9+
  - Chrome 1+
  - Safari 3+
  - Firefox 4+


### Contexts
Each query can optionally pass in a context

``` js
qwery('div', node); // existing DOM node or...
qwery('div', '#foo'); // another query
```


### Dev Env & Testing

``` sh
npm install
make
open tests/index.html
```

## Ender support
Qwery is the recommended selector engine for [Ender](http://enderjs.com). If you don't have Ender, install it, and don't ever look back.

``` sh
npm install ender -g
```

Include `qwery` into your `package.json`

``` json
{
  "dependencies": {
    "qwery": "x.x.x"
  }
}
```

### Ender bridge additions

``` js
// the context finder - find all p elements descended from a div element
$('div').find('p')

// join one set with another
$('div').and('p') // equal to $('div,p')
```

### Recommended sibling modules
In most cases, if you're hunting for a selector engine, you probably want to pair Qwery with a DOM module. In that case qwery pairs quite nicely with [Bonzo](https://github.com/ded/bonzo) (a DOM util) and [Bean](https://github.com/fat/bean) (an event util). Add them to your Ender installation as such:

``` sh
ender build qwery bean bonzo
```

Then write code like a boss:

``` js
$('<p>hello world</p>')
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
  .appendTo('body')
```

### Giving back
Are you using this library in production? Consider [leaving a tip](https://www.gittip.com/ded) to show your appreciation.
