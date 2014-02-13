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
        var pass = !!clsName.match(/sink-pass/)
        if (pass) console.log('tests have passed')
        else console.log('tests failed')
        phantom.exit(pass ? 0 : 1)
      }
    }, 10)
  }
  f()
})
