const { ethers } = require("ethers");

const randomWallet = ethers.Wallet.createRandom();

console.log(randomWallet.address);
