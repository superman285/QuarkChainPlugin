const DEVNET = "http://devnet.quarkchain.io";
const MAINNET = "http://mainnet.quarkchain.io";

function getCurrentTab() {
    return new Promise(resolve => {
        chrome.tabs.query({ active: true/*, currentWindow: true*/ }, tabs => resolve(tabs[0]));
    });
}

function getTxInfoArr() {
    console.log('now txInfo empty');
}

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {

    sendResponse(`bg have received message：${JSON.stringify(request)}`);

    let { shouldNotice, txInfoArr } = JSON.parse(JSON.stringify(request));

    getTxInfoArr = () => txInfoArr;

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
});

chrome.windows.onRemoved.addListener(windowId => {
    console.log("bg listen window removed:", windowId);
});
