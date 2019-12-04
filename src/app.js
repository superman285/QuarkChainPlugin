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
        privatekey: "",
        accounts: []
    },
    methods: {

        //strategy:Private Key | JSON File
        async importAccountWithStrategy(strategy, args) {
            const privateKey = await accountImporter.importAccount(strategy, args);
            //不同硬件 不同keyringType
            const keyring = await keyringController.addNewKeyring("Simple Key Pair", [privateKey]);
            console.log("keyringController", keyringController, keyringController.keyringTypes["SimpleKeyring"].type);
            const accounts = await keyring.getAccounts();
            console.log("accounts", accounts);
            // update accounts in preferences controller
            const allAccounts = await keyringController.getAccounts();
            console.log("allAccounts", allAccounts);
        },
        async enter() {
            console.log("pk", this.privatekey, typeof this.privatekey);

            if (!this.privatekey) {
                console.log("please input the key");
                //todo: need to check the format of key
                return;
            }

            const privateKey = await accountImporter.importAccount("Private Key", this.privatekey);
            console.log("privateKey", privateKey);
            const keyring = await keyringController.addNewKeyring("Simple Key Pair", [privateKey]);
            console.log("keyringController", keyringController);
            const accounts = await keyringController.getAccounts();
            console.log("accounts", accounts);
            this.accounts = accounts;

            /*let item = await this.setItem("accounts", accounts, () => {
                console.log("saveItem finish");
            });*/

            let setItems = await Promise.all([
                this.setItem("accounts", accounts, () => {
                    console.log("saveItem accounts finish");
                }),
                this.setItem("privatekey", this.privatekey, () => {
                    console.log("saveItem privatekey finish");
                })
            ]);
            console.log("chrome storage save", setItems);

            let getItem = await this.getItem("accounts");
            let getKey = await this.getItem("privatekey")
            console.log('chrome storage get',getItem,getKey);


            //await this.importAccountWithStrategy('Private Key',this.privatekey);
        },
        async deliver() {
            console.log("deliver", chrome);
            let currentTab = await this.getCurrentTab();
            let tabId = currentTab ? currentTab.id : null;
            console.log("tabs", currentTab, tabId);
            chrome.tabs.sendMessage(tabId, { privatekey: this.privatekey, accounts: this.accounts }, response => {
                console.log("receive the message", response);
            });
        },
        clear() {
            this.accounts = [];
            chrome.storage.local.clear(e=>{
                console.log('clear,',e);
            })
        },
        getCurrentTab() {
            return new Promise(resolve => {
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0]));
            });
        },
        setItem(itemField, data, callback) {
            return new Promise(resolve => {
                chrome.storage.local.set({ [itemField]: data }, callback);
                resolve({ itemField: data });
            });
        },
        getItem(itemField) {
            return new Promise(resolve => {
                chrome.storage.local.get([itemField], result => resolve(result[itemField]));
            });
        }
    },
    created() {
        console.log("created");
    },
    async mounted() {
        console.log("mounted");
        let item = await this.getItem("accounts");
        console.log("mounted item", item);
        if (item && item.length) {
            this.accounts = item;
            console.log("is able to inject");
        }
    }
});


