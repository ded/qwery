!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
}('qwery', function () {
  var context = this
    , doc = document
    , old = context.qwery
    , html = doc.documentElement
    , byClass = 'getElementsByClassName'
    , byTag = 'getElementsByTagName'
    , byId = 'getElementById'
    , qSA = 'querySelectorAll'
    , id = /#([\w\-]+)/
    , clas = /\.[\w\-]+/g
    , idOnly = /^#([\w\-]+$)/
    , classOnly = /^\.([\w\-]+)$/
    , tagOnly = /^([\w\-]+)$/
    , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
    , splittable = /(^|,)\s*[>~+]/
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
          return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
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
        return (this.c[k] = v)
      }
  }

  var classCache = new cache()
    , cleanCache = new cache()
    , attrCache = new cache()
    , tokenCache = new cache()

  function each(a, fn) {
    // don't bother with native forEach, slow for this simple case
    var i = 0, l = a.length
    for (; i < l; i++) fn.call(null, a[i])
  }

  function flatten(ar) {
    var r = []
    each(ar, function(a) {
      // concat won't work properly with NodeList
      if (arrayLike(a)) each(a, function(e) { r.push(e) })
      else r.push(a)
    });
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
    var i, m, c, k, o, classes
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
    var r = [], ret = [], m, token, tag, els, root, intr, item, skipCheck
      , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      , dividedTokens = selector.match(dividers)

    if (!tokens.length) return r
    tokens = tokens.slice(0) // this makes a copy of the array so the cached original is not affected

    token = tokens.pop()
    if (!(root = tokens.length && (m = tokens[tokens.length - 1].match(idOnly)) ? doc[byId](m[1]) : doc))
      return r

    intr = q(token)
    els = root.nodeType !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
      function (r) {
        while (root = root.nextSibling) {
          root.nodeType == 1 && (intr[1] ? intr[1] == root.tagName.toLowerCase() : 1) && r.push(root)
        }
        return r
      }([]) :
      root[byTag](intr[1] || '*')
    for (var i = 0, l = els.length; i < l; i++) if (item = interpret.apply(els[i], intr)) r.push(item)
    if (!tokens.length) return r

    // loop through all descendent tokens
    each(r, function(e) { if (ancestorMatch(e, tokens, dividedTokens)) ret.push(e) })
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
      if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
        return true
      }
    }
  }

  function ancestorMatch(el, tokens, dividedTokens, root) {
    var cand
    function walk(e, i, p) {
      while (p = walker[dividedTokens[i]](p, e)) {
        if (found = interpret.apply(p, q(tokens[i]))) {
          if (i) {
            if (cand = walk(p, i - 1, p)) return cand
          } else return p
        }
      }
    }
    return (cand = walk(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
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
    var m, el, root = normalizeRoot(_root)

    if (!root || !selector) return []
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
    }
    if (selector && arrayLike(selector)) return flatten(selector)
    if (m = selector.match(idOnly)) return (el = doc[byId](m[1])) ? [el] : []
    if (m = selector.match(tagOnly)) return flatten(root[byTag](m[1]))
    return select(selector, root)
  }

  function relationshipFirst(root, collector) {
    var quick = function(s) {
          collector(root, s)
        }
      , splitter = function(s) {
          var oid, nid, ctx = root;
          if (!(nid = oid = root.getAttribute('id')))
            root.setAttribute('id', nid = '__qwerymeupscotty')
          ctx = doc
          s = '#' + nid + s
          collector(ctx, s)
          !oid && root.setAttribute('id', oid)
        }

    return function(s) {
      (root !== doc && splittable.test(s) ? splitter : quick)(s)
    }
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
    try {
      return doc[byClass] && doc.querySelector && doc[qSA] && doc[qSA](':nth-of-type(1)').length
    } catch (e) { return false }
  }(),

  select = supportsCSS3 ?
    function (selector, root) {
      var results = [], m = selector.match(classOnly)
      if (m) return flatten(root[byClass](m[1]))
      if (root === doc || !splittable.test(selector)) return root[qSA](selector)
      each(selector.split(','), relationshipFirst(root, function(ctx, s) {
        results.push(ctx[qSA](s))
      }))
      return flatten(results)
    } :
    function (selector, root) {
      var result = [], m, r, skipCheck
      selector = selector.replace(normalizr, '$1')
      if (m = selector.match(tagAndOrClass)) {
        // simple & common case, safe to use non-CSS3 qSA if present
        if (root[qSA]) return flatten(root[qSA](selector))
        r = classCache.g(m[2]) || classCache.s(m[2], new RegExp('(^|\\s+)' + m[2] + '(\\s+|$)'));
        items = root[byTag](m[1] || '*')
        for (var i = 0, l = items.length; i < l; i++) {
          r.test(items[i].className) && result.push(items[i])
        }
        return result
      }
      each(selector.split(','), relationshipFirst(root, function(ctx, s) {
        each(_qwery(s), function(e) {
          if (ctx === doc || isAncestor(e, root)) result.push(e)
        })
      }))
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
