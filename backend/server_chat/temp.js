"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var temp = new Promise(function exec(resolve, reject) {
    setTimeout(function () { console.log("waitover"); resolve("gotit"); }, 500);
});
temp.then(function (e) { return console.log("success"); });
console.log("comon");
