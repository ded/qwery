// original inspiration - http://simonwillison.net/2003/Mar/25/getElementsBySelector/
!function (context) {

  function getAllChildren(e) {
    return e.all ? e.all : e.getElementsByTagName('*');
  }

  context.getElementsBySelector = function(selector) {
    // Attempt to fail gracefully in lesser browsers
    if (!document.getElementsByTagName) {
      return [];
    }
    // Split selector in to tokens
    var tokens = selector.split(' ');
    var currentContext = new Array(document);
    for (var i = 0; i < tokens.length; i++) {
      token = tokens[i].replace(/^\s+/,'').replace(/\s+$/,'');;
      if (token.indexOf('#') > -1) {
        // Token is an ID selector
        var bits = token.split('#');
        var tagName = bits[0];
        var id = bits[1];
        var element = document.getElementById(id);
        if (tagName && element.nodeName.toLowerCase() != tagName) {
          // tag with that ID not found, return false
          return [];
        }
        // Set currentContext to contain just this element
        currentContext = new Array(element);
        continue; // Skip to next token
      }
      if (token.indexOf('.') > -1) {
        // Token contains a class selector
        var bits = token.split('.');
        var tagName = bits[0];
        var className = bits[1];
        if (!tagName) {
          tagName = '*';
        }
        // Get elements matching tag, filter them for class selector
        var found = [];
        var foundCount = 0;
        for (var h = 0; h < currentContext.length; h++) {
          var elements;
          if (tagName == '*') {
              elements = getAllChildren(currentContext[h]);
          } else {
              elements = currentContext[h].getElementsByTagName(tagName);
          }
          for (var j = 0; j < elements.length; j++) {
            found[foundCount++] = elements[j];
          }
        }
        currentContext = [];
        var currentContextIndex = 0;
        for (var k = 0; k < found.length; k++) {
          if (found[k].className && found[k].className.match(new RegExp('\\b' + className + '\\b'))) {
            currentContext[currentContextIndex++] = found[k];
          }
        }
        continue; // Skip to next token
      }
      // Code to deal with attribute selectors
      if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
        var tagName = RegExp.$1;
        var attrName = RegExp.$2;
        var attrOperator = RegExp.$3;
        var attrValue = RegExp.$4;
        if (!tagName) {
          tagName = '*';
        }
        // Grab all of the tagName elements within current context
        var found = [];
        var foundCount = 0;
        for (var h = 0; h < currentContext.length; h++) {
          var elements;
          if (tagName == '*') {
              elements = getAllChildren(currentContext[h]);
          } else {
              elements = currentContext[h].getElementsByTagName(tagName);
          }
          for (var j = 0; j < elements.length; j++) {
            found[foundCount++] = elements[j];
          }
        }
        currentContext = [];
        var currentContextIndex = 0;
        var checkFunction; // This function will be used to filter the elements
        switch (attrOperator) {
          case '=': // Equality
            checkFunction = function(e) { return (e.getAttribute(attrName) == attrValue); };
            break;
          case '~': // Match one of space seperated words
            checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('\\b'+attrValue+'\\b'))); };
            break;
          case '|': // Match start with value followed by optional hyphen
            checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('^'+attrValue+'-?'))); };
            break;
          case '^': // Match starts with value
            checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) == 0); };
            break;
          case '$': // Match ends with value - fails with "Warning" in Opera 7
            checkFunction = function(e) { return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length); };
            break;
          case '*': // Match ends with value
            checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) > -1); };
            break;
          default :
            // Just test for existence of attribute
            checkFunction = function(e) { return e.getAttribute(attrName); };
        }
        currentContext = [];
        var currentContextIndex = 0;
        for (var k = 0; k < found.length; k++) {
          if (checkFunction(found[k])) {
            currentContext[currentContextIndex++] = found[k];
          }
        }
        // alert('Attribute Selector: '+tagName+' '+attrName+' '+attrOperator+' '+attrValue);
        continue; // Skip to next token
      }
      // If we get here, token is JUST an element (not a class or ID selector)
      tagName = token;
      var found = [];
      var foundCount = 0;
      for (var h = 0; h < currentContext.length; h++) {
        var elements = currentContext[h].getElementsByTagName(tagName);
        for (var j = 0; j < elements.length; j++) {
          found[foundCount++] = elements[j];
        }
      }
      currentContext = found;
    }
    return currentContext;
  };

  /* That revolting regular expression explained
  /^(\w+)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/
    \---/  \---/\-------------/    \-------/
      |      |         |               |
      |      |         |           The value
      |      |    ~,|,^,$,* or =
      |   Attribute
     Tag
  */
}(this);