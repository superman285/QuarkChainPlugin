(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _this = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
  s3.parentNode.removeChild(s3); //加载完injected脚本后再发消息 再改变currentProvider

  (function _callee() {
    var item, privatekey, _ref, _ref2, accounts, accountsToPrivatekeys, selectedAccountIdx, getAccounts, getKeys, getIdx, _privatekey;

    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(_this.getItem('accounts'));

          case 2:
            item = _context.sent;
            _context.next = 5;
            return regeneratorRuntime.awrap(_this.getItem('privatekey'));

          case 5:
            privatekey = _context.sent;
            _context.next = 8;
            return regeneratorRuntime.awrap(Promise.all([_this.getItem("accounts"), _this.getItem("accountsToPrivatekeys"), _this.getItem("selectedAccountIdx")]));

          case 8:
            _ref = _context.sent;
            _ref2 = _slicedToArray(_ref, 3);
            accounts = _ref2[0];
            accountsToPrivatekeys = _ref2[1];
            selectedAccountIdx = _ref2[2];
            _context.next = 15;
            return regeneratorRuntime.awrap(_this.getItem("accounts"));

          case 15:
            getAccounts = _context.sent;
            _context.next = 18;
            return regeneratorRuntime.awrap(_this.getItem("accountsToPrivatekeys"));

          case 18:
            getKeys = _context.sent;
            _context.next = 21;
            return regeneratorRuntime.awrap(_this.getItem("selectedAccountIdx"));

          case 21:
            getIdx = _context.sent;
            console.log('contentscript get accounts', accounts, accountsToPrivatekeys, selectedAccountIdx);
            console.log('get2', getAccounts, getKeys, getIdx);

            if (accounts && accounts.length) {
              console.log('accounts not empty', accounts);
              _privatekey = accountsToPrivatekeys[accounts[selectedAccountIdx]];
              window.postMessage({
                "test": 'hello！',
                "privatekey": _privatekey
              }, '*');
            }

          case 25:
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('request sender sendResponse', request, sender, sendResponse);
  sendResponse("我已收到你的消息：" + JSON.stringify(request)); //做出回应

  var privatekey = request.privatekey,
      account = request.account;
  console.log('accounts', account, privatekey);
  privatekey.startsWith('0x') && (privatekey = privatekey.slice(2)); //const PrivateKeyProvider = require("truffle-privatekey-provider");
  //const privateKey = "93945E79D3FD4D0FDC60CB2C9031B2D8ACF3C688F3185C0730ED30D85C66B77F";
  //let pkProvider = new PrivateKeyProvider(privatekey, "https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");

  window.postMessage({
    "greet": 'hello！',
    "privatekey": privatekey
  }, '*');
});

},{}]},{},[1]);
