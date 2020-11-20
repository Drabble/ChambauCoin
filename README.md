# Chambau Coin

## Contracts

### Dev setup

For local start ganache on port 8545 and then run :

```
truffle migrate --reset
truffle test
truffle console
ChambauCoinSale.deployed().then(instance => {tokenSaleInstance = instance})
ChambauCoin.deployed().then(instance => {tokenInstance = instance})
tokenInstance.transfer(tokenSaleInstance.address, web3.utils.toBN("100000000000000"), { from: accounts[0] })
```

For Ropsten :
truffle deploy --network ropsten

For prod :

## Webapp

### Dev setup

```
npm install
npm run dev
```

### Prod build

```
npm install
npm run build
```
