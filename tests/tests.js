sink('no conflict', function (test, ok) {
  test('should return old qwery back to context', 1, function () {
    ok(qwery() == 'success', 'old qwery called');
  });
});

sink('Contexts', function (test, ok) {

  test('should be able to pass optional context', 2, function () {
    ok($('.a').length === 3, 'no context found 3 elements (.a)');
    ok($('.a', $('#boosh')[0]).length === 2, 'context found 2 elements (#boosh .a)');
  });

});

sink('CSS 1', function (test, ok) {
  test('get element by id', 2, function () {
    var result = $('#boosh');
    ok(!!result[0], 'found element with id=boosh');
    ok(!!$('h1')[0], 'found 1 h1');
  });

  test('get element by class', 5, function () {
    ok($('#boosh .a').length == 2, 'found two elements');
    ok(!!$('#boosh div.a')[0], 'found one element');
    ok($('#boosh div').length == 2, 'found two {div} elements');
    ok(!!$('#boosh span')[0], 'found one {span} element');
    ok(!!$('#boosh div div')[0], 'found a single div');
  });

  test('combos', 1, function () {
    ok($('#boosh div,#boosh span').length == 3, 'found 2 divs and 1 span');
  });

});

sink('CSS 2', function (test, ok) {

  test('get elements by attribute', 2, function () {
    ok(!!$('#boosh div[test]')[0], 'found attribute');
    ok(!!$('#boosh div[test=fg]')[0], 'found attribute with value');
  });

});

start();