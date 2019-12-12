//const Web3 = require('web3');

const DEVNET = 'http://devnet.quarkchain.io';
const MAINNET = 'http://mainnet.quarkchain.io';

const domain = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
console.log('injected start domain',domain);

const Web3Accounts = require('web3-eth-accounts');
const PrivateKeyProvider = require("truffle-privatekey-provider");
//const PrivateKeyProvider = require("./utils/web3-privatekey-provider.js");
//let localProvider = new Web3.providers.HttpProvider("http://localhost:7878");

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

        window.postMessage({"greet": 'hello！', "shouldNotice": true, txInfoArr}, domain);


        let waitResult = await waitConfirming();

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



/*const Web3EthAccounts = require('web3-eth-accounts');
let unlockAccount = Web3EthAccounts.prototype.privateKeyToAccount('0x5a546d5a6b605c731065e4ed32ae8f6a94efbc926463f72ee7691f2441335997');
console.log('unlock',unlockAccount);*/



window.addEventListener("message", function (e) {

    console.log('esource',e.source,window,e.source === window);
    if (e.source !== window) {
        log.warn('different source')
        return;
    }

    let {privatekey} = e.data;
    let {signConfirm} = e.data;

    if (privatekey) {
        let web3 = new Web3();
        QuarkChain.injectWeb3(web3, "http://jrpc.devnet.quarkchain.io:38391");
        !window.QuarkChain && (
            window.QuarkChain = QuarkChain);

        //can not startsWith '0x'
        let pkProvider = new PrivateKeyProvider(privatekey, "https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");

        web3.setProvider(pkProvider);

        web3.currentProvider.wallet = {hidden:true};
        //web3 provider 要做一层防护或拦截 或者隐藏起wallet 再注入 页面
        window.web3 = web3;
    }

    typeof signConfirm === "boolean" && (shouldSignNext = signConfirm);
}, false);






