!function () {
  function children(node) {
    var i, nodes = node.childNodes, r = [], l;
    for (i = 0, l = nodes.length; i < l; i++) {
      var item = nodes[i];
      nodes[i].nodeType == 1 && r.push(nodes[i]);
    }
    return r;
  }
  qwery.pseudos['last-child'] = function (el, p, childs) {
    return el.parentNode && (p = el.parentNode) && (childs = children(p)) && childs[childs.length - 1] == el;
  };

  qwery.pseudos['first-child'] = function (el, p) {
    return el.parentNode && (p = el.parentNode) && (childs = children(p)) && childs[0] == el;
  };

  qwery.pseudos['nth-child'] = function (el, val, p) {
    if (!val || !(p = el.parentNode)) return false;
    var childs = children(p), i, l;
    if (isFinite(val)) {
      return childs[val - 1] == el;
    } else if (val == 'odd') {
      for (i = 0, l = childs.length;i < l; i = i + 2) {
        if (el == childs[i]) return true;
      }
    } else if (val == 'even') {
      for (i = 1, l = childs.length;i < l; i = i + 2) {
        if (el == childs[i]) return true;
      }
    }
    return false;
  };

  qwery.pseudos.checked = function (el) {
    return el.checked;
  };

  qwery.pseudos.enabled = function (el) {
    return !el.disabled;
  };

  qwery.pseudos.disabled = function (el) {
    return el.disabled;
  };

  qwery.pseudos.empty = function (el) {
    return !el.childNodes.length;
  };

}();
