!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
}('qwery', function () {
  var doc = document
    , html = doc.documentElement
    , byClass = 'getElementsByClassName'
    , byTag = 'getElementsByTagName'
    , qSA = 'querySelectorAll'
    , useNativeQSA = 'useNativeQSA'
    , useNativeMS = 'useNativeMS'
    , tagName = 'tagName'
    , nodeType = 'nodeType'
    , select // main select() method, assign later
    , matches // main matches() method, assign later
      // feature test for 'matchesSelector' function name
    , matchesSelector = (function (el, pfx, name, i, ms) {
        while (i < pfx.length) {
          if (el[ms = pfx[i++] + name]) {
            try {
              // we need a matchesSelector implementation that throws if it receives garbage
              // which some do not (looking at you Firefox<4)
              el[ms](':qwery()')
              return null
            } catch (e) {
              return ms
            }
          }
        }
      }(html, [ 'msM', 'webkitM', 'mozM', 'oM', 'm' ], 'atchesSelector', 0))
    , hasByClass = !!doc[byClass]
      // has native qSA support
    , hasQSA = doc.querySelector && doc[qSA]

    // OOOOOOOOOOOOH HERE COME THE ESSSXXSSPRESSSIONSSSSSSSS!!!!!
    , id = /#([\w\-]+)/
    , clas = /\.[\w\-]+/g
    , idOnly = /^#([\w\-]+)$/
    , classOnly = /^\.([\w\-]+)$/
    , tagOnly = /^([\w\-]+)$/
    , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
    , splittable = /(^|,)\s*[>~+]/
    , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
    , splitters = /[\s\>\+\~]/
    , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
    , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
    , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([^\]'"]+)['"]?)?\]/
    , pseudo = /:([\w\-]+)(\(['"]?([^'")]+)['"]?\))?/
    , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
    , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?(!)?')
    , splittrOpenersRe = /[\(\["']/
    , splittrClosersRe = /[\)\]"']/
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

  function cache (re) {
    this.c = {}
    this.re = re
  }
  cache.prototype = {
      g: function (k) {
        return this.c['$' + k] || undefined
      }
    , s: function (k, v) {
        return (this.c['$' + k] = this.re ? new RegExp(v) : v)
      }
  }

  var classCache = new cache(1)
    , attrCache = new cache(1)
    , cleanCache = new cache()
    , splittrCache = new cache()
    , groupCache = new cache()

  function classRegex (c) {
    return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)')
  }

  // not quite as fast as inline loops in older browsers so don't use liberally
  function each (a, fn) {
    for (var i = 0, l = a.length; i < l; i++)
      fn(a[i])
  }

  function flatten (ar) {
    for (var r = [], i = 0, l = ar.length; i < l; ++i)
      arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
    return r
  }

  function arrayify (ar) {
    for (var i = 0, l = ar.length, r = []; i < l; i++)
      r[i] = ar[i]
    return r
  }

  function previous (n) {
    while (n = n.previousSibling)
      if (n[nodeType] == 1)
        break;
    return n
  }

  // instead of using regexes to split our selectors, do it manually, taking into
  // account nested (), [], '', "" sets.
  // prevents us from splitting groups (,) at the wrong place, so we can have groups
  // within :not(), :matches(), etc. and allows more complex content within other
  // pseudos and attribute descriptors more generally
  function splittr (selector, splitRegex) {
    var c, s = '', tokens = [], dividers = [], i = 0, l = selector.length, subs = 0
    for (; i < l; i++) {
      c = selector.charAt(i)

      splittrOpenersRe.test(c) && subs++

      if (!subs && splitRegex.test(c)) {
        s && tokens.push(s) && (s = '')
        dividers.push(c)
      } else
        s += c

      splittrClosersRe.test(c) && subs--
    }
    s && tokens.push(s)
    return [ tokens, dividers ]
  }

  // called using `this` as element and arguments from regex group results.
  // given => div.hello[title="world"]:foo('bar')!
  // div.hello[title="world"]:foo('bar')!, div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar, !]
  function interpret (whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal, subject) {
    var i, m, k, o, classes
    if (this[nodeType] !== 1) return false
    if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
    }
    if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
    if (wholeAttribute && !value) { // select is just for existance of attrib
      o = this.attributes
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
      // select is for attrib equality
      return false
    }
    return this
  }

  function clean (s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
  }

  function checkAttr (qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val)))
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$'))
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, clean(val)))
    case '~=':
      return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)'))
    case '|=':
      return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)'))
    }
    return 0
  }

  // given a selector, first check for simple cases then collect all base candidate matches and filter
  function _qwery (selector, _root) {
    var r = [], ret = [], i, l, m, token, els, intr, item, root = _root
      , split = splittrCache.g(selector) || splittrCache.s(selector, splittr(selector, splitters))
      , tokens = split[0], dividedTokens = split[1]

    if (!tokens.length) return r

    token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
    if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
    if (!root) return r

    intr = token.match(chunker)
    // collect base candidates to filter
    els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
      function (r) {
        while (root = root.nextSibling) {
          root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
        }
        return r
      }([]) :
      root[byTag](intr[1] || '*')
    // filter elements according to the right-most part of the selector
    for (i = 0, l = els.length; i < l; i++) {
      if (item = interpret.apply(els[i], intr)) r[r.length] = item
    }
    if (!tokens.length) return r

    // filter further according to the rest of the selector (the left side)
    each(r, function(e) { if (e = ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
    return ret
  }

  // given elements matching the right-most part of a selector, filter out any that don't match the rest
  function ancestorMatch (el, tokens, dividedTokens, root) {
    var cand, intr
    // recursively work backwards through the tokens and up the dom, covering all options
    function crawl (e, i, p) {
      while (p = walker[dividedTokens[i]](p, e)) {
        if (isNode(p) && (interpret.apply(p, intr = tokens[i].match(chunker)))) {
          if (intr[11]) // subject selector: '!', change subject 'el' to current element
            el = p
          if (i) {
            if (cand = crawl(p, i - 1, p))
              return cand
          } else
            return p
        }
      }
    }
    return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root)) ? el : 0
  }

  function isNode (el, t) {
    return el && typeof el == 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
  }

  function uniq (ar) {
    var a = [], i, j
    o: for (i = 0; i < ar.length; ++i) {
      for (j = 0; j < a.length; ++j)
        if (a[j] == ar[i]) continue o
      a[a.length] = ar[i]
    }
    return a
  }

  function arrayLike (o) {
    return (typeof o == 'object' && isFinite(o.length))
  }

  function normalizeRoot (root) {
    if (!root) return doc
    if (typeof root == 'string') return qwery(root)[0]
    if (!root[nodeType] && arrayLike(root)) return root[0]
    return root
  }

  function byId (root, id, el) {
    // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
    return root[nodeType] === 9 ? root.getElementById(id) :
      root.ownerDocument &&
        (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
          (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
  }

  function qwery (selector, _root) {
    var m, el, root = normalizeRoot(_root)

    // easy, fast cases that we can dispatch with simple DOM calls
    if (!root || !selector) return []
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
    }
    if (selector && arrayLike(selector)) return flatten(selector)
    if (m = selector.match(easy)) {
      if (m[1]) return (el = byId(root, m[1])) ? [el] : []
      if (m[2]) return arrayify(root[byTag](m[2]))
      if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
    }

    return select(selector, root)
  }

  // where the root is not document and a relationship selector is first we have to
  // do some awkward adjustments to get it to work, even with qSA
  function collectSelector (root, collector) {
    return function(s) {
      var oid, nid
      if (splittable.test(s)) {
        if (root[nodeType] !== 9) {
         // make sure the el has an id, rewrite the query, set root to doc and run it
         if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
         s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
         collector(root.parentNode || root, s, true)
         oid || root.removeAttribute('id')
        }
        return;
      }
      s.length && collector(root, s, false)
    }
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16
    } : 'contains' in html ?
    function (element, container) {
      container = container[nodeType] === 9 || container == window ? html : container
      return container !== element && container.contains(element)
    } :
    function (element, container) {
      while (element = element.parentNode) if (element === container) return 1
      return 0
    }
  , getAttr = function() {
      // detect buggy IE src/href getAttribute() call
      var e = doc.createElement('p')
      return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
        function(e, a) {
          return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
            e.getAttribute(a, 2) : e.getAttribute(a)
        } :
        function(e, a) { return e.getAttribute(a) }
   }()

  , matchesMS = function (el, selector, root) {
      try {
        return el[matchesSelector](selector) && (!root || isAncestor(el, root))
      } catch (e) {
        // fallback for selectors not supported by browser, such as custom pseudos
        return matchesNonNative(el, selector, root)
      }
    }
  , matchesNonNative = function (el, selector, root) {
      var selectors = (groupCache.g(selector) || groupCache.s(selector, splittr(selector, /,/)[0]))
        , i = 0, l = selectors.length, split, tokens, dividedTokens

      for (; i < l; i++) {
        split = splittrCache.g(selectors[i]) || splittrCache.s(selectors[i], splittr(selectors[i], splitters))
        tokens = split[0].slice(0) // copy
        dividedTokens = split[1]
        if (interpret.apply(el, tokens.pop().match(chunker)) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
          return true
        }
      }
      return false
    }
    // compare element to a selector
  , is = function (el, selector, root) {
      if (isNode(selector))
        return el == selector
      if (arrayLike(selector))
        return flatten(selector).indexOf(el) > -1 // if selector is an array, is el a member?
      return matches(el, selector, root)
    }

    // use native qSA
  , selectQSA = function (selector, root) {
      var result = [], e
      try {
        if (root[nodeType] === 9 || !splittable.test(selector)) {
          // most work is done right here, defer to qSA
          return arrayify(root[qSA](selector))
        }
        // special case where we need the services of `collectSelector()`
        each(groupCache.g(selector) || groupCache.s(selector, splittr(selector, /,/)[0])
          , collectSelector(root, function (ctx, s) {
              e = ctx[qSA](s)
              if (e.length == 1)
                result[result.length] = e.item(0)
              else if (e.length) result = result.concat(arrayify(e))
            })
        )
        return result.length > 1 ? uniq(result) : result
      } catch(ex) { }
      return selectNonNative(selector, root)
    }
    // no native selector support
  , selectNonNative = function (selector, root) {
      var result = [], items, m, i, l, r
      selector = selector.replace(normalizr, '$1')
      if (m = selector.match(tagAndOrClass)) {
        r = classRegex(m[2])
        items = root[byTag](m[1] || '*')
        for (i = 0, l = items.length; i < l; i++) {
          if (r.test(items[i].className))
            result[result.length] = items[i]
        }
        return result
      }
      // more complex selector, get `_qwery()` to do the work for us
      each(groupCache.g(selector) || groupCache.s(selector, splittr(selector, /,/)[0])
        , collectSelector(root, function (ctx, s, rewrite) {
            r = _qwery(s, ctx)
            for (i = 0, l = r.length; i < l; i++) {
              if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root))
                result[result.length] = r[i]
            }
          })
      )
      return result.length > 1 ? uniq(result) : result
    }
  , configure = function (options) {
      if (typeof options[useNativeQSA] !== 'undefined')
        select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
      if (typeof options[useNativeMS] !== 'undefined')
        matches = !options[useNativeMS] ? matchesNonNative : matchesSelector ? matchesMS : matchesNonNative
    }

  configure({
      useNativeQSA: true
    , useNativeMS: true
  })

  qwery.configure = configure
  qwery.uniq = uniq
  qwery.is = is
  qwery.pseudos = {}

  return qwery
})