const ChambauCoin = artifacts.require('ChambauCoin');
const ChambauCoinSale = artifacts.require('ChambauCoinSale');

contract('ChambauCoinSale', accounts => {
  const tokenPrice = web3.utils.toBN(web3.utils.toWei('0.001', 'ether')); // In wei

  it('initialized the contract with the correct values', () => {
    let tokenSaleInstance;
    return ChambauCoinSale.deployed()
      .then(instance => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then(address => {
        assert.notEqual(address, 0x0, 'has the correct admin account address');
        return tokenSaleInstance.tokenPrice();
      })
      .then(tokenContract => {
        assert.notEqual(tokenContract, 0x0, 'has the correct admin account address');
        return tokenSaleInstance.tokenPrice();
      })
      .then(tokenPriceInInstance => {
        assert.equal(tokenPriceInInstance.toString(), tokenPrice.toString(), 'has the correct token price');
      });
  });

  it('facilitates token buying', () => {
    let tokenSaleInstance;
    let tokenInstance;
    const numberOfTokens = web3.utils.toBN('1000000000');
    const value = numberOfTokens * (tokenPrice / 100000000);
    return ChambauCoin.deployed()
      .then(instance => {
        tokenInstance = instance;
        return ChambauCoinSale.deployed();
      })
      .then(instance => {
        tokenSaleInstance = instance;
        return tokenInstance.transfer(tokenSaleInstance.address, web3.utils.toBN('1000000000'), { from: accounts[0] });
      })
      .then(receipt => {
        return tokenSaleInstance.buyTokens(numberOfTokens, { from: accounts[0], value: value });
      })
      .then(receipt => {
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
        assert.equal(receipt.logs[0].args._buyer, accounts[0], 'logs the account the purchased the tokens');
        assert.equal(receipt.logs[0].args._value.toString(), numberOfTokens.toString(), 'logs the amount of tokens purchased');
        return tokenSaleInstance.tokenSold();
      })
      .then(amount => {
        assert.equal(amount.toString(), numberOfTokens.toString(), 'increments the number of tokens sold');
      });
  });

  it('fails token buying if the sale instance has not enough tokens', () => {
    let tokenSaleInstance;
    let tokenInstance;
    const numberOfTokens = web3.utils.toBN('10000000000');
    const value = (numberOfTokens * tokenPrice) / 100000000;
    return ChambauCoin.deployed()
      .then(instance => {
        tokenInstance = instance;
        return ChambauCoinSale.deployed();
      })
      .then(instance => {
        tokenSaleInstance = instance;
        return tokenInstance.transfer(tokenSaleInstance.address, web3.utils.toBN('1000000000'), { from: accounts[0] });
      })
      .then(receipt => {
        return tokenSaleInstance.buyTokens(numberOfTokens, { from: accounts[0], value: value });
      })
      .then(assert.fail)
      .catch(error => {
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(amount => {
        assert.equal(amount.toString(), web3.utils.toBN('99999000000000').toString(), "the balance of token sale instance doesn't change");
      });
  });

  it('user cannot end token sale if not admin', () => {
    let tokenSaleInstance;
    return ChambauCoinSale.deployed()
      .then(instance => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.endSale({ from: accounts[1] });
      })
      .then(assert.fail)
      .catch(error => {
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      });
  });

  it('end token sale', () => {
    let tokenSaleInstance;
    let tokenInstance;
    const numberOfTokens = web3.utils.toBN(10);
    const value = numberOfTokens * tokenPrice;
    return (
      ChambauCoin.deployed()
        .then(instance => {
          tokenInstance = instance;
          return ChambauCoinSale.deployed();
        })
        .then(instance => {
          tokenSaleInstance = instance;
          return tokenInstance.transfer(tokenSaleInstance.address, web3.utils.toBN('1000000000'), { from: accounts[0] });
        })
        .then(receipt => {
          return tokenSaleInstance.endSale({ from: accounts[0] });
        })
        /*.then((receipt) => {
        return tokenSaleInstance.buyTokens(numberOfTokens, { from: accounts[0], value: value })
      })
      .then(assert.fail)
      .catch((error) => {
        console.log(error)
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert')
        return tokenInstance.balanceOf(accounts[0])
      })*/
        .then(receipt => {
          return tokenInstance.balanceOf(accounts[0]);
        })
        .then(amount => {
          assert.equal(amount.toString(), web3.utils.toBN('100000000000000').toString(), 'the balance of admin is restored');
          return tokenSaleInstance.tokenPrice();
        })
        .then(assert.fail)
        .catch(error => {
          assert(error.message.indexOf("Returned values aren't valid") >= 0, 'error must be triggered');
        })
    );
  });
});
