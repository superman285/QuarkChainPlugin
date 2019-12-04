require('babel-polyfill');
const accountImporter = require("./script/utils/accountImporter");
let keyringController = require("./script/utils/keyringController");

//必须设置密码 否则
keyringController.password = '123456';
console.log('acc',accountImporter,keyringController);

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
      console.log('keyringController',keyringController,keyringController.keyringTypes['SimpleKeyring'].type);
      const accounts = await keyring.getAccounts();
      console.log('accounts',accounts);
      // update accounts in preferences controller
      const allAccounts = await keyringController.getAccounts();
      console.log('allAccounts',allAccounts);
    },
    async enter() {
      console.log("pk", this.privatekey,typeof this.privatekey);



      const privateKey = await accountImporter.importAccount('Private Key', this.privatekey);
      console.log('privateKey',privateKey);
      const keyring = await keyringController.addNewKeyring("Simple Key Pair", [privateKey]);
      console.log('keyringController',keyringController);

      const accounts = await keyringController.getAccounts();
      console.log('accounts',accounts);

      this.accounts = accounts;

      //await this.importAccountWithStrategy('Private Key',this.privatekey);
    },
    async deliver() {
      console.log('deliver');
      let currentTab = await this.getCurrentTab();
      let tabId = currentTab ? currentTab.id : null;
      console.log('tabs',currentTab,tabId);
      chrome.tabs.sendMessage(tabId, {privatekey:this.privatekey,accounts: this.accounts}, response=>{
          console.log('收到回复',response);
      })
    },
    getCurrentTab() {
      return new Promise(resolve=>{
        chrome.tabs.query({active:true,currentWindow:true},tabs => resolve(tabs[0]));
      })
    }
  },
  created() {
    console.log("created");
  },
  mounted() {
    console.log("mounted");
  }
});


