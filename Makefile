.PHONY: boosh test

boosh:
	node_modules/smoosh/bin/smoosh make ./config/smoosh.json

test:
	node ./test.js
