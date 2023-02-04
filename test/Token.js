const { expect } = require('chai')
const { ethers } = require("hardhat")


const tokens =  (n) => {
    return ethers.utils.parseEther(n.toString() ,'ether')
}

describe("Token Contract" ,function(){
  
  let token;

  beforeEach( async()=>{
    const Token = await ethers.getContractFactory('Token');
     token = await Token.deploy('My Token' ,'Symbol' ,1000000);
  })

  describe("Deployment" ,()=>{

    it("Has a name", async () => {
      expect(await token.name()).equal("My Token"); 
    });

    it("Has correct Symbol", async () => {
      expect(await token.symbol()).equal("Symbol");
    });

    it("Has correct decimal", async () => {
        expect(await token.decimals()).equal(18);
      });
      
    it("Has correct totalSupply", async () => {
        const value = tokens(1000000)
        expect(await token.totalSupply()).equal(value);
    });
    })
})