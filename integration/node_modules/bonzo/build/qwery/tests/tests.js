sink('no conflict', function (test, ok) {
  test('should return old qwery back to context', 1, function () {
    ok(qwery() == 'success', 'old qwery called');
  });
});

sink('Contexts', function (test, ok) {
  test('should be able to pass optional context', 2, function () {
    ok(Q('.a').length === 3, 'no context found 3 elements (.a)');
    ok(Q('.a', Q('#boosh')[0]).length === 2, 'context found 2 elements (#boosh .a)');
  });
  test('should be able to pass string as context', 5, function() {
    ok(Q('.a', '#boosh').length == 2, 'context found 2 elements(.a, #boosh)');
    ok(Q('.a', '.a').length == 0, 'context found 0 elements(.a, .a)');
    ok(Q('.a', '.b').length == 1, 'context found 1 elements(.a, .b)');
    ok(Q('.a', '#boosh .b').length == 1, 'context found 1 elements(.a, #boosh .b)');
    ok(Q('.b', '#boosh .b').length == 0, 'context found 0 elements(.b, #boosh .b)');
  });
  test('should not return duplicates from combinators', 1, function () {
    ok(Q('#boosh,#boosh').length == 1, 'two booshes dont make a thing go right');
  });
});

sink('CSS 1', function (test, ok) {
  test('get element by id', 2, function () {
    var result = Q('#boosh');
    ok(!!result[0], 'found element with id=boosh');
    ok(!!Q('h1')[0], 'found 1 h1');
  });

  test('get element by class', 5, function () {
    ok(Q('#boosh .a').length == 2, 'found two elements');
    ok(!!Q('#boosh div.a')[0], 'found one element');
    ok(Q('#boosh div').length == 2, 'found two {div} elements');
    ok(!!Q('#boosh span')[0], 'found one {span} element');
    ok(!!Q('#boosh div div')[0], 'found a single div');
  });

  test('combos', 1, function () {
    ok(Q('#boosh div,#boosh span').length == 3, 'found 2 divs and 1 span');
  });

  test('class with dashes', 1, function() {
    ok(Q('.class-with-dashes').length == 1, 'found something');
  });
});

sink('CSS 2', function (test, ok) {

  test('get elements by attribute', 4, function () {
    var wanted = Q('#boosh div[test]')[0];
    var expected = document.getElementById('booshTest');
    ok(wanted == expected, 'found attribute');
    ok(Q('#boosh div[test=fg]')[0] == expected, 'found attribute with value');
    ok(Q('em[rel~="copyright"]').length == 1, 'found em[rel~="copyright"]');
    ok(Q('em[nopass~="copyright"]').length == 0, 'found em[nopass~="copyright"]');
  });

  test('should not throw error by attribute selector', 1, function () {
    ok(Q('[foo^="bar"]').length === 1, 'found 1 element');
  });

  test('crazy town', 1, function () {
    var el = document.getElementById('attr-test3');
    ok(Q('div#attr-test3.found.you[title="whatup duders"]')[0] == el, 'found the right element');
  });

});

sink('attribute selectors', function (test, ok) {

  /* CSS 2 SPEC */

  test('[attr]', 1, function () {
    var expected = document.getElementById('attr-test-1');
    ok(Q('#attributes div[unique-test]')[0] == expected, 'found attribute with [attr]');
  });

  test('[attr=val]', 3, function () {
    var expected = document.getElementById('attr-test-2');
    ok(Q('#attributes div[test="two-foo"]')[0] == expected, 'found attribute with =');
    ok(Q("#attributes div[test='two-foo']")[0] == expected, 'found attribute with =');
    ok(Q('#attributes div[test=two-foo]')[0] == expected, 'found attribute with =');
  });

  test('[attr~=val]', 1, function () {
    var expected = document.getElementById('attr-test-3');
    ok(Q('#attributes div[test~=three]')[0] == expected, 'found attribute with ~=');
  });

  test('[attr|=val]', 2, function () {
    var expected = document.getElementById('attr-test-2');
    ok(Q('#attributes div[test|="two-foo"]')[0] == expected, 'found attribute with |=');
    ok(Q('#attributes div[test|=two]')[0] == expected, 'found attribute with |=');
  });

  /* CSS 3 SPEC */

  test('[attr^=val]', 1, function () {
    var expected = document.getElementById('attr-test-2');
    ok(Q('#attributes div[test^=two]')[0] == expected, 'found attribute with ^=');
  });

  test('[attr$=val]', 1, function () {
    var expected = document.getElementById('attr-test-2');
    ok(Q('#attributes div[test$=foo]')[0] == expected, 'found attribute with $=');
  });

  test('[attr*=val]', 1, function () {
    var expected = document.getElementById('attr-test-3');
    ok(Q('#attributes div[test*=hree]')[0] == expected, 'found attribute with *=');
  });

});


sink('tokenizer', function (test, ok) {

  test('should not get weird tokens', 5, function () {
    ok(Q('div .tokens[title="one"]')[0] == document.getElementById('token-one'), 'found div .tokens[title="one"]');
    ok(Q('div .tokens[title="one two"]')[0] == document.getElementById('token-two'), 'found div .tokens[title="one two"]');
    ok(Q('div .tokens[title="one two three #%"]')[0] == document.getElementById('token-three'), 'found div .tokens[title="one two three #%"]');
    ok(Q("div .tokens[title='one two three #%'] a")[0] == document.getElementById('token-four'), 'found div .tokens[title=\'one two three #%\'] a');
    ok(Q('div .tokens[title="one two three #%"] a[href=foo] div')[0] == document.getElementById('token-five'), 'found div .tokens[title="one two three #%"] a[href=foo] div');
  });

});

sink('order matters', function (test, ok) {

  function tag(el) {
    return el.tagName.toLowerCase();
  }

  // <div id="order-matters">
  //   <p class="order-matters"></p>
  //   <a class="order-matters">
  //     <em class="order-matters"></em><b class="order-matters"></b>
  //   </a>
  // </div>

  test('the order of elements return matters', 4, function () {
    var els = Q('#order-matters .order-matters');
    ok(tag(els[0]) == 'p', 'first element matched is a {p} tag');
    ok(tag(els[1]) == 'a', 'first element matched is a {a} tag');
    ok(tag(els[2]) == 'em', 'first element matched is a {em} tag');
    ok(tag(els[3]) == 'b', 'first element matched is a {b} tag');
  });

});

sink('argument types', function (test, ok) {
  test('should be able to pass in nodes as arguments', 6, function () {
    var el = document.getElementById('boosh');
    ok(Q(el)[0] == el, 'Q(el)[0] == el');
    ok(Q(el, 'body')[0] == el, "Q(el, 'body')[0] == el");
    ok(Q(el, document)[0] == el, "Q(el, document)[0] == el");
    ok(Q(window, document)[0] == null, 'Q(window, document)[0] == null');
    ok(Q(window)[0] == window, 'Q(window)[0] == window');
    ok(Q(document)[0] == document, 'Q(document)[0] == document');
  });
});

start();