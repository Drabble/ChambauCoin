const ChambauCoin = artifacts.require('ChambauCoin');

contract('ChambauCoin', accounts => {
  it('initialized the contract with the correct values', () => {
    let tokenInstance;
    return ChambauCoin.deployed()
      .then(instance => {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then(name => {
        assert.equal(name, 'ChambauCoin', 'has the correct name');
        return tokenInstance.symbol();
      })
      .then(symbol => {
        assert.equal(symbol, 'CHAMB', 'has the correct symbol');
        return tokenInstance.decimals();
      })
      .then(decimals => {
        assert.equal(decimals, 8, 'has the correct decimals');
      });
  });

  it('set the total supply upon deployment', () => {
    let tokenInstance;
    return ChambauCoin.deployed()
      .then(instance => {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(totalSupply => {
        assert.equal(totalSupply.toString(), web3.utils.toBN('100000000000000').toString(), "set the total supply to 1'000'000");
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(adminBalance => {
        assert.equal(adminBalance.toString(), web3.utils.toBN('100000000000000').toString(), 'it allocates the total supply to the admin account');
      });
  });

  it('transfers token', () => {
    let tokenInstance;
    return ChambauCoin.deployed()
      .then(instance => {
        tokenInstance = instance;
        return tokenInstance.transfer(accounts[1], web3.utils.toBN('9999999999999999999999999'), {
          from: accounts[0],
        });
      })
      .then(assert.fail) // Fail if we reach this
      .catch(error => {
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(senderBalance => {
        assert.equal(senderBalance.toString(), web3.utils.toBN('100000000000000').toString(), "sender has not transferred tokens 1'000'000");
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(targetBalance => {
        assert.equal(targetBalance, 0, "target has not received tokens 1'000'000");
        // Does not alter state (but returns result)
        return tokenInstance.transfer.call(accounts[1].toString(), web3.utils.toBN('25000000000000').toString(), {
          from: accounts[0],
        });
      })
      .then(success => {
        assert.equal(success, true, 'transfer succeeds');
        // Does alter state (but doesn't returns result)
        return tokenInstance.transfer(accounts[1], web3.utils.toBN('25000000000000'), {
          from: accounts[0],
        });
      })
      .then(receipt => {
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value.toString(), web3.utils.toBN('25000000000000').toString(), 'logs the transfer amount');
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(senderBalance => {
        assert.equal(senderBalance.toString(), web3.utils.toBN('75000000000000').toString(), "sender has transferred tokens 250'000");
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(targetBalance => {
        assert.equal(targetBalance.toString(), web3.utils.toBN('25000000000000').toString(), "target has received tokens 250'000");
      });
  });

  it('approves tokens for delegated transfer', () => {
    let tokenInstance;
    return ChambauCoin.deployed()
      .then(instance => {
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1], web3.utils.toBN('10000000000'), {
          from: accounts[0],
        });
      })
      .then(success => {
        assert.equal(success, true, 'approve tokens return true');
        return tokenInstance.approve(accounts[1], web3.utils.toBN('10000000000'), {
          from: accounts[0],
        });
      })
      .then(receipt => {
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
        assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are allowed from');
        assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are allowed to');
        assert.equal(receipt.logs[0].args._value.toString(), web3.utils.toBN('10000000000').toString(), 'logs the allowance amount');
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then(allowance => {
        assert.equal(allowance.toString(), web3.utils.toBN('10000000000').toString(), 'approve tokens return true');
      });
  });

  it('transfer delegated tokens fails if no allowance', () => {
    let tokenInstance;
    return ChambauCoin.deployed()
      .then(instance => {
        tokenInstance = instance;
        return tokenInstance.transferFrom(accounts[1], accounts[0], web3.utils.toBN('25000000000000'), {
          from: accounts[0],
        });
      })
      .then(assert.fail)
      .catch(error => {
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(senderBalance => {
        assert.equal(senderBalance.toString(), web3.utils.toBN('75000000000000').toString(), 'sender has not transferred tokens 100');
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(targetBalance => {
        assert.equal(targetBalance.toString(), web3.utils.toBN('25000000000000').toString(), 'target has not received tokens 100');
      });
  });

  it('transfers delegated tokens fails if asking for too much', () => {
    let tokenInstance;
    return ChambauCoin.deployed()
      .then(instance => {
        tokenInstance = instance;
        return tokenInstance.approve(accounts[1], web3.utils.toBN('25000000000000'), {
          from: accounts[0],
        });
      })
      .then(receipt => {
        return tokenInstance.transferFrom(accounts[0], accounts[1], web3.utils.toBN('999999999999999999999999999'), {
          from: accounts[1],
        });
      })
      .then(assert.fail)
      .catch(error => {
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(senderBalance => {
        assert.equal(senderBalance.toString(), web3.utils.toBN('75000000000000').toString(), 'sender has not transferred tokens 100');
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(targetBalance => {
        assert.equal(targetBalance.toString(), web3.utils.toBN('25000000000000').toString(), 'target has not received tokens 100');
      });
  });

  it('transfers delegated tokens', () => {
    let tokenInstance;
    return ChambauCoin.deployed()
      .then(instance => {
        tokenInstance = instance;
        return tokenInstance.approve(accounts[1], web3.utils.toBN('25000000000000'), {
          from: accounts[0],
        });
      })
      .then(receipt => {
        return tokenInstance.transferFrom.call(accounts[0], accounts[1], web3.utils.toBN('25000000000000'), {
          from: accounts[1],
        });
      })
      .then(success => {
        assert.equal(success, true, 'transfer succeeds');
        return tokenInstance.transferFrom(accounts[0], accounts[1], web3.utils.toBN('25000000000000'), {
          from: accounts[1],
        });
      })
      .then(receipt => {
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value.toString(), web3.utils.toBN('25000000000000').toString(), 'logs the transfer amount');
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(senderBalance => {
        assert.equal(senderBalance.toString(), web3.utils.toBN('50000000000000').toString(), "from has transferred tokens 250'000");
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(targetBalance => {
        assert.equal(targetBalance.toString(), web3.utils.toBN('50000000000000').toString(), "target has received tokens 250'000");
      });
  });
});
