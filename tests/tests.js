sink('CSS 1', function (test, ok) {
  test('get element by id', 1, function () {
    // var el = document.createElement('div');
    // el.id = 'boosh';
    // document.body.appendChild(el);
    ok(getElementsBySelector('#boosh').length == 1, 'found element with id=boosh');
  });
});
start();