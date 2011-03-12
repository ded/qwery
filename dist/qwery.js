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
    // Attempt to fail gracefully in lesser browsers
    if (!document.getElementsByTagName) {
      return [];
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


  // Make array courtesy of SIZZLE.js
  var makeArray = function (array, results) {
    array = Array.prototype.slice.call(array, 0);

    if (results) {
      results.push.apply(results, array);
      return results;
    }

    return array;
  };

  try {
    Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;
  } catch (e) {
    makeArray = function (array, results) {
      var i = 0,
        ret = results || [];

      if (toString.call(array) === "[object Array]") {
        Array.prototype.push.apply(ret, array);

      } else {
        if (typeof array.length === "number") {
          for (var l = array.length; i < l; i++) {
            ret.push(array[i]);
          }

        } else {
          for (; array[i]; i++) {
            ret.push(array[i]);
          }
        }
      }

      return ret;
    };
  }

  // QuerySelectorAll logic courtesy of SIZZLE.js
  if (document.querySelectorAll) {

    !function () {
      var div = document.createElement("div"),
        id = "__qworry__";

      div.innerHTML = "<p class='TEST'></p>";

      if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
        return;
      }

      context.getElementsBySelector = function (query, context, extra, seed) {

        context = context || document;

        var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);

        if (match && (context.nodeType === 1 || context.nodeType === 9)) {
          if (match[1]) {
            return makeArray(context.getElementsByTagName(query), extra);
          } else if (match[2] && Expr.find.CLASS && context.getElementsByClassName) {
            return makeArray(context.getElementsByClassName(match[2]), extra);
          }
        }

        if (context.nodeType === 9) {
          if (query === "body" && context.body) {
            return makeArray([context.body], extra);
          } else if (match && match[3]) {
            var elem = context.getElementById(match[3]);
            if (elem && elem.parentNode) {
              if (elem.id === match[3]) {
                return makeArray([elem], extra);
              }
            } else {
              return makeArray([], extra);
            }
          }
          try {
            return makeArray(context.querySelectorAll(query), extra);
          } catch (qsaError) {}

        //Thanks to Andrew Dupont for the technique
        } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
          var oldContext = context,
            old = context.getAttribute("id"),
            nid = old || id,
            hasParent = context.parentNode,
            relativeHierarchySelector = /^\s*[+~]/.test(query);

          if (!old) {
            context.setAttribute("id", nid);
          } else {
            nid = nid.replace(/'/g, "\\$&");
          }

          if (relativeHierarchySelector && hasParent) {
            context = context.parentNode;
          }

          try {
            if (!relativeHierarchySelector || hasParent) {
              return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra);
            }
          } catch (pseudoError) {
          } finally {
            if (!old) {
              oldContext.removeAttribute("id");
            }
          }
        }

        return [];
      };
      div = null;
    }();

  }

}(this);