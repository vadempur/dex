import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { ethers } from 'ethers'
import TOKEN_ABI from '../abis/Token.json'
import '../App.css'
import config from "../config.json"

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({"method":"eth_requestAccounts"});
    console.log(accounts[0]);
    //connect ethers to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    dispatch({type:'PROVIDER_LOADED', connection: provider})
    const { chainId } = await provider.getNetwork();

    console.log(chainId);

    //Token smart Contract
    const token = new ethers.Contract(config[chainId].Dapp.address, TOKEN_ABI,provider);
    const symbol = await token.symbol();

    console.log(symbol);

  }

  useEffect(()=>{
    loadBlockchainData();
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;