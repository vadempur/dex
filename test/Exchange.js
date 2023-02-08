const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseEther(n.toString(), "ether");
};

describe("Exchange", function () {
  let deployer;
  let feeAccount;

  const feeParcent = 10;


  beforeEach(async () => {
    
    const Exchange = await ethers.getContractFactory("Exchange");
    const Token = await ethers.getContractFactory("Token");
    
     token1 = await Token.deploy("My Token" ,"Symbol" ,"1000000");
     token2 = await Token.deploy("Mock Dai" ,"mDAI" ,"1000000");


     accounts = await ethers.getSigners();
     deployer = accounts[0];
     feeAccount = accounts[1];
     user1 = accounts[2];
     user2 = accounts[3];


     let transaction = await token1.connect(deployer).transfer(user1.address , tokens(100))
     await transaction.wait();

     exchange = await Exchange.deploy(feeAccount.address ,feeParcent);

   });

  describe("Deployment", () => {

    it("tracks the fee account", async () => {
      expect(await exchange.feeAccount()).equal(feeAccount.address);
    });

    it("tracks the fee parcent", async () => {
        expect(await exchange.feeParcent()).equal(feeParcent);
    });

  });

  describe("Depositing Tokens" ,() => {
    let transaction ,result;
    let amount = tokens(10);
    
  

    describe('success', () => { 
        beforeEach( async () => {
            //approve token
                transaction = await token1.connect(user1).approve(exchange.address ,amount);
                result = await transaction.wait()
            //deposit token
                transaction = await exchange.connect(user1).depositTokens(token1.address ,amount);
                result = await transaction.wait()
        })

       it("tracks the token deposit" ,async () => {
        expect(await token1.balanceOf(exchange.address)).to.be.equal(amount);  
        expect(await exchange.tokens(token1.address,user1.address)).to.equal(amount)
        expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount)

       })

       it("Emits a Deposit event", async () => {
        const event = result.events[1];
        const args = event.args;
        expect(event.event).to.equal("Deposit");
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(amount);

      });
     });

    describe('failure', () => { 
        it("fails when no tokens are approved" ,async () =>{
            //Don't approve any tokens before depositing
            await expect(exchange.connect(user1).depositTokens(token1.address,amount)).to.be.reverted
        })

 
     });


  })

  describe("Withdrawing  Tokens" ,() => {
    let transaction ,result;
    let amount = tokens(10);
    

    describe('success', () => { 
        beforeEach( async () => {
            //approve token
                transaction = await token1.connect(user1).approve(exchange.address ,amount);
                result = await transaction.wait()
            //deposit token
                transaction = await exchange.connect(user1).depositTokens(token1.address ,amount);
                result = await transaction.wait()
            //withdraw token
                transaction = await exchange.connect(user1).withdrawTokens(token1.address ,amount);
                result = await transaction.wait()
        })

       it("withdraw token" ,async () => {
        expect(await token1.balanceOf(exchange.address)).to.be.equal(0);  
        expect(await exchange.tokens(token1.address ,user1.address)).to.equal(0);
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
       })

       it("Emits a Withdraw event", async () => {
        const event = result.events[1];
        const args = event.args;
        expect(event.event).to.equal("Withdraw");
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(0);

      });
     });

    describe('failure', () => { 
        it("fails for insuffceint balances" ,async () =>{
            //Don't approve any tokens before depositing
            await expect(exchange.connect(user1).withdrawTokens(token1.address,amount)).to.be.reverted
        })
     });


  })

  describe("Checking Balances" ,() => {
    let transaction ,result;
    let amount = tokens(1);
    
  

    describe('success', () => { 
        beforeEach( async () => {
            //approve token
                transaction = await token1.connect(user1).approve(exchange.address ,amount);
                result = await transaction.wait()
            //deposit token
                transaction = await exchange.connect(user1).depositTokens(token1.address ,amount);
                result = await transaction.wait()
        })

       it("returns user balance" ,async () => {
        expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount);  
       })

     
     });

  })

  describe('Making orders', () => { 
    let transaction ,result;

    let amount = tokens(1)

    describe('Sucess', () => { 
        beforeEach(async () => {
                     //approve token
                     transaction = await token1.connect(user1).approve(exchange.address ,amount);
                     result = await transaction.wait()
                 //deposit token
                     transaction = await exchange.connect(user1).depositTokens(token1.address ,amount);
                     result = await transaction.wait()   

                //make order
                     transaction = await exchange.connect(user1).makeOrder(token2.address,tokens(1) ,token1.address, tokens(1))
                     result = await transaction.wait()   
                     
        })

        it("tracks the newly created order" ,async () =>{
            expect(await exchange.orderCount()).to.equal(1)
        })

        it("emits an Order event" ,async () => {
            const event = result.events[0];
            expect(event.event).to.equal("Order");
            const args = event.args;
            expect(args.id).to.equal(1);
            expect(args.user).to.equal(user1.address);
            expect(args.tokenGet).to.equal(token2.address);
            expect(args.amountGet).to.equal(tokens(1));
            expect(args.tokenGive).to.equal(token1.address);
            expect(args.amountGive).to.equal(tokens(1));
            expect(args.timestamp).to.at.least(1);

        })
     })
     describe('Failure', () => { 
        it("Rejects with no balance" , async () => {
            await expect( exchange.connect(user1).makeOrder(token2.address,tokens(1) ,token1.address, tokens(1)))
        })
     }) 
  
  
   })
  
 describe('Order actions', () => { 
    let transaction ,result;
    let amount = tokens(1);

    beforeEach(async () => {
            //approve token
            transaction = await token1.connect(user1).approve(exchange.address ,amount);
            result = await transaction.wait()
            //deposit token
            transaction = await exchange.connect(user1).depositTokens(token1.address ,amount);
            result = await transaction.wait()   
            //make order
            transaction = await exchange.connect(user1).makeOrder(token2.address,tokens(1) ,token1.address, tokens(1))
            result = await transaction.wait()  
    })

    describe('Cancelling orders', () => { 
    
        describe('Success', async() => { 
            beforeEach(async () => {
                transaction = await exchange.connect(user1).cancelOrder(1);
                result = await transaction.wait()
            })
            
            it("update canceled orders" ,async () => {
                expect (await exchange.orderCancelled(1)).to.equal(true);
             })
            
            it("emits a Cancel event" ,async () => {
                const event = result.events[0];
                expect(event.event).to.equal("Cancel");
                const args = event.args;
                expect(args.id).to.equal(1);
                expect(args.user).to.equal(user1.address);
                expect(args.tokenGet).to.equal(token2.address);
                expect(args.amountGet).to.equal(tokens(1));
                expect(args.tokenGive).to.equal(token1.address);
                expect(args.amountGive).to.equal(tokens(1));
                expect(args.timestamp).to.at.least(1);
            })

        
         })
        
        describe("Failure" ,async () => {
          

            beforeEach(async () => {
                transaction = await token1.connect(user1).approve(exchange.address ,amount);
                result = await transaction.wait()
                //deposit token
                transaction = await exchange.connect(user1).depositTokens(token1.address ,amount);
                result = await transaction.wait()   
                //make order
                transaction = await exchange.connect(user1).makeOrder(token2.address,tokens(1) ,token1.address, tokens(1))
                result = await transaction.wait()  
    
            })
              //approve token
            it("Rejects invalid user ids" ,async () => {
             const invalidOrderId = 9999;
             await expect( exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted
            })

            it("Rejects unaauthorized user" ,async () => {
                await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
            })

        })

     })
  })


});
 