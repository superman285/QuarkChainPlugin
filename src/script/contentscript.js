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

    //加载完injected脚本后再发消息 再改变currentProvider

    (
        async () => {
            let item = await this.getItem('accounts');
            let privatekey = await this.getItem('privatekey')
            let [accounts,accountsToPrivatekeys,selectedAccountIdx] = await Promise.all([
                this.getItem("accounts"),
                this.getItem("accountsToPrivatekeys"),
                this.getItem("selectedAccountIdx"),
            ]);
            let getAccounts = await this.getItem("accounts");
            let getKeys = await this.getItem("accountsToPrivatekeys");
            let getIdx = await this.getItem("selectedAccountIdx");
            console.log('contentscript get accounts', accounts,accountsToPrivatekeys,selectedAccountIdx);
            console.log('get2',getAccounts,getKeys,getIdx);
            if (accounts && accounts.length) {
                console.log('accounts not empty', accounts,accountsToPrivatekeys,selectedAccountIdx,accountsToPrivatekeys[accounts[selectedAccountIdx]]);
                let privatekey = accountsToPrivatekeys[accounts[selectedAccountIdx]];
                window.postMessage({"test": 'hello！', "privatekey": privatekey}, '*');
            }
        })()

};

function getItem(itemField) {
    return new Promise(resolve => {
        chrome.storage.local.get([itemField], result => resolve(result[itemField]));
    })
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('request sender sendResponse', request, sender, sendResponse);
    sendResponse("我已收到你的消息：",JSON.stringify(request));//做出回应

    let {privatekey, account} = request;
    console.log('accounts', account, privatekey);

    privatekey.startsWith('0x') && (privatekey = privatekey.slice(2));

    //const PrivateKeyProvider = require("truffle-privatekey-provider");
    //const privateKey = "93945E79D3FD4D0FDC60CB2C9031B2D8ACF3C688F3185C0730ED30D85C66B77F";
    //let pkProvider = new PrivateKeyProvider(privatekey, "https://rinkeby.infura.io/v3/c8c7838ccbae48d6b5fb5f8885e184d6");

    window.postMessage({"greet": 'hello！', "privatekey": privatekey}, '*');


});






