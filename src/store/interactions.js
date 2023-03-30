import { ethers } from "ethers";
import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';

export const loadProvider  = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum);
     dispatch({type:'PROVIDER_LOADED', connection: connection})
    return connection;
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork();
    dispatch({type:'NETWORK_LOADED',chainId})
    return chainId;
}

export const loadAccount = async (dispatch ,provider) => {
    const accounts = await window.ethereum.request({"method":"eth_requestAccounts"});
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({type:'ACCOUNT_LOADED',account})

    let balance = await provider.getBalance(account)
    balance = ethers.utils.formatEther(balance)

    dispatch({type:'ETH_BALANCE_LOADED' ,balance})

    return account;

}

export const loadTokens = async (provider, address, dispatch) => {
    let token,symbol;
    token = new ethers.Contract(address[0], TOKEN_ABI, provider);
    symbol = await token.symbol;

    dispatch({type:"TOKEN_1_LOADED" ,token, symbol})

    token = new ethers.Contract(address[1], TOKEN_ABI, provider);
    symbol = await token.symbol;
    dispatch({type:"TOKEN_2_LOADED" ,token, symbol})

    return token;
}

export const loadExchange = async (provider,address,dispatch) => {
    const exchange = new ethers.Contract(address,EXCHANGE_ABI,provider);
    dispatch({type:"EXCHANGE_LOADED" , exchange})
    return exchange

}


//Load user balances

export const loadBalances = async (exchange,tokens,account,dispatch) => {
    let balance = ethers.utils.formatEther(await tokens[0].balanceOf(account),18)
    dispatch({type:'TOKEN_1_BALANCE_LOADED' ,balance})

    balance = ethers.utils.formatEther(await exchange.balanceOf(tokens[0].address,account),18)
    dispatch({type:'EXCHANGE_TOKEN_1_BALANCE_LOADED' ,balance})

    balance = ethers.utils.formatEther(await tokens[1].balanceOf(account),18)
    dispatch({type:'TOKEN_2_BALANCE_LOADED' ,balance})

    balance = ethers.utils.formatEther(await exchange.balanceOf(tokens[1].address ,account),18)
    dispatch({type:'EXCHANGE_TOKEN_2_BALANCE_LOADED' ,balance})

}


export const transferTokens = async (provider,exchange,transferType, token,amount ,dispatch) => {
    let transaction;

    const signer = await provider.getSigner();
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(),18)

    console.log(amountToTransfer)
    transaction = await token.connect(signer).approve(exchange.address,amountToTransfer);
    await transaction.wait();
    transaction = await exchange.connect(signer).depositTokens(token.address,amountToTransfer);
    await transaction.wait();

}