require("babel-polyfill");
//const store = require('../store');
const accountImporter = require("./script/utils/accountImporter");
let keyringController = require("./script/utils/keyringController");

//临时设置一个固定密码
keyringController.password = "123456";

new Vue({
    el: "#app",
    //store
    data: {
        message: "Hello, QuarkChain!",
        inputPrivatekey: "",
        accountsToPrivatekeys: {},
        accounts: [],
        selectedAccountIdx: 0
    },
    watch: {
        selectedAccountIdx(newIdx, oldIdx) {
            console.log("account change, new selectedAccountIdx:", newIdx, "oldIdx:", oldIdx);
        }
    },
    methods: {

        async importAccountWithStrategy(strategy, privatekeyArgs) {
            const privateKey = await accountImporter.importAccount(strategy, privatekeyArgs);
            //different harware different keyringType
            const keyring = await keyringController.addNewKeyring("Simple Key Pair", [privateKey]);
            const accounts = await keyring.getAccounts();
            const allAccounts = await keyringController.getAccounts();

            if (!accounts.length) {
                return;
            }

            const addingAccount = accounts[accounts.length - 1];

            this.accountsToPrivatekeys[addingAccount] = privatekeyArgs;

        },
        changeAccount(idx) {

            if (idx === this.selectedAccountIdx) {
                return;
            }
            this.selectedAccountIdx = idx;
            this.setItem("selectedAccountIdx", this.selectedAccountIdx, () => {
                console.log("saveItem selectedAccountIdx finish");
            });
            this.sendDataToContentScript(this.accounts[idx]);
        },
        async enter() {

            if (!this.inputPrivatekey) {
                //todo: need to check the format of key
                return;
            }

            const privateKey = await accountImporter.importAccount("Private Key", this.inputPrivatekey);
            const keyring = await keyringController.addNewKeyring("Simple Key Pair", [privateKey]);
            const accounts = await keyringController.getAccounts();
            this.accounts = accounts;
            this.selectedAccountIdx = accounts.length - 1;
            const addingAccount = accounts[this.selectedAccountIdx];
            this.accountsToPrivatekeys[addingAccount] = this.inputPrivatekey;

            let setItems = await Promise.all([
                this.setItem("accounts", accounts, () => {
                    console.log("set accounts finish");
                }),
                this.setItem("accountsToPrivatekeys", this.accountsToPrivatekeys, () => {
                    console.log("set accountsToPrivatekeys finish");
                }),
                this.setItem("selectedAccountIdx", this.selectedAccountIdx, () => {
                    console.log("set selectedAccountIdx finish");
                })
            ]);


            let selectedAccount = accounts[this.selectedAccountIdx];

            this.sendDataToContentScript(accounts[this.selectedAccountIdx]);

        },
        async deliver() {
            let currentTab = await this.getCurrentTab();
            let tabId = currentTab ? currentTab.id : null;
            chrome.runtime.sendMessage({privatekey: this.inputPrivatekey, accounts: this.accounts}, response => {
                console.log("receive the message", response);
            });
        },
        async clear() {
            chrome.storage.local.clear(e => {
                console.log("clear storage data,", e);
            });

            this.accounts = [];
            this.accountsToPrivatekeys = {};
            this.selectedAccountIdx = 0;

            let setItems = await Promise.all([
                this.setItem("accounts", this.accounts, () => {
                    console.log("set accounts finish");
                }),
                this.setItem("accountsToPrivatekeys", this.accountsToPrivatekeys, () => {
                    console.log("set accountsToPrivatekeys finish");
                }),
                this.setItem("selectedAccountIdx", this.selectedAccountIdx, () => {
                    console.log("set selectedAccountIdx finish");
                })
            ]);
            console.log("chrome storage clear", setItems);
        },
        getCurrentTab() {
            return new Promise(resolve => {
                chrome.tabs.query({active: true/*, currentWindow: true*/}, tabs => resolve(tabs[0]));
            });
        },
        setItem(itemField, data, callback) {
            return new Promise(resolve => {
                chrome.storage.local.set({[itemField]: data}, callback);
                resolve({itemField: data});
            });
        },
        getItem(itemField) {
            return new Promise(resolve => {
                chrome.storage.local.get([itemField], result => resolve(result[itemField]));
            });
        },
        async sendDataToContentScript(selectedAccount) {
            let currentTab = await this.getCurrentTab();
            if (currentTab.url.includes('chrome://')) {
                console.log('runtime not support onmessage');
                return;
            }
            let tabId = currentTab ? currentTab.id : null;
            if (tabId) {
                chrome.tabs.sendMessage(tabId, {
                    privatekey: this.accountsToPrivatekeys[selectedAccount],
                    account: selectedAccount
                }, response => {
                    console.log("receive the message", response);
                });
            }
        }
    },

    async mounted() {
        console.log("mounted");
        let [accounts, accountsToPrivatekeys, selectedAccountIdx] = await Promise.all([
            this.getItem("accounts"),
            this.getItem("accountsToPrivatekeys"),
            this.getItem("selectedAccountIdx")
        ]);
        if (accounts && accounts.length) {
            this.accounts = accounts;
            this.accountsToPrivatekeys = accountsToPrivatekeys;
            this.selectedAccountIdx = selectedAccountIdx;
        }

        /*chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            sendResponse("popp receive your message：",JSON.stringify(request));
            console.log('chrome',chrome);
            let {shouldNotice} = request;
        });*/
    }
});


