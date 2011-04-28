!function () {
  var q = qwery.noConflict();
  $._select = q;

  var indexOf = Array.prototype.indexOf ?
    function (ar, val) {
      return ar.indexOf(val);
    } :
    function (ar, val) {
      for (var i = 0; i < ar.length; i++) {
        if ( ar[i] === val ) {
          return i;
        }
      }
      return -1;
    };
  $.ender({
    find: function (s) {
      var r = [], i, l, j, k, els;
      for (i = 0, l = this.length; i < l; i++) {
        els = q(s, this[i]);
        for (j = 0, k = els.length; j < k; j++) {
          r.push(els[j]);
        }
      }
      return $(q.uniq(r));
    },

    closest: function (s) {
      var r = [], i, l, p, els = q(s);
      for (i = 0, l = this.length; i < l; i++) {
        p = this[i];
        while (p = p.parentNode) {
          if (els.indexOf(p) != -1) {
            r.push(p); break;
          }
        }
      }
      return $(q.uniq(r));
    }
  }, true);
}();