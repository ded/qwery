!function (context) {

  function getAllChildren(e) {
    return e.all ? e.all : e.getElementsByTagName('*');
  }
  function getAttr(o, n, v) {
    switch (o) {
      case '=': // Equality
      return function(e) {
        return (e.getAttribute(n) == v);
      };
      break;
      case '~': // Match one of space seperated words
      return function(e) {
        return (e.getAttribute(n).match(new RegExp('\\b' + v + '\\b')));
      };
      break;
      case '|': // Match start with value followed by optional hyphen
      return function(e) {
        return (e.getAttribute(n).match(new RegExp('^' + v + '-?')));
      };
      break;
      case '^': // Match starts with value
      return function(e) {
        return (e.getAttribute(n).indexOf(v) === 0);
      };
      break;
      case '$': // Match ends with value
      return function(e) {
        return (e.getAttribute(n).lastIndexOf(v) == e.getAttribute(n).length - v.length);
      };
      break;
      case '*': // Match ends with value
      return function(e) {
        return (e.getAttribute(n).indexOf(v) > -1);
      };
      break;
      default :
      // Just test for existence of attribute
      return function(e) {
        return e.getAttribute(n);
      };
    }
  }

  context.getElementsBySelector = function(selector) {
    // Attempt to fail gracefully in lesser browsers
    if (!document.getElementsByTagName) {
      return [];
    }
    // Split selector in to tokens
    var tokens = selector.split(' '), bits, tagName, h, i, j, k, len, found, foundCount, elements, currentContextIndex;
    var currentContext = [document];
    for (i = 0; i < tokens.length; i++) {
      token = tokens[i].replace(/^\s+/,'').replace(/\s+$/,'');
      if (token.indexOf('#') > -1) {
        // Token is an ID selector
        bits = token.split('#');
        tagName = bits[0];
        var id = bits[1];
        var element = document.getElementById(id);
        if (tagName && element.nodeName.toLowerCase() != tagName) {
          // tag with that ID not found, return false
          return [];
        }
        // Set currentContext to contain just this element
        currentContext = [element];
        continue; // Skip to next token
      }
      if (token.indexOf('.') > -1) {
        // Token contains a class selector
        bits = token.split('.');
        tagName = bits[0];
        var className = bits[1];
        if (!tagName) {
          tagName = '*';
        }
        // Get elements matching tag, filter them for class selector
        found = [];
        foundCount = 0;
        for (h = 0, len = currentContext.length; h < len; h++) {
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
        for (k = 0, len = found.length; k < len; k++) {
          if (found[k].className && found[k].className.match(new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)'))) {
            currentContext[currentContextIndex++] = found[k];
          }
        }
        continue; // Skip to next token
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
        var checkFunction = getCheckFn(attrOperator, attrName, attrValue);
        currentContext = [];
        currentContextIndex = 0;
        for (k = 0; k < found.length; k++) {
          if (checkFunction(found[k])) {
            currentContext[currentContextIndex++] = found[k];
          }
        }
        // alert('Attribute Selector: '+tagName+' '+attrName+' '+attrOperator+' '+attrValue);
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

  /* That revolting regular expression explained
  /^(\w+)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/
  \---/  \---/\-------------/    \-------/
  |      |         |               |
  |      |         |           The value
  |      |    ~,|,^,$,* or =
  |   Attribute
  Tag
  */
}(this);