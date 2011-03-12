!function (context) {

  function getAllChildren(e) {
    return e.all ? e.all : e.getElementsByTagName('*');
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

  context.getElementsBySelector = function (selector) {

    if (!document.getElementsByTagName) {
      return [];
    }

    if (document.querySelectorAll) {
      // return immediately for browsers that know what they're doing
      // method suggested by Mozilla https://developer.mozilla.org/En/Code_snippets/QuerySelector
      return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }

    var tokens = selector.split(' '), bits, tagName, h, i, j, k, l, len, found, foundCount, elements, currentContextIndex, currentContext = [document];

    for (i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i].replace(/^\s+|\s+$/g, '');

      if (token.indexOf('#') > -1) {
        bits = token.split('#');
        tagName = bits[0];
        var element = document.getElementById(bits[1]);
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
          if (checkfunction(found[k], attrName, attrValue)) {
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
  };

}(this);