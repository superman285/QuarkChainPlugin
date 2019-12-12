
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
            chrome.windows.remove(curWindowID,callback);
        },

        async confirm() {
            let currentTab = await this.getCurrentTab();
            if (currentTab.url.includes('chrome://')) {
                console.log('runtime donot support onmessage');
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
                console.log('confirm,close notifaction window');
            });
        },

        async cancel() {
            let currentTab = await this.getCurrentTab();
            if (currentTab.url.includes('chrome://')) {
                console.log('runtime donot support onmessage');
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
                console.log('cancel,close notifaction window');
            });
        },

        getCurrentTab() {
            return new Promise(resolve => {
                chrome.tabs.query({active: true}, tabs => resolve(tabs[0]));
            });
        },
    },

    created() {
        chrome.runtime.getBackgroundPage(background=>{
            let txInfoArr = background.getTxInfoArr();
            this.txInfos = txInfoArr;
        })
    },

    mounted() {
        console.log('sign notification page mounted');
    }

});
