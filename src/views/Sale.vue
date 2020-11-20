<template>
  <div>
    <div v-if="loading">
      <p class="text-center">Loading...</p>
    </div>
    <div v-else>
      <p>Introducing "Chambau Coin" (CHAMB)! Token price is {{ tokenPrice }} Ether.</p>
      <p>You currently have {{ balance }} CHAMB on your account {{ account }}.</p>
      <br />
      <form @submit.prevent="buyTokens()" role="form">
        <div class="fields">
          <div class="field">
            <label for="number">Number of tokens</label>
            <input v-model="numberOfTokens" type="number" name="number" value="1" min="1" pattern="[0-9]" />
          </div>
        </div>

        <ul class="actions">
          <li><input type="submit" value="Buy tokens" /></li>
        </ul>
      </form>
      <br />
      <div class="progress">
        <div class="progress-bar text-center" :style="{ width: (Math.ceil(tokenSold) / tokenAvailable) * 100 + '%' }" aria-valuemin="0" aria-valuemax="100">{{ (Math.ceil(tokenSold) / tokenAvailable) * 100 + '%' }}</div>
      </div>
      <p>{{ tokenSold }} / {{ tokenAvailable }} tokens sold</p>
    </div>
  </div>
</template>

<script>
import contract from '@truffle/contract';
import ChambauCoinSale from '@/contracts/ChambauCoinSale.json';
import ChambauCoin from '@/contracts/ChambauCoin.json';
export default {
  name: 'app',
  computed: {},
  data() {
    return {
      web3Provider: null,
      web3: null,
      loading: true,
      account: '0x0',
      tokenPrice: 1000000000000000, // in wei
      tokenSold: 0,
      tokenAvailable: 75000,
      numberOfTokens: 0,
      chambauCoinInstance: null,
      chambauCoinContract: null,
      chambauCoinSaleInstance: null,
      chambauCoinSaleContract: null,
    };
  },
  created() {},
  mounted() {
    this.chambauCoinContract = contract(ChambauCoin);
    this.chambauCoinContract.setProvider(window.web3.currentProvider);
    this.chambauCoinSaleContract = contract(ChambauCoinSale);
    this.chambauCoinSaleContract.setProvider(window.web3.currentProvider);

    return this.chambauCoinContract
      .deployed()
      .then((instance) => {
        this.chambauCoinInstance = instance;
        console.log('ChambauCoin instance address', this.chambauCoinInstance);
        return this.chambauCoinSaleContract.deployed();
      })
      .then((instance) => {
        this.chambauCoinSaleInstance = instance;
        console.log('ChambauCoinSale instance address', this.chambauCoinSaleInstance);
        return this.listenForEvents();
      })
      .then(() => {
        return this.loadData();
      })
      .then(() => {
        this.loading = false;
      })
      .catch((error) => {
        console.log(error);
      });
  },
  methods: {
    loadData() {
      return new window.web3.eth.getCoinbase()
        .then((account) => {
          this.account = account;
          console.log('Account', account);
          return this.chambauCoinSaleInstance.tokenPrice();
        })
        .then((tokenPrice) => {
          this.tokenPrice = window.web3.utils.fromWei(tokenPrice, 'ether');
          return this.chambauCoinSaleInstance.tokenSold();
        })
        .then((tokenSold) => {
          this.tokenSold = tokenSold / 100000000;
          return this.chambauCoinInstance.balanceOf(this.account);
        })
        .then((balance) => {
          this.balance = balance / 100000000;
        });
    },
    listenForEvents() {
      return this.chambauCoinSaleInstance
        .Sell({
          fromBlock: 0,
          //toBlock: 'latest',
        })
        .on('data', (event) => {
          console.log('Event ', event);
          this.loadData();
        });
    },
    buyTokens: function () {
      this.chambauCoinSaleInstance
        .buyTokens(window.web3.utils.toBN(this.numberOfTokens) * window.web3.utils.toBN(100000000), {
          from: this.account,
          value: this.numberOfTokens * window.web3.utils.toWei(this.tokenPrice, 'ether'),
          gas: 500000, // Gas limit
        })
        .then(function (result) {
          console.log('Tokens bought...', result);
          this.numberOfTokens = 0; // reset number of tokens
          // Wait for Sell event
        });
    },
  },
};
</script>
<style lang="scss">
</style>
