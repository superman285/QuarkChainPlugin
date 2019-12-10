const KeyringController = require('eth-keyring-controller');
const SimpleKeyring = require('eth-simple-keyring');
const HdKeyring = require('eth-hd-keyring');
const LedgerBridgeKeyring = require('eth-ledger-bridge-keyring')


const keyringTypes = [SimpleKeyring,HdKeyring,LedgerBridgeKeyring];

const additionalKeyringTypes = [LedgerBridgeKeyring];

let keyringController = new KeyringController({
    keyringTypes:additionalKeyringTypes,
    //initState
});

module.exports = keyringController;
