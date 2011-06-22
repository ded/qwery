qwery.pseudos['last-child'] = function (el, p, childs) {
  return el.parentNode && (p = el.parentNode) && (childs = p.getElementsByTagName('*')) && childs[childs.length - 1] == el;
};

qwery.pseudos['first-child'] = function (el, p) {
  return el.parentNode && (p = el.parentNode) && (childs = p.getElementsByTagName('*')) && childs[0] == el;
};

qwery.pseudos['nth-child'] = function (el, val, p) {
  if (!val || !(p = el.parentNode)) return false;
  var childs = p.getElementsByTagName('*'), i, l;
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