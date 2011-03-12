var $ = getElementsBySelector;
sink('CSS 1', function (test, ok) {
  test('get element by id', 1, function () {
    var result = $('#boosh');
    ok(!!result[0], 'found element with id=boosh');
  });

  test('get element by class', 5, function () {
    ok($('#boosh .a').length == 2, 'found two elements');
    ok(!!$('#boosh div.a')[0], 'found one element');
    ok($('#boosh div').length == 2, 'found two {div} elements');
    ok(!!$('#boosh span')[0], 'found one {span} element');
    ok(!!$('#boosh div div')[0], 'found a single div');
  });

});

sink('CSS 2', function (test, ok) {

  test('get elements by attribute', 2, function () {
    ok(!!$('#boosh div[test]')[0], 'found a single direct descendent');
    ok(!!$('#boosh div[test=fg]')[0], 'found a single direct descendent');
  });

});

start();