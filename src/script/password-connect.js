require("babel-polyfill");
const ObsStore = require('obs-store');

new Vue({
    el: "#app",
    data: {
        inputPassword: ""
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

        goContinue() {

            if (!this.inputPassword) {
                console.warn('Password cannot be empty!');
                return;
            }

            let obsStore = new ObsStore();
            obsStore.putState({password:this.inputPassword});

            chrome.runtime.sendMessage({
                connectConfirm: true,
                obsStore: obsStore
            }, response => {
                console.info("passwordconnect page receive the message", response);

                //wait to verify if success close window
                /*this.removeCurWindow(()=>{
                    console.log('go continue ,close pwd-connect window');
                });*/
            });
        }

    },

    created() {
        console.log('passowrd connect page created');
    },

    mounted() {
        console.log('password connect page mounted');
    }

});
