// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("prepare deployment \n")
   //Fetch ontract to deploy
   const Token = await ethers.getContractFactory('Token');

   const Exchange = await ethers.getContractFactory('Exchange');

   //fetch accounts
   const accounts = await ethers.getSigners();

   console.log(`Accounts fetched ${accounts[0].address}\n ${accounts[1].address}\n`)


  const dapp = await Token.deploy("Dapp university" ,"Dapp" ,"10000000");
  await dapp.deployed();
  console.log(`dapp Deployed to : ${dapp.address}`)

  const mETH = await Token.deploy('mETH','mETH',"10000000");
  await mETH.deployed();
  console.log(`mETH Deployed to : ${mETH.address}`)

  const mDAI = await Token.deploy('mDAI','mDAI',"10000000");
  await mDAI.deployed();
  console.log(`mDAI Deployed to : ${mDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address ,10);
  await exchange.deployed();
  console.log(`Exchange Deployed to : ${exchange.address}`)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
