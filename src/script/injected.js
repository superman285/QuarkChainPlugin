//import('https://cdn.jsdelivr.net/npm/web3@1.2.4/dist/web3.min.js').then(res=>{
//import('https://cdn.jsdelivr.net/npm/quarkchain-web3@2.0.0/dist/quarkchain-web3.js').then(res=>{

//const HDWalletProvider = require('@truffle/hdwallet-provider')
//const Web3 = require('web3');

const { errors: rpcErrors } = require('eth-json-rpc-errors')
const DEVNET = 'http://devnet.quarkchain.io';
const MAINNET = 'http://mainnet.quarkchain.io';

const PrivateKeyProvider = require("truffle-privatekey-provider");
//const PrivateKeyProvider = require("./utils/web3-privatekey-provider.js");

const PRIVATE_KEY = "93945E79D3FD4D0FDC60CB2C9031B2D8ACF3C688F3185C0730ED30D85C66B77F";
//const PRIVATE_KEY = "5a546d5a6b605c731065e4ed32ae8f6a94efbc926463f72ee7691f2441335997";
//let pkProvider = new PrivateKeyProvider(PRIVATE_KEY, "https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");
//let pkProvider = new PrivateKeyProvider(PRIVATE_KEY, "https://rinkeby.infura.io/");
//let pkProvider = new PrivateKeyProvider(privateKey, "http://localhost:8545");

console.log("web3 quarkchain", Web3, window.Web3, window);
//window.Web3 = Web3;

/*let web3 = new Web3();
window.web3 = web3;
console.log("web3", web3);
QuarkChain.injectWeb3(web3, "http://jrpc.devnet.quarkchain.io:38391");
!window.QuarkChain && (
  window.QuarkChain = QuarkChain);*/

//web3.qkc.setPrivateKey("0x93945E79D3FD4D0FDC60CB2C9031B2D8ACF3C688F3185C0730ED30D85C66B77F");

//let localProvider = new Web3.providers.HttpProvider("http://localhost:7878");
//let localProvider = new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");
//web3.setProvider(pkProvider);

let shouldSignNext;

let waitConfirming = ()=>
    new Promise((resolve,reject)=>{
        let waitConfirming_timer = null;
        waitConfirming_timer = setInterval(()=>{
            console.log('shouldSignNext',shouldSignNext);
            if(typeof shouldSignNext === "boolean") {
                clearInterval(waitConfirming_timer)
                resolve(shouldSignNext)
            }
        },1000)
    });

PrivateKeyProvider.prototype.isQuarkChain = true;

PrivateKeyProvider.prototype.send = function (payload) {
    let result = null;
    switch (payload.method) {
        case "eth_accounts":
            payload.params = [];
            let address = web3 && web3.currentProvider && web3.currentProvider.address;
            result = address ? [address] : [];
            return {
                id: payload.id,
                jsonrpc: payload.jsonrpc,
                result
            };
        default:
            return this.engine.sendAsync.apply(this.engine, arguments);
    }
};



PrivateKeyProvider.prototype.sendAsync = async function(payload) {
    if (payload.method === "eth_signTypedData") {


        let {params:[txInfoArr]} = payload;

        console.log('payload', payload, txInfoArr, chrome);

        if (window.origin && window.origin.includes(MAINNET)) {
            window.postMessage({"greet": 'hello！', "shouldNotice": true, txInfoArr}, MAINNET);
        }else if (window.origin && window.origin.includes(DEVNET)) {
            window.postMessage({"greet": 'hello！', "shouldNotice": true, txInfoArr}, DEVNET);
        }

        let waitResult = await waitConfirming();
        console.log('waitResult',waitResult);

        if (waitResult == true) {
            shouldSignNext = undefined;
            this.engine.sendAsync.apply(this.engine, arguments);
        }else {
            shouldSignNext = undefined;
            alert.dismiss();
        }
    }else {
        this.engine.sendAsync.apply(this.engine, arguments);
    }



};

/*let web3 = new Web3();
console.log("web3", web3);
QuarkChain.injectWeb3(web3, "http://jrpc.devnet.quarkchain.io:38391");
!window.QuarkChain && (
    window.QuarkChain = QuarkChain);
let pkProvider = new PrivateKeyProvider('93945E79D3FD4D0FDC60CB2C9031B2D8ACF3C688F3185C0730ED30D85C66B77F', "https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");
console.log('setProvider');
web3.setProvider(pkProvider);
window.web3 = web3;*/


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
/*let enable = web3.currentProvider.sendAsync.bind(null, { method: "eth_requestAccounts", params: [] });
web3.currentProvider.enable = enable;
window.ethereum = web3.currentProvider;*/

window.addEventListener("message", function (e) {
    console.log('injected hear message', e, chrome);
    console.log(e.data);

    let {privatekey} = e.data;
    let {signConfirm} = e.data;
    console.log('signConfirm',signConfirm);

    if (privatekey) {
        let web3 = new Web3();
        console.log("web3", web3);
        QuarkChain.injectWeb3(web3, "http://jrpc.devnet.quarkchain.io:38391");
        !window.QuarkChain && (
            window.QuarkChain = QuarkChain);
        let pkProvider = new PrivateKeyProvider(privatekey, "https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");

        console.log('setProvider');
        web3.setProvider(pkProvider);
        window.web3 = web3;
        console.log('after set provider', web3);

        /*let enable = web3.currentProvider.sendAsync.bind(null, { method: "eth_requestAccounts", params: [] });
        web3.currentProvider.enable = enable;*/
        //window.ethereum = web3.currentProvider;
    }

    typeof signConfirm === "boolean" && (shouldSignNext = signConfirm);


}, false);






