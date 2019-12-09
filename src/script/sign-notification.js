
//const store = require('../store');

new Vue({
    el: "#app",
    //store,
    data: {
        txInfos: []
    },
    methods: {

        getCurrentWindowID() {
            return new Promise(resolve => {
                chrome.windows.getCurrent(curWindow => resolve(curWindow.id))
            })
        },
        async removeCurWindow(callback) {
            let curWindowID = await this.getCurrentWindowID();
            console.log('curWindowID',curWindowID);
            chrome.windows.remove(curWindowID,callback);
        },

        async confirm() {
            let currentTab = await this.getCurrentTab();
            if (currentTab.url.includes('chrome://')) {
                console.log('runtime not support onmessage');
                return;
            }
            let tabId = currentTab ? currentTab.id : null;
            if (tabId) {
                chrome.tabs.sendMessage(tabId, {
                    signConfirm: true
                }, response => {
                    console.log("signNotification receive the message", response);
                });
            }
            this.removeCurWindow(()=>{
                console.log('confirm & close notifaction window');
            });
        },

        async cancel() {
            let currentTab = await this.getCurrentTab();
            if (currentTab.url.includes('chrome://')) {
                console.log('runtime not support onmessage');
                return;
            }
            let tabId = currentTab ? currentTab.id : null;
            if (tabId) {
                chrome.tabs.sendMessage(tabId, {
                    signConfirm: false
                }, response => {
                    console.log("signNotification receive the message", response);
                });
            }

            this.removeCurWindow(()=>{
                console.log('cancel & close notifaction window');
            });
        },

        getCurrentTab() {
            return new Promise(resolve => {
                chrome.tabs.query({active: true}, tabs => resolve(tabs[0]));
            });
        },
    },
    /*beforeCreate() {
        console.log('sign notification created');
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            console.log('signNotification request sender sendResponse', request, sender, sendResponse);
            let {txInfoArr} = JSON.parse(JSON.stringify(request));
            console.log('txInfoArr',txInfoArr);
        })

    },*/
    created() {

        console.log('created');

        chrome.runtime.getBackgroundPage(bgObj=>{
            console.log('bgObj',bgObj,bgObj.getTxInfoArr2);
            let txInfoArr = bgObj.getTxInfoArr2();
            console.log('txInfoArr',txInfoArr);

            this.txInfos = txInfoArr;
        })

    },

    mounted() {
        console.log('sign notification');


    }
})
