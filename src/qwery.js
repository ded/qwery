!function (context, doc) {

  function array(ar) {
    return Array.prototype.slice.call(ar, 0);
  }

  function getAllChildren(e) {
    return e.all ? e.all : e.getElementsByTagName('*');
  }

  function iter(obj) {
    this.obj = array(obj);
  }

  iter.prototype = {
    each: function (fn) {
      for (var i = 0; i  < this.obj.length; i ++) {
        fn.call(this.obj[i], this.obj[i], i, this.obj);
      }
      return this;
    },

    map: function (fn) {
      var collection = [];
      for (var i = 0; i  < this.obj.length; i ++) {
        collection[i] = fn.call(this.obj[i], this.obj[i], i, this.obj);
      }
      return collection;
    }
  };

  function _(obj) {
    return new iter(obj);
  }

  var checkFunctions = {
    '=': function (e, attrName, attrValue) {
      return (e.getAttribute(attrName) == attrValue);
    },
    '~': function (e, attrName, attrValue) {
      return (e.getAttribute(attrName).match(new RegExp('\\b' + attrValue + '\\b')));
    },
    '|': function (e, attrName, attrValue) {
      return (e.getAttribute(attrName).match(new RegExp('^' + attrValue + '-?')));
    },
    '^': function (e, attrName, attrValue) {
      return (e.getAttribute(attrName).indexOf(attrValue) === 0);
    },
    '$': function (e, attrName, attrValue) {
      return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length);
    },
    '*': function (e, attrName, attrValue) {
      return (e.getAttribute(attrName).indexOf(attrValue) > -1);
    },
    '': function (e, attrName) {
      return e.getAttribute(attrName);
    }
  };

  function _qwery(selector) {
    var tokens = selector.split(' '), bits, tagName, h, i, j, k, l, len,
      found, foundCount, elements, currentContextIndex, currentContext = [doc];

    for (i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i].replace(/^\s+|\s+$/g, '');

      if (token.indexOf('#') > -1) {
        bits = token.split('#');
        tagName = bits[0];
        var element = doc.getElementById(bits[1]);
        if (tagName && element.nodeName.toLowerCase() != tagName) {
          return [];
        }
        currentContext = [element];
        continue;
      }

      if (token.indexOf('.') > -1) {
        // Token contains a class selector
        bits = token.split('.');
        tagName = bits[foundCount = 0];
        tagName = tagName || '*';
        found = [];
        for (h = 0, len = currentContext.length; h < len; h++) {
          elements = tagName == '*' ? getAllChildren(currentContext[h]) : currentContext[h].getElementsByTagName(tagName);
          for (j = 0, k = elements.length; j < k; j++) {
            found[foundCount++] = elements[j];
          }
        }
        currentContext = [];
        currentContextIndex = 0;
        for (k = 0, len = found.length; k < len; k++) {
          if (found[k].className && found[k].className.match(new RegExp('(?:^|\\s+)' + bits[1] + '(?:\\s+|$)'))) {
            currentContext[currentContextIndex++] = found[k];
          }
        }
        continue;
      }
      // Code to deal with attribute selectors
      if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
        tagName = RegExp.$1;
        var attrName = RegExp.$2;
        var attrOperator = RegExp.$3;
        var attrValue = RegExp.$4;
        if (!tagName) {
          tagName = '*';
        }
        // Grab all of the tagName elements within current context
        found = [];
        foundCount = 0;
        for (h = 0; h < currentContext.length; h++) {
          if (tagName == '*') {
            elements = getAllChildren(currentContext[h]);
          } else {
            elements = currentContext[h].getElementsByTagName(tagName);
          }
          for (j = 0; j < elements.length; j++) {
            found[foundCount++] = elements[j];
          }
        }
        currentContext = [];
        currentContextIndex = 0;
        // This function will be used to filter the elements
        var checkFunction = checkFunctions[attrOperator] || checkFunctions[''];
        for (k = 0; k < found.length; k++) {
          if (checkFunction(found[k], attrName, attrValue)) {
            currentContext[currentContextIndex++] = found[k];
          }
        }
        continue; // Skip to next token
      }
      // If we get here, token is JUST an element (not a class or ID selector)
      tagName = token;
      found = [];
      foundCount = 0;

      for (h = 0; h < currentContext.length; h++) {
        elements = currentContext[h].getElementsByTagName(tagName);
        for (j = 0; j < elements.length; j++) {
          found[foundCount++] = elements[j];
        }
      }
      currentContext = found;
    }
    return currentContext;
  }

  // @todo - make qwery work with contexts eg: qwery('.foo', node);
  function qwery(selector) {

    if (!doc.getElementsByTagName) {
      return [];
    }

    if (doc.querySelectorAll) {
      // return immediately for browsers that know what they're doing
      // method suggested by Mozilla https://developer.mozilla.org/En/Code_snippets/QuerySelector
      return array(doc.querySelectorAll(selector), 0);
    }

    // these next two operations could really benefit from an accumulator (eg: map/each/accumulate)
    var result = [];
    // here we allow combinator selectors: $('div,span');
    var collections = _(selector.split(',')).map(function (selector) {
      return _qwery(selector);
    });
    _(collections).each(function (collection) {
      result = result.concat(collection);
    });
    return result;
  }

  var oldQwery = context.qwery;

  qwery.noConflict = function () {
    context.qwery = oldQwery;
    return this;
  };
  context.qwery = qwery;

}(this, document);