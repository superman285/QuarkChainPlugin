require("babel-polyfill");
const store = require('./store');
const accountImporter = require("./script/utils/accountImporter");
let keyringController = require("./script/utils/keyringController");


const log = require('loglevel');
log.setLevel(0); //trace
const ObsStore = require('obs-store');
const Web3Accounts = require('web3-eth-accounts');


//临时设置一个固定密码
keyringController.password = "123456";


new Vue({
    el: "#app",
    store,
    data: {
        message: "Hello, QuarkChain!",
        inputPrivatekey: "",
        accountsToPrivatekeys: {},
        accountsToKeystores: {},
        accounts: [],
        selectedAccountIdx: 0,
        inputPassword: "",
        obsStore: new ObsStore(),
        port: chrome.runtime.connect({name:'jojo'})
    },
    watch: {
        selectedAccountIdx(newIdx, oldIdx) {
            console.log("account change, new selectedAccountIdx:", newIdx, "oldIdx:", oldIdx);
        }
    },
    computed: {
        passwordLocked() {
            console.log('passwordLocked',store.state);
            return store.state.passwordLocked;
        }
    },
    methods: {
        async submitPwd() {
            if (!this.inputPassword) {
                //console.log('password cannot be empty!');
                log.warn('password cannot be empty!');
                return
            }

            let accounts = await this.getItem('accounts');
            if (!accounts.length) {
                store.commit('unlockByPwd');
                await this.setItem('passwordLocked',false,()=>{
                    console.log('unlock by password');
                });
                this.obsStore.putState({password:this.inputPassword});
                this.port.postMessage(this.obsStore);
                return;
            }
            this.unlockByPwd();
            this.obsStore.putState({password:this.inputPassword});
            this.port.postMessage(this.obsStore);

        },
        lock() {
            this.lockByPwd();
        },
        lockByPwd() {
            store.commit('lockByPwd');
            this.setItem('passwordLocked',true,()=>{
                console.log('lock by password');
            })
        },
        async unlockByPwd() {
            let verifyResult = await this.verifyPassword(this.inputPassword);
            if (verifyResult) {
                log.info('Verify Success!');
                store.commit('unlockByPwd');
                this.setItem('passwordLocked',false,()=>{
                    console.log('unlock by password');
                })
            }else {
                log.warn('Password Vefiry Failed!');
            }
        },
        async createPassword(password) {
            let accounts = await this.getItem('accounts');
            //let firstCreateFlag = /从store取
            if (!accounts.length /*&& firstCreateFlag*/) {
                store.commit('unlockByPwd');
                await this.setItem('passwordLocked',false,()=>{
                    console.log('unlock by password');
                })
            }
        },
        async verifyPassword(password) {
            let accountFromStorage = (await this.getItem('accounts'))[0];
            console.log('accountFromStorage',accountFromStorage);
            let keystoreFromStorage = (await this.getItem('accountsToKeystores'))[accountFromStorage];

            try {
                let decryptAccount = Web3Accounts.prototype.decrypt(keystoreFromStorage,password);
                log.info('decryptAccount',decryptAccount);
                if (decryptAccount.address === accountFromStorage) {
                    return true;
                }else {
                    return false;
                }
            } catch (err) {
                return false;
            }
        },
        async importAccountWithStrategy(strategy, input_args) {
            const newPrivateKey = `0x${await accountImporter.importAccount(strategy, input_args)}`;
            log.info('privateKey',newPrivateKey);
            const newAccount = Web3Accounts.prototype.privateKeyToAccount(newPrivateKey);
            log.info('newAccount',newAccount);
            const {password} = this.obsStore.getState();
            log.info('password',password,typeof password);
            const newKeyStore = Web3Accounts.prototype.encrypt(newPrivateKey,password);
            log.info('newKeyStore',newKeyStore);
            return {newAccount,newKeyStore};
        },
        changeAccount(idx) {
            if (idx === this.selectedAccountIdx) {
                return;
            }
            this.selectedAccountIdx = idx;
            this.setItem("selectedAccountIdx", this.selectedAccountIdx, () => {
                console.log("save selectedAccountIdx finish");
            });
            this.sendDataToContentScript(this.accounts[idx]);
        },
        async enter() {

            if (!this.inputPrivatekey) {
                //todo: need to check the format of key
                return;
            }

            const {newAccount,newKeyStore} = await this.importAccountWithStrategy("Private Key",this.inputPrivatekey)

            this.accounts.push(newAccount.address);

            //Duplicate remove
            this.accounts = [...new Set(this.accounts)];
            this.accountsToKeystores[newAccount.address] = newKeyStore;


            let setItems = await Promise.all([
                this.setItem("accounts",this.accounts,(res)=>{
                    console.log('set accounts over',res);
                }),
                this.setItem("accountsToKeystores",this.accountsToKeystores,(res)=>{
                    console.log('set accountsToKeystores over',res);
                })
            ]);
            log.info('enter new setItems',setItems);


            this.sendDataToContentScript(['keystore','password'],[this.accountsToKeystores[this.accounts[this.selectedAccountIdx]],this.obsStore.getState().password]);

        },
        async deliver() {
            let currentTab = await this.getCurrentTab();
            let tabId = currentTab ? currentTab.id : null;
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
        async sendDataToContentScript(fields,datas) {
            let currentTab = await this.getCurrentTab();
            if (currentTab.url.includes('chrome://')) {
                log.info('runtime not support onmessage');
                return;
            }
            let tabId = currentTab ? currentTab.id : null;

            let fieldsToDatas = {};
            fields.forEach((field,idx)=>{
                fieldsToDatas[field] = datas[idx]
            });
            console.log('fieldsToDatas',fieldsToDatas,currentTab);
            if (tabId) {
                chrome.tabs.sendMessage(tabId, fieldsToDatas, response => {
                    log.info("receive the message", response);
                });
            }
        }
    },

    async mounted() {
        console.log("mounted");

        chrome.runtime.getBackgroundPage(background=>{
            let obsStore = background.getObsStore();
            //use assign to add the origin methods & property
            obsStore && (this.obsStore = Object.assign(new ObsStore(),obsStore));
            console.log('mounted obsStore',this.obsStore,this.obsStore.getState());
        });

        store.dispatch('getPasswordLockedFromStorage');

        let [accounts, accountsToKeystores, selectedAccountIdx] = await Promise.all([
            this.getItem("accounts"),
            this.getItem("accountsToKeystores"),
            this.getItem("selectedAccountIdx")
        ]);
        if (accounts && accounts.length) {
            this.accounts = accounts;
            this.accountsToKeystores = accountsToKeystores;
            this.selectedAccountIdx = selectedAccountIdx;
        }

    },

});


