const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseEther(n.toString(), "ether");
};

describe("Token", function () {
  let token;
  let deployer;
  let reciever;
  let exchange;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("My Token", "Symbol", 1000000);
    const accounts = await ethers.getSigners();
     deployer = accounts[0];
     reciever = accounts[1];
     exchange = accounts[2];
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
    let amount ,transaction ,result;
     
    describe("Success", () => {
      beforeEach(async () => {
        amount = tokens(100);
        transaction = await token.connect(deployer).transfer(reciever.address, amount);
        result = await transaction.wait();
      });

      it("Transfer token balances", async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(999900)
        );
        expect(await token.balanceOf(reciever.address)).to.equal(amount);
      });

      it("Emits a transfer event", async () => {
        const event = result.events[0];
        const args = event.args;

        expect(event.event).to.equal("Transfer");

        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(reciever.address);
        expect(args.value).to.equal(amount);
      });
    });

    describe("Failure", ()=> {
     it("reject insufficient balance" ,async()=>{
        const invalidAmount = tokens(100000000);
        await expect(token.connect(deployer).transfer(reciever.address, invalidAmount)).to.be.reverted; 
     });

     it("reject invalid reciept" ,async()=>{
        await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted; 
     });

    })


  }) 

  describe("Approving Tokens", () => {
    let amount, transaction, result;
     
    beforeEach(async () => {
        amount = tokens(100);
        transaction = await token.connect(deployer).approve(exchange.address, amount);
        result = await transaction.wait();
    });

    describe('Success'  ,() => {
        it("allocates an allowance for delagated token spending" ,async () => {
          expect( await token.allowance(deployer.address ,exchange.address)).to.equal(amount)
        })

        it("emits an Approval event" ,async () => {
            const event = result.events[0];
            const args = event.args;
    
            expect(event.event).to.equal("Approval");
    
            expect(args.owner).to.equal(deployer.address);
            expect(args.spender).to.equal(exchange.address);
            expect(args.value).to.equal(amount);
        })
    })

    describe('Failure'  ,() => {
        it("rejects invalid spenders" ,async () => {
          const amount = tokens(100);
          expect(await token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted; 
        })
    })

 



  })

  describe("Delegated Token Transfers" ,() => {
    let amount ,transaction ,result;

    beforeEach(async () => {
        amount = tokens(100);
        transaction = await token.connect(deployer).approve(exchange.address ,amount);
        result = await transaction.wait();
    })
 
     describe("Success", async () => {
         
      beforeEach( async () => {
        transaction = await token.connect(exchange).transferFrom(deployer.address ,reciever.address , amount);
        result = await transaction.wait();
      })

      it("transfers token balances" ,async () => {
        expect( await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits("999900","ether"));
        expect( await token.balanceOf(reciever.address)).to.be.equal(amount)
      })
      
      it("resets the allowance" ,async () => {
        expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
      })

      it("Emits a transfer event", async () => {
        const event = result.events[0];
        const args = event.args;

        expect(event.event).to.equal("Transfer");

        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(reciever.address);
        expect(args.value).to.equal(amount);
      });

    });

    describe("Failure", () => {

    });

  })

});
 