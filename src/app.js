require("babel-polyfill");
const accountImporter = require("./script/utils/accountImporter");
let keyringController = require("./script/utils/keyringController");

//临时设置一个固定密码
keyringController.password = "123456";
console.log("acc", accountImporter, keyringController);

new Vue({
    el: "#app",
    data: {
        message: "Hello, QuarkChain!",
        inputPrivatekey: "",
        accountsToPrivatekeys: {},
        accounts: [],
        selectedAccountIdx: 0,
    },
    watch: {
        selectedAccountIdx(newIdx,oldIdx) {
            console.log('new selectedAccountIdx:',newIdx,'oldIdx:',oldIdx);
            const selectedAccountIdx = newIdx;
            this.sendDataToContentScript(this.accounts[selectedAccountIdx]);
        }
    },
    methods: {

        //strategy:Private Key | JSON File
        async importAccountWithStrategy(strategy, privatekeyArgs) {
            const privateKey = await accountImporter.importAccount(strategy, privatekeyArgs);
            //不同硬件 不同keyringType
            const keyring = await keyringController.addNewKeyring("Simple Key Pair", [privateKey]);
            console.log("keyringController", keyringController, keyringController.keyringTypes["SimpleKeyring"].type);
            const accounts = await keyring.getAccounts();
            console.log("accounts", accounts);
            const allAccounts = await keyringController.getAccounts();
            console.log("allAccounts", allAccounts);

            if (!accounts.length) {
                return;
            }

            const addingAccount = accounts[accounts.length - 1];

            this.accountsToPrivatekeys[addingAccount] = privatekeyArgs;

        },
        changeAccount(idx) {
            console.log('changeAccount:',idx);
            this.selectedAccountIdx = idx;
            this.setItem("selectedAccountIdx", this.selectedAccountIdx, () => {
                console.log("saveItem selectedAccountIdx finish");
            })
        },
        async enter() {
            console.log("pk", this.inputPrivatekey, typeof this.inputPrivatekey);

            if (!this.inputPrivatekey) {
                console.log("please input the key");
                //todo: need to check the format of key
                return;
            }

            const privateKey = await accountImporter.importAccount("Private Key", this.inputPrivatekey);
            console.log("privateKey", privateKey);
            const keyring = await keyringController.addNewKeyring("Simple Key Pair", [privateKey]);
            console.log("keyringController", keyringController);
            const accounts = await keyringController.getAccounts();
            console.log("accounts", accounts);
            this.accounts = accounts;

            this.selectedAccountIdx = accounts.length - 1;
            const addingAccount = accounts[this.selectedAccountIdx];
            this.accountsToPrivatekeys[addingAccount] = this.inputPrivatekey;

            /*let item = await this.setItem("accounts", accounts, () => {
                console.log("saveItem finish");
            });*/

            let setItems = await Promise.all([
                this.setItem("accounts", accounts, () => {
                    console.log("setItems accounts finish");
                }),
                this.setItem("accountsToPrivatekeys", this.accountsToPrivatekeys, () => {
                    console.log("setItems accountsToPrivatekeys finish");
                }),
              this.setItem("selectedAccountIdx", this.selectedAccountIdx, () => {
                console.log("setItems selectedAccountIdx finish");
              })
            ]);
            console.log("chrome storage set", setItems);

            let getItem = await this.getItem("accounts");
            let getKey = await this.getItem("accountsToPrivatekeys");
            let getIdx = await this.getItem("selectedAccountIdx");
            console.log("chrome storage get", getItem, getKey, getIdx);


            this.sendDataToContentScript(accounts[this.selectedAccountIdx]);

            /*let currentTab = await this.getCurrentTab();
            let tabId = currentTab ? currentTab.id : null;
            if (tabId) {
                chrome.tabs.sendMessage(tabId, {privatekey: this.inputPrivatekey, account: accounts[this.selectedAccountIdx]}, response => {
                    console.log("receive the message", response);
                });
            }*/

            //await this.importAccountWithStrategy('Private Key',this.privatekey);
        },
        async deliver() {
            console.log("deliver", chrome);
            let currentTab = await this.getCurrentTab();
            let tabId = currentTab ? currentTab.id : null;
            console.log("tabs", currentTab, tabId);
            chrome.tabs.sendMessage(tabId, {privatekey: this.inputPrivatekey, accounts: this.accounts}, response => {
                console.log("receive the message", response);
            });
        },
        clear() {
            this.accounts = [];
            chrome.storage.local.clear(e => {
                console.log("clear storage data,", e);
            });
        },
        getCurrentTab() {
            return new Promise(resolve => {
                chrome.tabs.query({active: true, currentWindow: true}, tabs => resolve(tabs[0]));
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
        async sendDataToContentScript(selectedAccount){
            let currentTab = await this.getCurrentTab();
            let tabId = currentTab ? currentTab.id : null;
            console.log('privatekey',this.accountsToPrivatekeys[selectedAccount]);
            if (tabId) {
                chrome.tabs.sendMessage(tabId, {privatekey: this.accountsToPrivatekeys[selectedAccount], account: selectedAccount}, response => {
                    console.log("receive the message", response);
                });
            }
        }
    },
    created() {
        console.log("created");
    },
    async mounted() {
        console.log("mounted");
        let accounts = await this.getItem("accounts");
        console.log("mounted accounts getitem", accounts);
        if (accounts && accounts.length) {
            this.accounts = accounts;
            console.log("is able to inject");
        }
    }
});


