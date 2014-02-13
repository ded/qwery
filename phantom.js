var phantom = require('phantom')
phantom.create(function (ph) {
  return ph.createPage(function (page) {
    return page.open('http://localhost:3000/tests/', function (status) {
      function f() {
        setTimeout(function () {
          var clsName = page.evaluate(function() {
            var el = document.getElementById('tests')
            return el.className
          })
          if (!clsName.match(/sink-done/)) f()
          else {
            var pass = !!clsName.match(/sink-pass/)
            if (pass) console.log('qwery tests have passed')
            else console.log('qwery tests have failed')
            phantom.exit(pass ? 0 : 1)
          }
        }, 100)
      }
      f()
    })
  })
})
