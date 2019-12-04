//import('https://cdn.jsdelivr.net/npm/web3@1.2.4/dist/web3.min.js').then(res=>{
//import('https://cdn.jsdelivr.net/npm/quarkchain-web3@2.0.0/dist/quarkchain-web3.js').then(res=>{

//const HDWalletProvider = require('@truffle/hdwallet-provider')
//const Web3 = require('web3');

const PrivateKeyProvider = require("truffle-privatekey-provider");
//const PrivateKeyProvider = require("./utils/web3-privatekey-provider.js");
const privateKey = "93945E79D3FD4D0FDC60CB2C9031B2D8ACF3C688F3185C0730ED30D85C66B77F";
let pkProvider = new PrivateKeyProvider(privateKey, "https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");
//let pkProvider = new PrivateKeyProvider(privateKey, "http://localhost:8545");

console.log("web3 quarkchain", Web3);
window.Web3 = Web3;
let web3 = new Web3();
window.web3 = web3;
console.log("web3", web3);

QuarkChain.injectWeb3(web3, "http://jrpc.devnet.quarkchain.io:38391");

!window.QuarkChain && (
  window.QuarkChain = QuarkChain);

web3.qkc.setPrivateKey("0x93945E79D3FD4D0FDC60CB2C9031B2D8ACF3C688F3185C0730ED30D85C66B77F");

//let localProvider = new Web3.providers.HttpProvider("http://localhost:7878");
//let localProvider = new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");

//web3.setProvider(localProvider);
web3.setProvider(pkProvider);

PrivateKeyProvider.prototype.send = function(payload) {
  var self = this;
  var result = null;
  switch (payload.method) {
    case "eth_accounts":
      payload.params = [];
      var address = web3.currentProvider.address;
      result = address ? [address] : [];
      break;
  }
  return {
    id: payload.id,
    jsonrpc: payload.jsonrpc,
    result
  };
};

PrivateKeyProvider.prototype.sendAsync = function(payload) {
  var self = this;
  var result = null;
  switch (payload.method) {
    case "eth_accounts":
      payload.params = [];
      var address = web3.currentProvider.address;
      result = address ? [address] : [];
      break;
  }
  return {
    id: payload.id,
    jsonrpc: payload.jsonrpc,
    result
  };
};


/*const Web3EthAccounts = require('web3-eth-accounts');
let accounts = web3.eth.accounts;
let unlockAccount = Web3EthAccounts.prototype.privateKeyToAccount('0x5a546d5a6b605c731065e4ed32ae8f6a94efbc926463f72ee7691f2441335997');
console.log('unlock',unlockAccount);*/

/*let enable = ()=> {
  web3.currentProvider.sendAsync({ method: "eth_requestAccounts", params: [] }, (error, response) => {
    console.log('enable', error, response);
    /!*if (error || response.error) {
      reject(error || response.error);
    } else {
      resolve(response.result);
    }*!/
  });
};*/
let enable = web3.currentProvider.sendAsync.bind(null, { method: "eth_requestAccounts", params: [] });

web3.currentProvider.enable = enable;
window.ethereum = web3.currentProvider;

console.log("chrome yeah交互", chrome);




