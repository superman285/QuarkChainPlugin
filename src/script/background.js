const DEVNET = "http://devnet.quarkchain.io";
const MAINNET = "http://mainnet.quarkchain.io";

function getCurrentTab() {
    return new Promise(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0]));
    });
}

function getCurrentTab2() {
    return new Promise(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0]));
    });
}

let getTxInfoArr = ()=>{
    console.log('now txInfo empty');
};

function getTxInfoArr2() {
    console.log('now txInfo empty2');
}

function getTxInfoArrT() {
    console.log('now txInfo empty3');
}


chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {

    console.log("im background", chrome, window);
    console.log("request sender sendResponse", request, sender, sendResponse);
    sendResponse(`bg have received message：${JSON.stringify(request)}`);//做出回应

    let { shouldNotice, txInfoArr } = JSON.parse(JSON.stringify(request));
    console.log("background hear shouldNotice", shouldNotice);

    getTxInfoArr = _ => txInfoArr;
    getTxInfoArr2 = _ => txInfoArr;

    if (shouldNotice && txInfoArr) {
        const NOTIFICATION_HEIGHT = 620;
        const NOTIFICATION_WIDTH = 360;
        const notificationTop = 100;
        const notificationLeft = 100;
        chrome.windows.create({
            url: "sign-notification.html",
            type: "popup",
            width: NOTIFICATION_WIDTH,
            height: NOTIFICATION_HEIGHT,
            top: Math.max(notificationTop, 0),
            left: Math.max(notificationLeft, 0)
        }, (win) => {
            win.txInfoArr = txInfoArr;
            console.log("create finish", win);
        });


    }

    /*if (typeof signConfirm === 'boolean') {
        console.log('receive signConfirm prepare to send ->',signConfirm);

        let currentTab = await this.getCurrentTab();
        let tabId = currentTab ? currentTab.id : null;
        console.log('tabId',tabId);

        chrome.tabs.sendMessage(tabId, {
            signConfirm: true
        }, response => {
            console.log("bg receive the message", response);
        });

        /!*chrome.runtime.sendMessage({
            signConfirm
        }, response => {
            console.log("bg receive the message", response);
        });*!/
    }*/

});

chrome.windows.onCreated.addListener(window => {
    console.log("bg listen create windowId", window);


});
