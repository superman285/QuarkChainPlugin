const DEVNET = "http://devnet.quarkchain.io";
const MAINNET = "http://mainnet.quarkchain.io";

//const ObsStore = require('obs-store');

let contentscriptPort;

function getObsStore() {
    console.log('now obsStore undefined');
}

function getCurrentTab() {
    return new Promise(resolve => {
        chrome.tabs.query({ active: true/*, currentWindow: true*/ }, tabs => resolve(tabs[0]));
    });
}

function getTxInfoArr() {
    console.log('now txInfo empty');
}

function setItem(itemField, data, callback) {
    return new Promise(resolve => {
        chrome.storage.local.set({[itemField]: data}, callback);
        resolve({itemField: data});
    });
}

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {

    console.log('bg listener -->sender',sender);

    sendResponse(`bg have received message：${JSON.stringify(request)}`);

    let { shouldNotice, txInfoArr } = JSON.parse(JSON.stringify(request));
    let { shouldConnect } = JSON.parse(JSON.stringify(request));

    let { connectConfirm,obsStore } = JSON.parse(JSON.stringify(request));

    let {clearPassword} = JSON.parse(JSON.stringify(request));

    console.log('shouldConnect password',shouldConnect);
    console.log('connectConfirm,obsStor',connectConfirm,obsStore);

    getTxInfoArr = () => txInfoArr;

    if (shouldNotice && txInfoArr) {
        const NOTIFICATION_HEIGHT = 600;
        const NOTIFICATION_WIDTH = 360;
        const NOTIFICATION_TOP = 100;
        const NOTIFICATION_LEFT = 100;
        chrome.windows.create({
            url: "sign-notification.html",
            type: "popup",
            width: NOTIFICATION_WIDTH,
            height: NOTIFICATION_HEIGHT,
            top: NOTIFICATION_TOP,
            left: NOTIFICATION_LEFT,
        }, (create_window) => {
            create_window.txInfoArr = txInfoArr;
            console.log("create sign-notification finish", create_window);
        });
    }

    if (shouldConnect) {
        const NOTIFICATION_HEIGHT = 600;
        const NOTIFICATION_WIDTH = 360;
        const NOTIFICATION_TOP = 120;
        const NOTIFICATION_LEFT = 150;
        chrome.windows.create({
            url: "password-connect.html",
            type: "popup",
            width: NOTIFICATION_WIDTH,
            height: NOTIFICATION_HEIGHT,
            top: NOTIFICATION_TOP,
            left: NOTIFICATION_LEFT
        }, (create_window) => {
            console.log("create password-connect finish", create_window);
        });
    }

    if (connectConfirm && obsStore) {
        getObsStore = () => obsStore;
        contentscriptPort && contentscriptPort.postMessage({
            obsStore,
            shouldReload:true
        });
    }

    if (clearPassword) {
        getObsStore = () => undefined;
    }

});

chrome.windows.onRemoved.addListener(windowId => {
    console.log("bg listen window removed:", windowId);
});

chrome.runtime.onConnect.addListener( (port)=>{
    console.log('connect--->',port);

    if (port.name === 'contentscript') {
        contentscriptPort = port;
        let obsStore = getObsStore();
        console.log('bg obsStore',obsStore);
        port.postMessage({
            obsStore,
            shouldReload:false
        });
    }

    port.onMessage.addListener(obsStore=>{
        console.log('get obsstore msg from popup',obsStore);
        getObsStore = () => obsStore;
    });

    port.onDisconnect.addListener(()=>{
        console.log('disconnect<-----');

        let nowTimeStamp = Date.now();
        setItem('lastActionTime',nowTimeStamp,()=>{
            console.log('set lastActionTime');
        })
    });
});
