import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import Web3 from 'web3';

import '@/assets/sass/main.scss';
import '@/assets/sass/style.scss';

Vue.config.productionTip = false;

const ethEnabled = () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    window.ethereum.enable();
    return true;
  }
  return false;
};

window.addEventListener('load', function() {
  /*if (typeof web3 !== 'undefined') {
    console.log('Web3 injected browser: OK.');
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    console.log('Web3 injected browser: Fail. You should consider trying MetaMask.');
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //window.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    window.web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/eb6422952bc043369edf5c023f2bdf6c'));
  }*/
  if (!ethEnabled()) {
    alert('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!');
  }

  /* eslint-disable no-new */
  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app');
});
