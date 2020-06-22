const autoComCaller = __filename
const autoCom = require("../src/utils/autocomment");

autoCom.com(autoComCaller, "foo");
// Begin auto-comment foo
console.log("I'll be run the first time around!")
// End auto-comment foo

autoCom.uncom(autoComCaller, "bar");
/* Begin auto-uncomment bar
console.log("I'll be run the second time around.");
End auto-uncomment bar */