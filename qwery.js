/*!
  * Qwery - A Blazing Fast query selector engine
  * https://github.com/ded/qwery
  * copyright Dustin Diaz & Jacob Thornton 2011
  * MIT License
  */

!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
}('qwery', function () {
  var context = this
    , doc = document
    , old = context.qwery
    , c, i, j, k, l, m, o, p, r, v
    , el, node, classes, item, items, token
    , html = doc.documentElement
    , id = /#([\w\-]+)/
    , clas = /\.[\w\-]+/g
    , idOnly = /^#([\w\-]+$)/
    , classOnly = /^\.([\w\-]+)$/
    , tagOnly = /^([\w\-]+)$/
    , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
    , normalizr = /\s*([\s\+\~>])\s*/g
    , splitters = /[\s\>\+\~]/
    , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
    , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
    , simple = /^([a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
    , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
    , pseudo = /:([\w\-]+)(\(['"]?([\s\w\+\-]+)['"]?\))?/
    , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
    , tokenizr = new RegExp(splitters.source + splittersMore.source)
    , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')
    , walker = {
        ' ': function (node) {
          return node && node !== html && node.parentNode
        }
      , '>': function (node, contestant) {
          return node && node.parentNode == contestant.parentNode && node.parentNode
        }
      , '~': function (node) {
          return node && node.previousSibling
        }
      , '+': function (node, contestant, p1, p2) {
          if (!node) return false
          p1 = previous(node)
          p2 = previous(contestant)
          return p1 && p2 && p1 == p2 && p1
        }
      }
    , hrefExtended = function() {
        var e = doc.createElement('p')
        return (e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x'
      }()

  function cache() {
    this.c = {}
  }
  cache.prototype = {
      g: function (k) {
        return this.c[k] || undefined
      }
    , s: function (k, v) {
        this.c[k] = v
        return v
      }
  }

  var classCache = new cache()
    , cleanCache = new cache()
    , attrCache = new cache()
    , tokenCache = new cache()

  function flatten(ar) {
    r = []
    for (i = 0, l = ar.length; i < l; i++) {
      if (arrayLike(ar[i])) r = r.concat(ar[i])
      else r.push(ar[i])
    }
    return r
  }

  function previous(n) {
    while (n = n.previousSibling) if (n.nodeType == 1) break;
    return n
  }

  function getAttr(e, a) {
    return (a == 'href' || a == 'src') && hrefExtended ? e.getAttribute(a, 2) : e.getAttribute(a)
  }

  function q(query) {
    return query.match(chunker)
  }

  // this next method expect at most these args
  // given => div.hello[title="world"]:foo('bar')

  // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]

  function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
    var m, c, k;
    if (tag && this.tagName.toLowerCase() !== tag) return false
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) {
        c = classes[i].slice(1)
        if (!(classCache.g(c) || classCache.s(c, new RegExp('(^|\\s+)' + c + '(\\s+|$)'))).test(this.className)) {
          return false
        }
      }
    }
    if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) {
      return false
    }
    if (wholeAttribute && !value) {
      o = this.attributes
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
      return false
    }
    return this
  }

  function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, new RegExp('^' + clean(val))))
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, new RegExp(clean(val) + '$')))
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, new RegExp(clean(val))))
    case '~=':
      return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, new RegExp('(?:^|\\s+)' + clean(val) + '(?:\\s+|$)')))
    case '|=':
      return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, new RegExp('^' + clean(val) + '(-|$)')))
    }
    return 0
  }

  function _qwery(selector) {
    var r = [], ret = [], i, j = 0, k, l, m, p, token, tag, els, root, intr, item, children
      , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      , dividedTokens = selector.match(dividers)
    tokens = tokens.slice(0) // this makes a copy of the array so the cached original is not affected

    if (!tokens.length) return r

    token = tokens.pop()
    root = tokens.length && (m = tokens[tokens.length - 1].match(idOnly)) ? doc.getElementById(m[1]) : doc

    if (!root) return r

    intr = q(token)
    els = dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ? function (r) {
        while (root = root.nextSibling) {
          root.nodeType == 1 && (intr[1] ? intr[1] == root.tagName.toLowerCase() : 1) && r.push(root)
        }
        return r
      }([]) :
      root.getElementsByTagName(intr[1] || '*')
    for (i = 0, l = els.length; i < l; i++) if (item = interpret.apply(els[i], intr)) r[j++] = item
    if (!tokens.length) return r

    // loop through all descendent tokens
    for (j = 0, l = r.length, k = 0; j < l; j++) {
      if (_ancestorMatch(r[j], tokens, dividedTokens)) {
          ret[k++] = r[j];
      }
    }
    return ret
  }

  function is(el, selector, root) {
    if (isNode(selector)) return el == selector
    
    if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?
    
    var selectors = selector.split(','), tokens, dividedTokens
    while (selector = selectors.pop()) {
      tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      dividedTokens = selector.match(dividers)
      tokens = tokens.slice(0) // copy array
      if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || _ancestorMatch(el, tokens, dividedTokens, root))) {
        return true
      }
    }      
  }
  
  function _ancestorMatch(el, tokens, dividedTokens, root) {
    var p = el, found;
    // loop through each token backwards crawling up tree
    for (i = tokens.length; i--;) {
      // loop through parent nodes
      while (p = walker[dividedTokens[i]](p, el)) {
        if (found = interpret.apply(p, q(tokens[i]))) break;
      }
    }

    if (root && found) found = isAncestor(found, root)

    return !!found
  }
  
  function isNode(el) {
    return (el && el.nodeType && (el.nodeType == 1 || el.nodeType == 9))
  }

  function uniq(ar) {
    var a = [], i, j;
    label:
    for (i = 0; i < ar.length; i++) {
      for (j = 0; j < a.length; j++) {
        if (a[j] == ar[i]) continue label;
      }
      a[a.length] = ar[i]
    }
    return a
  }

  function arrayLike(o) {
    return (typeof o === 'object' && isFinite(o.length))
  }

  function normalizeRoot(root) {
    if (!root) return doc
    if (typeof root == 'string') return qwery(root)[0]
    if (arrayLike(root)) return root[0]
    return root
  }

  function qwery(selector, _root) {
    var root = normalizeRoot(_root)

    if (!root || !selector) return []
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
    }
    if (selector && arrayLike(selector)) return flatten(selector)
    if (m = selector.match(idOnly)) return (el = doc.getElementById(m[1])) ? [el] : []
    if (m = selector.match(tagOnly)) return flatten(root.getElementsByTagName(m[1]))
    return select(selector, root)
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16
    } : 'contains' in html ?
    function (element, container) {
      container = container == doc || container == window ? html : container
      return container !== element && container.contains(element)
    } :
    function (element, container) {
      while (element = element.parentNode) if (element === container) return 1
      return 0
    },

  supportsCSS3 = function () {
    if (!doc.querySelector || !doc.querySelectorAll) return false

    try { return (doc.querySelectorAll(':nth-of-type(1)').length) }
    catch (e) { return false }
  }(),

  select = supportsCSS3 ?
    function (selector, root) {
      return doc.getElementsByClassName && (m = selector.match(classOnly)) ?
        flatten(root.getElementsByClassName(m[1])) :
        flatten(root.querySelectorAll(selector))
    } :
    function (selector, root) {
      selector = selector.replace(normalizr, '$1')
      var result = [], element, collection, collections = [], i
      if (m = selector.match(tagAndOrClass)) {
        items = root.getElementsByTagName(m[1] || '*');
        r = classCache.g(m[2]) || classCache.s(m[2], new RegExp('(^|\\s+)' + m[2] + '(\\s+|$)'));
        for (i = 0, l = items.length, j = 0; i < l; i++) {
          r.test(items[i].className) && (result[j++] = items[i]);
        }
        return result
      }
      for (i = 0, items = selector.split(','), l = items.length; i < l; i++) {
        collections[i] = _qwery(items[i])
      }
      for (i = 0, l = collections.length; i < l && (collection = collections[i]); i++) {
        var ret = collection
        if (root !== doc) {
          ret = []
          for (j = 0, m = collection.length; j < m && (element = collection[j]); j++) {
            // make sure element is a descendent of root
            isAncestor(element, root) && ret.push(element)
          }
        }
        result = result.concat(ret)
      }
      return uniq(result)
    }

  qwery.uniq = uniq
  qwery.is = is
  qwery.pseudos = {}

  qwery.noConflict = function () {
    context.qwery = old
    return this
  }

  return qwery
})
