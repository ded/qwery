require('../build/smoosh').config({
  "JAVASCRIPT": {
    "DIST_DIR": "./",
    "ready": ['./src/ready.js']
  },
  "JSHINT_OPTS": {
    "boss": true,
    "forin": true,
    "curly": true,
    "debug": false,
    "devel": false,
    "evil": false,
    "regexp": false,
    "undef": false,
    "sub": false,
    "asi": false
  }
}).run().build().analyze();