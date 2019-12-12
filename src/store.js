const Vue = require('vue');
const Vuex = require('vuex');

//Vue.use(Vuex);

let savedPasswordLocked;
let lastActionTime;

function getItem(itemField) {
    return new Promise(resolve => {
        chrome.storage.local.get([itemField], result => resolve(result[itemField]));
    });
}

module.exports = new Vuex.Store({
    state:{
        txInfo: '',
        passwordLocked: true,
    },
    getters: {
        passwordLocked(state){
            return Boolean(state.passwordLocked);
        }
    },
    mutations: {
        lockByPwd(state) {
            Vue.set(state,'passwordLocked',true);
        },
        unlockByPwd(state) {
            Vue.set(state,'passwordLocked',false);
        }
    },
    actions: {

        async getPasswordLockedFromStorage({commit}) {
            savedPasswordLocked = await getItem('passwordLocked');
            (savedPasswordLocked === undefined) && (savedPasswordLocked = true);

            lastActionTime = await getItem('lastActionTime');
            (lastActionTime === undefined) && (lastActionTime = 0);

            let nowTimeStamp = Date.now();

            //over 2min lock the wallet
            if (nowTimeStamp - lastActionTime >= 60*1000) {
                savedPasswordLocked = true;
            }

            if (savedPasswordLocked) {
                commit('lockByPwd')
            }else {
                commit('unlockByPwd')
            }

            return savedPasswordLocked;
        }

    },
    modules: {

    }
});
