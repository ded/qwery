function makeArray(array, results) {
  array = Array.prototype.slice.call(array, 0);

  if (results) {
    results.push.apply(results, array);
    return results;
  }

  return array;
}

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

QuerySelectorAll logic courtesy of SIZZLE.js
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