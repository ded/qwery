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
  
  test('should be able to pass qwery result as context', 5, function() {
    ok(Q('.a', Q('#boosh')).length == 2, 'context found 2 elements(.a, #boosh)');
    ok(Q('.a', Q('.a')).length == 0, 'context found 0 elements(.a, .a)');
    ok(Q('.a', Q('.b')).length == 1, 'context found 1 elements(.a, .b)');
    ok(Q('.a', Q('#boosh .b')).length == 1, 'context found 1 elements(.a, #boosh .b)');
    ok(Q('.b', Q('#boosh .b')).length == 0, 'context found 0 elements(.b, #boosh .b)');
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

  test('get elements by class', 5, function () {
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

  test('direct descendants', 1, function () {
    ok(Q('#direct-descend > .direct-descend').length == 2, 'found two direct descendents');
  });

  test('sibling elements', 17, function () {
    ok(Q('#sibling-selector ~ .sibling-selector').length == 2, 'found two siblings')
    ok(Q('#sibling-selector ~ div.sibling-selector').length == 2, 'found two siblings')
    ok(Q('#sibling-selector + div.sibling-selector').length == 1, 'found two siblings')
    ok(Q('#sibling-selector + .sibling-selector').length == 1, 'found two siblings')

    ok(Q('.parent .oldest ~ .sibling').length == 4, 'found four younger siblings')
    ok(Q('.parent .middle ~ .sibling').length == 2, 'found two younger siblings')
    ok(Q('.parent .middle ~ h4').length == 1, 'found next sibling by tag')
    ok(Q('.parent .middle ~ h4.younger').length == 1, 'found next sibling by tag and class')
    ok(Q('.parent .middle ~ h3').length == 0, 'an element can\'t be its own sibling')
    ok(Q('.parent .middle ~ h2').length == 0, 'didn\'t find an older sibling')
    ok(Q('.parent .youngest ~ .sibling').length == 0, 'found no younger siblings')

    ok(Q('.parent .oldest + .sibling').length == 1, 'found next sibling')
    ok(Q('.parent .middle + .sibling').length == 1, 'found next sibling')
    ok(Q('.parent .middle + h4').length == 1, 'found next sibling by tag')
    ok(Q('.parent .middle + h3').length == 0, 'an element can\'t be its own sibling')
    ok(Q('.parent .middle + h2').length == 0, 'didn\'t find an older sibling')
    ok(Q('.parent .youngest + .sibling').length == 0, 'found no younger siblings')
  });

});


sink('tokenizer', function (test, ok) {

  test('should not get weird tokens', 5, function () {
    ok(Q('div .tokens[title="one"]')[0] == document.getElementById('token-one'), 'found div .tokens[title="one"]');
    ok(Q('div .tokens[title="one two"]')[0] == document.getElementById('token-two'), 'found div .tokens[title="one two"]');
    ok(Q('div .tokens[title="one two three #%"]')[0] == document.getElementById('token-three'), 'found div .tokens[title="one two three #%"]');
    ok(Q("div .tokens[title='one two three #%'] a")[0] == document.getElementById('token-four'), 'found div .tokens[title=\'one two three #%\'] a');
    ok(Q('div .tokens[title="one two three #%"] a[href$=foo] div')[0] == document.getElementById('token-five'), 'found div .tokens[title="one two three #%"] a[href=foo] div');
  });

});

sink('interesting syntaxes', function (test, ok) {
  test('should parse bad selectors', 1, function () {
    ok(Q('#spaced-tokens    p    em    a').length, 'found element with funny tokens')
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

sink('pseudo-selectors', function (test, ok) {
  
  test(':first-child', 2, function () {
    ok(Q('#pseudos div:first-child')[0] == document.getElementById('pseudos').getElementsByTagName('*')[0], 'found first child')
    ok(Q('#pseudos div:first-child').length == 1, 'found only 1')
  });

  test(':last-child', 2, function () {
    var all = document.getElementById('pseudos').getElementsByTagName('div');
    ok(Q('#pseudos div:last-child')[0] == all[all.length - 1], 'found last child')
    ok(Q('#pseudos div:last-child').length == 1, 'found only 1')
  });

  test('ol > li[attr="boosh"]:last-child', 2, function () {
    var expected = document.getElementById('attr-child-boosh');
    ok(Q('ol > li[attr="boosh"]:last-child').length == 1, 'only 1 element found');
    ok(Q('ol > li[attr="boosh"]:last-child')[0] == expected, 'found correct element');
  });

  test(':nth-child(odd|even|x)', 4, function () {
    var second = document.getElementById('pseudos').getElementsByTagName('div')[1];
    ok(Q('#pseudos :nth-child(odd)').length == 4, 'found 4 odd elements');
    ok(Q('#pseudos div:nth-child(odd)').length == 3, 'found 3 odd elements with div tag');
    ok(Q('#pseudos div:nth-child(even)').length == 3, 'found 3 even elements with div tag');
    ok(Q('#pseudos div:nth-child(2)')[0] == second, 'found 2nd nth-child of pseudos');
  });

  test(':nth-child(expr)', 6, function () {
    var fifth = document.getElementById('pseudos').getElementsByTagName('a')[0];
    var sixth = document.getElementById('pseudos').getElementsByTagName('div')[4];

    ok(Q('#pseudos :nth-child(3n+1)').length == 3, 'found 3 elements');
    ok(Q('#pseudos :nth-child(+3n-2)').length == 3, 'found 3 elements');
    ok(Q('#pseudos :nth-child(-n+6)').length == 6, 'found 6 elements');
    ok(Q('#pseudos :nth-child(-n+5)').length == 5, 'found 5 elements');
    ok(Q('#pseudos :nth-child(3n+2)')[1] == fifth, 'second :nth-child(3n+2) is the fifth child');
    ok(Q('#pseudos :nth-child(3n)')[1] == sixth, 'second :nth-child(3n) is the sixth child');
  });

  test(':nth-last-child(odd|even|x)', 4, function () {
    var second = document.getElementById('pseudos').getElementsByTagName('div')[1];
    ok(Q('#pseudos :nth-last-child(odd)').length == 4, 'found 4 odd elements');
    ok(Q('#pseudos div:nth-last-child(odd)').length == 3, 'found 3 odd elements with div tag');
    ok(Q('#pseudos div:nth-last-child(even)').length == 3, 'found 3 even elements with div tag');
    ok(Q('#pseudos div:nth-last-child(6)')[0] == second, '6th nth-last-child should be 2nd of 7 elements');
  });

  test(':nth-last-child(expr)', 5, function () {
    var third = document.getElementById('pseudos').getElementsByTagName('div')[2];

    ok(Q('#pseudos :nth-last-child(3n+1)').length == 3, 'found 3 elements');
    ok(Q('#pseudos :nth-last-child(+3n-2)').length == 3, 'found 3 elements');
    ok(Q('#pseudos :nth-last-child(-n+6)').length == 6, 'found 6 elements');
    ok(Q('#pseudos :nth-last-child(-n+5)').length == 5, 'found 5 elements');
    ok(Q('#pseudos :nth-last-child(3n+2)')[0] == third, 'first :nth-last-child(3n+2) is the third child');
  });

  test(':nth-of-type(expr)', 6, function () {
    var a = document.getElementById('pseudos').getElementsByTagName('a')[0];

    ok(Q('#pseudos div:nth-of-type(3n+1)').length == 2, 'found 2 div elements');
    ok(Q('#pseudos a:nth-of-type(3n+1)').length == 1, 'found 1 a element');
    ok(Q('#pseudos a:nth-of-type(3n+1)')[0] == a, 'found the right a element');
    ok(Q('#pseudos a:nth-of-type(3n)').length == 0, 'no matches for every third a');
    ok(Q('#pseudos a:nth-of-type(odd)').length == 1, 'found the odd a');
    ok(Q('#pseudos a:nth-of-type(1)').length == 1, 'found the first a');
  });

  test(':nth-last-of-type(expr)', 3, function () {
    var second = document.getElementById('pseudos').getElementsByTagName('div')[1];

    ok(Q('#pseudos div:nth-last-of-type(3n+1)').length == 2, 'found 2 div elements');
    ok(Q('#pseudos a:nth-last-of-type(3n+1)').length == 1, 'found 1 a element');
    ok(Q('#pseudos div:nth-last-of-type(5)')[0] == second, '5th nth-last-of-type should be 2nd of 7 elements');
  });

  test(':first-of-type', 2, function () {
    ok(Q('#pseudos a:first-of-type')[0] == document.getElementById('pseudos').getElementsByTagName('a')[0], 'found first a element')
    ok(Q('#pseudos a:first-of-type').length == 1, 'found only 1')
  });

  test(':last-of-type', 2, function () {
    var all = document.getElementById('pseudos').getElementsByTagName('div');
    ok(Q('#pseudos div:last-of-type')[0] == all[all.length - 1], 'found last div element')
    ok(Q('#pseudos div:last-of-type').length == 1, 'found only 1')
  });

  test(':only-of-type', 2, function () {
    ok(Q('#pseudos a:only-of-type')[0] == document.getElementById('pseudos').getElementsByTagName('a')[0], 'found the only a element')
    ok(Q('#pseudos a:first-of-type').length == 1, 'found only 1')
  });

  test(':target', 2, function () {
    location.hash = '';
    ok(Q('#pseudos:target').length == 0, '#pseudos is not the target');
    location.hash = '#pseudos';
    ok(Q('#pseudos:target').length == 1, 'now #pseudos is the target');
    location.hash = '';
  });

});

sink('argument types', function (test, ok) {
  
  test('should be able to pass in nodes as arguments', 5, function () {
    var el = document.getElementById('boosh');
    ok(Q(el)[0] == el, 'Q(el)[0] == el');
    ok(Q(el, 'body')[0] == el, "Q(el, 'body')[0] == el");
    ok(Q(el, document)[0] == el, "Q(el, document)[0] == el");
    ok(Q(window)[0] == window, 'Q(window)[0] == window');
    ok(Q(document)[0] == document, 'Q(document)[0] == document');
  });
  
  test('should be able to pass in an array of results as arguments', 5, function () {
    var el = document.getElementById('boosh');
    var result = Q([Q('#boosh'), Q(document), Q(window)]);
    ok(result.length == 3, '3 elements in the combined set');
    ok(result[0] == el, "result[0] == el");
    ok(result[1] == document, "result[0] == document");
    ok(result[2] == window, 'result[0] == window');
    ok(Q([Q('#pseudos div.odd'), Q('#pseudos div.even')]).length == 6, 'found all the odd and even divs');
  });
  
});

start();