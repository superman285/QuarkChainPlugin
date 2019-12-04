(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _this = void 0;

var injectionSite = document.head || document.documentElement;
var s = document.createElement('script'),
    s2 = document.createElement('script'),
    s3 = document.createElement('script');
s.type = 'text/javascript';
s.src = 'https://cdn.jsdelivr.net/npm/web3@0.20.7/dist/web3.min.js'; //s.src = 'https://cdn.jsdelivr.net/npm/web3@1.2.4/dist/web3.min.js';

injectionSite.insertBefore(s, injectionSite.children[0]);

s.onload = function () {
  s2.type = 'text/javascript';
  s2.src = 'https://cdn.jsdelivr.net/npm/quarkchain-web3@2.0.0/dist/quarkchain-web3.js';
  s.parentNode.removeChild(s);
  injectionSite.insertBefore(s2, injectionSite.children[0]);
};

s2.onload = function () {
  //s3.type = 'module';
  s3.type = 'text/javascript'; //注意路径 chrome.extension.getURL 是以src为根路径

  s3.src = chrome.extension.getURL('script/injected2.js');
  s2.parentNode.removeChild(s2);
  injectionSite.insertBefore(s3, injectionSite.children[0]);
};

s3.onload = function () {
  console.log('inject chrome', chrome);
  s3.parentNode.removeChild(s3);

  (function _callee() {
    var item;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(_this.getItem('accounts'));

          case 2:
            item = _context.sent;
            console.log('contentscript 拿accounts', item);

            if (item && item.length) {
              console.log('item', item);
              window.postMessage({
                "test": '你好！',
                "privatekey": '5a546d5a6b605c731065e4ed32ae8f6a94efbc926463f72ee7691f2441335997'
              }, '*');
            }

          case 5:
          case "end":
            return _context.stop();
        }
      }
    });
  })();
};

function getItem(itemField) {
  return new Promise(function (resolve) {
    chrome.storage.local.get([itemField], function (result) {
      return resolve(result[itemField]);
    });
  });
}
/*chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request sender sendResponse',request,sender,sendResponse);
  sendResponse("我已收到你的消息：" + JSON.stringify(request));//做出回应


  let {privatekey,accounts} = request;
  console.log('accounts',accounts,privatekey);

  privatekey.startsWith('0x') && (privatekey = privatekey.slice(2));

  //const PrivateKeyProvider = require("truffle-privatekey-provider");
  //const privateKey = "93945E79D3FD4D0FDC60CB2C9031B2D8ACF3C688F3185C0730ED30D85C66B77F";
  //let pkProvider = new PrivateKeyProvider(privatekey, "https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");

  window.postMessage({"test": '你好！',"privatekey": privatekey}, '*');


});*/

},{}]},{},[1]);
