const KeyringController = require('eth-keyring-controller');
const SimpleKeyring = require('eth-simple-keyring');
const HdKeyring = require('eth-hd-keyring');
const LedgerBridgeKeyring = require('eth-ledger-bridge-keyring')


const keyringTypes = [SimpleKeyring,HdKeyring,LedgerBridgeKeyring];

const additionalKeyringTypes = [LedgerBridgeKeyring];

let keyringController = new KeyringController({
    keyringTypes:additionalKeyringTypes,
    //iinitState

    /*encryptor: { // An optional object for defining encryption schemes:
      // Defaults to Browser-native SubtleCrypto.
      encrypt (password, object) {
        return new Promise('encrypted!')
      },
      decrypt (password, encryptedString) {
        return new Promise({ foo: 'bar' })
      },
    },*/
});

module.exports = keyringController;
