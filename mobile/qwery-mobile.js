/*!
  * Qwery - A Blazing Fast query selector engine
  * https://github.com/ded/qwery
  * copyright Dustin Diaz & Jacob Thornton 2012
  * MIT License
  */

(function (name, definition, context) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof context['define'] != 'undefined' && context['define'] == 'function' && context['define']['amd']) define(name, definition)
  else context[name] = definition()
})('qwery', function () {

  var classOnly = /^\.([\w\-]+)$/
    , doc = document
    , win = window
      html = doc.documentElement
      isAncestor = 'compareDocumentPosition' in html ?
        function (element, container) {
          return (container.compareDocumentPosition(element) & 16) == 16
        } :
        function (element, container) {
          container = container == doc || container == window ? html : container
          return container !== element && container.contains(element)
        }

  function toArray(ar) {
    return [].slice.call(ar, 0)
  }

  function isNode(el, t) {
    return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
  }

  function uniq(ar) {
    var a = [], i, j
    label: for (i = 0; i < ar.length; i++) {
      for (j = 0; j < a.length; j++) {
        if (a[j] == ar[i]) {
          continue label
        }
      }
      a[a.length] = ar[i]
    }
    return a
  }

  function qwery(selector, _root, m) {
    var root = (typeof _root == 'string') ? qwery(_root)[0] : (_root || doc)
    if (!root || !selector) {
      return []
    }
    if (doc.getElementsByClassName && selector == 'string' && (m = selector.match(classOnly))) {
      return toArray((root).getElementsByClassName(m[1]))
    }
    if (selector == win || selector == doc) {
      return !_root ? [selector] : [null]
    }
    if (isNode(selector)) {
      return !root || (isAncestor(selector, root)) ? [selector] : []
    }
    return toArray((root).querySelectorAll(selector))
  }


  qwery.uniq = uniq

  return qwery
}, this);