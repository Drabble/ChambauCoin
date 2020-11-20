// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import './ChambauCoin.sol';

contract ChambauCoinSale {
  address payable admin;
  ChambauCoin public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokenSold;

  event Sell(address indexed _buyer, uint256 _value);

  constructor(ChambauCoin _tokenContract, uint256 _tokenPrice) public {
    admin = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
  }

  function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
    require(y == 0 || (z = x * y) / y == x);
  }

  function buyTokens(uint256 _numberOfTokens) public payable returns (bool success) {
    require(multiply(msg.value, 100000000) == multiply(_numberOfTokens, tokenPrice), 'revert, value not equal to tokens * tokenPrice'); // TODO : Test that
    require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, 'revert, balance insufficient'); // TODO : Test this
    require(tokenContract.transfer(msg.sender, _numberOfTokens), 'revert, transfer failed'); // TODO : Test this

    tokenSold += _numberOfTokens;
    emit Sell(msg.sender, _numberOfTokens);

    return true;
  }

  function endSale() public {
    require(msg.sender == admin);
    require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))), 'revert, transfer failed'); // TODO : Test this
    selfdestruct(admin);
  }
}
