!function () {
  var q = qwery.noConflict();
  $._select = q;
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
    }
  }, true);
}();