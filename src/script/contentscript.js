const DEVNET = 'http://devnet.quarkchain.io';
const MAINNET = 'http://mainnet.quarkchain.io';

const domain = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
console.log('start domain',domain,chrome,chrome.extension);

const ObsStore = require('obs-store');

const Web3Accounts = require('web3-eth-accounts');


const injectionSite = (
    document.head || document.documentElement);
let s = document.createElement('script'),
    s2 = document.createElement('script'),
    s3 = document.createElement('script');

s.type = 'text/javascript';
s.src = 'https://cdn.jsdelivr.net/npm/web3@0.20.7/dist/web3.min.js';
//s.src = 'https://cdn.jsdelivr.net/npm/web3@1.2.4/dist/web3.min.js';
injectionSite.insertBefore(s, injectionSite.children[0]);

s.onload = () => {
    s2.type = 'text/javascript';
    s2.src = 'https://cdn.jsdelivr.net/npm/quarkchain-web3@2.0.0/dist/quarkchain-web3.js';
    s.parentNode.removeChild(s);
    injectionSite.insertBefore(s2, injectionSite.children[0]);
};

s2.onload = () => {
    //s3.type = 'module';
    s3.type = 'text/javascript';
    //注意路径 chrome.extension.getURL 是以src为根路径
    s3.src = chrome.extension.getURL('script/injected2.js');
    s2.parentNode.removeChild(s2);
    injectionSite.insertBefore(s3, injectionSite.children[0]);
};

s3.onload = () => {
    console.log('inject chrome', chrome);
    s3.parentNode.removeChild(s3);

    //加载完injected脚本后再发消息 改变currentProvider
    (async () => {
            let item = await getItem('accounts');
            let privatekey = await getItem('privatekey')
            let [accounts,accountsToKeystores,selectedAccountIdx] = await Promise.all([
                getItem("accounts"),
                getItem("accountsToKeystores"),
                getItem("selectedAccountIdx"),
            ]);



            if (accounts && accounts.length) {
                let keystore = accountsToKeystores[accounts[selectedAccountIdx]];

                console.log('Web3Accounts.prototype.decrypt(keystore,password)',Web3Accounts.prototype.decrypt(keystore,password));

                let {privateKey} = Web3Accounts.prototype.decrypt(keystore,password);
                privateKey.startsWith('0x') && (privateKey = privateKey.slice(2));
                window.postMessage({"greetFromContentScript": 'hello！', "privateKey": privateKey}, domain);
            }
        })()
};

function getItem(itemField) {
    return new Promise(resolve => {
        chrome.storage.local.get([itemField], result => resolve(result[itemField]));
    })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse("contentScript receive message："+JSON.stringify(request));

    //safer to use JSON.parse
    let {keystore, password} = JSON.parse(JSON.stringify(request));
    let {signConfirm} = JSON.parse(JSON.stringify(request));
    log.info('keystore,password',keystore,password);

    console.log('on domain',domain);

    let decryptAccount = Web3Accounts.prototype.decrypt(keystore,password);
    console.log('decryptAccount',decryptAccount);

    let privateKey = decryptAccount.privateKey;


    if (privateKey) {
        privateKey.startsWith('0x') && (privateKey = privateKey.slice(2));
        window.postMessage({"greetFromContentScript": 'hello！', "privatekey": privateKey}, domain);
    }
    if (typeof signConfirm === 'boolean') {
        window.postMessage({"greetFromContentScript": 'hello！', signConfirm}, domain);
    }

});

window.addEventListener("message", function (e) {

    console.log('esource',e.source,window,e.source==window);

    if (e.source !== window) {
        log.warn('different source')
        return;
    }

    let {shouldNotice,txInfoArr} = e.data;
    if (shouldNotice && txInfoArr && txInfoArr.length) {
        chrome.runtime.sendMessage({"greetFromContentScript": 'hello！', "shouldNotice": true, txInfoArr},response=>{
            console.log('contentScript sendMessage',response);
        })
    }
});




