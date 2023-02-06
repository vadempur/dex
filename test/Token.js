const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseEther(n.toString(), "ether");
};

describe("Token Contract", function () {
  let token;
  let deployer

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("My Token", "Symbol", 1000000);
    const accounts = await ethers.getSigners();
     deployer = accounts[0];
  });

  describe("Deployment", () => {
    const name = "My Token";
    const symbol = "Symbol";
    const decimals = 18;
    const totalSupply = tokens(1000000);

    it("Has a name", async () => {
      expect(await token.name()).equal(name);
    });

    it("Has correct Symbol", async () => {
      expect(await token.symbol()).equal(symbol);
    });

    it("Has correct decimal", async () => {
      expect(await token.decimals()).equal(decimals);
    });

    it("Has correct totalSupply", async () => {
      expect(await token.totalSupply()).equal(totalSupply);
    });
    
    it("assigns total supply to deployer" ,async () => {
        expect(await token.balanceOf(deployer.address)).equal(totalSupply)
    } )

  });

  describe("Sending Token", () => {
    it('Transfer token balances' ,()=> {
        
    })
  })
});
 