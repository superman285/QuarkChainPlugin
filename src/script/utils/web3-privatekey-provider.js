const ProviderEngine = require("web3-provider-engine");
const FiltersSubprovider = require("web3-provider-engine/subproviders/filters");
const WalletSubprovider = require("web3-provider-engine/subproviders/wallet");
const RpcSubprovider = require("web3-provider-engine/subproviders/rpc");
const EthereumjsWallet = require("ethereumjs-wallet");
const NonceSubprovider = require("web3-provider-engine/subproviders/nonce-tracker");

function PrivateKeyProvider(privateKey, providerUrl) {
    if (!privateKey) {
        throw new Error(`Private Key missing, non-empty string expected, got "${privateKey}"`);
    }

    if (!providerUrl) {
        throw new Error(`Provider URL missing, non-empty string expected, got "${providerUrl}"`);
    }

    this.wallet = EthereumjsWallet.fromPrivateKey(new Buffer(privateKey, "hex"));
    this.address = "0x" + this.wallet.getAddress().toString("hex");

    this.engine = new ProviderEngine();

    this.engine.addProvider(new FiltersSubprovider());

    this.engine.addProvider(new NonceSubprovider());
    this.engine.addProvider(new WalletSubprovider(this.wallet, {}));
    this.engine.addProvider(new RpcSubprovider({rpcUrl: providerUrl}));

    //不start 一直卡在await上
    this.engine.start();
}

PrivateKeyProvider.prototype.sendAsync = function () {

    /*console.log('sendAsync,arguments',chrome,window);
    console.log(arguments);

    //todo 如果 方法是eth_signTypedData 做个拦截 还有 engine start的bug修复下

    let random = Math.random() * 5;

    console.log('random',random);
    if (random>2) {
        console.log('不通过 不给');
    }else {
        this.engine.sendAsync.apply(this.engine, arguments);
    }*/

    this.engine.sendAsync.apply(this.engine, arguments);



};

PrivateKeyProvider.prototype.send = function () {

    this.engine.send.apply(this.engine, arguments);

};

module.exports = PrivateKeyProvider;
