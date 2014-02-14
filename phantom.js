var page = require('webpage').create()
page.open('http://localhost:3000/tests/', function() {

  function f() {
    setTimeout(function () {
      var clsName = page.evaluate(function() {
        var el = document.getElementById('tests')
        return el.className
      })
      if (!clsName.match(/sink-done/)) f()
      else {
        var count = 0
        var fail = page.evaluate(function () {
          var t = ''
          var els = document.querySelectorAll('ol#tests .fail .fail')
          for (var i = 0; i < els.length; i++) {
            t += els[i].textContent + '\n'
          }
          return {text: t, count: els.length}
        })
        var pass = !!clsName.match(/sink-pass/)
        if (pass) console.log('tests have passed')
        else console.log(fail.count + ' test(s) failed\n', fail.text)
        phantom.exit(pass ? 0 : 1)
      }
    }, 10)
  }
  f()
})
