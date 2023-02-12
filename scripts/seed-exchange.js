const { ethers } = require("hardhat");

const config = require("../src/config.json")

const tokens = (n) => {
    return ethers.utils.parseEther(n.toString(), "ether");}

const wait = (seconds) => {
    const milliseconds = seconds * 1000 ;
    return new Promise (resolve=> setTimeout(resolve,milliseconds))
}

async function main () {
    //Fetch accounts from wallet-these are unlockd

    const accounts = await ethers.getSigners();

    const {chainId } = await ethers.provider.getNetwork()
    console.log(`using chainId ${chainId}`)


    const Dapp = await ethers.getContractAt("Token" ,config[chainId].Dapp.address); 
    console.log(`Dapp token fetched : ${Dapp.address}`)


    const mETH = await ethers.getContractAt("Token" ,config[chainId].mETH.address); 
    console.log(`mETH token fetched : ${mETH.address}`)


    const mDAI = await ethers.getContractAt("Token" ,config[chainId].mDAI.address); 
    console.log(`mDAI token fetched : ${mDAI.address}`)

    const exchange = await ethers.getContractAt("Exchange" ,config[chainId].exchange.address); 
    console.log(`Exchange token fetched : ${exchange.address}`)


    //Give tokens to account[1]
    const sender = accounts[0];
    const reciever = accounts[1];
    let amount = tokens(10000);



    //user1  transfers 10,000 mEth
    let transaction ,result;
    transaction = await mETH.connect(sender).transfer(reciever.address, amount);
    console.log(`Transfered ${amount} tokens from  ${sender.address} to ${reciever.address}\n`)

   //set up exchange users

   const user1 = accounts[0];
   const user2 = accounts[1]; 
   amount = tokens(10000)

   //user1 approves 10000 Dapp


   transaction = await Dapp.connect(user1).approve(exchange.address, amount);
   await transaction.wait()
   console.log(`Approved ${amount} tokens from ${user1.address}`)

   //user1 deposits 1000 dapp

   transaction = await exchange.connect(user1).depositTokens(Dapp.address, amount);
   await transaction.wait()
   console.log(`Deposited ${amount} Ethers from ${user1.address}`)

   //user2 approves 10000 mETH

   transaction = await mETH.connect(user2).approve(exchange.address, amount);
   await transaction.wait()
   console.log(`Approved ${amount} tokens from ${user2.address}`)

   //user2 deposits 10000 mETH

   transaction = await exchange.connect(user2).depositTokens(mETH.address, amount);
   await transaction.wait()
   console.log(`Deposited ${amount} Ethers from ${user2.address}`)
    
    //user 1 makes order to get token
    let orderId;
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100) ,Dapp.address ,tokens(5));
    result = await transaction.wait() 
    console.log(`Made order from ${user1.address}\n`);
 
    //user1 cancel the order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()

    console.log(`Cancel order from ${user1.address}\n`)

    //wait 1 second
    await wait(1)


    //seed filled order

    //user1 makes an order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100) ,Dapp.address ,tokens(10));
    result = await transaction.wait() 
    console.log(`Make order from ${user1.address}\n`);

    //user2 fills order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}`)

    await wait(1)

    //user1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50) ,Dapp.address ,tokens(15));
    result = await transaction.wait() 
    console.log(`Make order from ${user1.address}\n`);

    //user2 fills another order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}`)

    await wait(1)

      //user1 makes final order
      transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200) ,Dapp.address ,tokens(20));
      result = await transaction.wait() 
      console.log(`Make order from ${user1.address}\n`);
  
      //user2 fills final order
      orderId = result.events[0].args.id
      transaction = await exchange.connect(user2).fillOrder(orderId)
      result = await transaction.wait()
      console.log(`Filled order from ${user2.address}`)

      await wait(1)

      //seed open orders

      //user1 makes 10 orders
      for(let i=1; i<=10; i++){
        transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10*i) ,Dapp.address ,tokens(10));
        result = await transaction.wait()

        console.log(`makes order from ${user1.address}`)
        await wait(1)
      }

        //user2 makes 10 orders
        for(let i=1; i<=10; i++){
        transaction = await exchange.connect(user2).makeOrder(Dapp.address, tokens(10) ,mETH.address ,tokens(10*i));
        result = await transaction.wait()

        console.log(`makes order from ${user2.address}`)
        await wait(1)
    }





}

main()
 .then(()=>process.exit(0))
 .catch((error)=>{
    console.log(error)
    process.exit(1)
 })