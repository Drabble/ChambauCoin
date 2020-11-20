const ChambauCoin = artifacts.require('ChambauCoin');
const ChambauCoinSale = artifacts.require('ChambauCoinSale');

module.exports = function(deployer) {
  deployer.deploy(ChambauCoin, web3.utils.toBN('100000000000000')).then(() => {
    const tokenPrice = web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    return deployer.deploy(ChambauCoinSale, ChambauCoin.address, tokenPrice); // In wei
  });
};
