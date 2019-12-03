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
    privatekey: ""
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



      //await this.importAccountWithStrategy('Private Key',this.privatekey);
    },
    deliver() {
      window.postMessage({ type: "FROM_PAGE", text: "来自网页的问候！" }, "*");
    }
  },
  created() {
    console.log("created");
  },
  mounted() {
    console.log("mounted");
  }
});
