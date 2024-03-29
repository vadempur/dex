import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import '../App.css';
import Navbar from './Navbar';
import config from "../config.json"
import { loadAccount, loadExchange, loadNetwork, loadProvider, loadTokens ,subscribeToEvents} from '../store/interactions'
import Markets from './Markets';
import Balance from './Balance';

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    //connect ethers to blockchain
    const provider = loadProvider(dispatch);

    //Fetch current network's chainId ( e.g. hardhat :31337 ,kovan: 42)  
    const chainId  = await loadNetwork(provider,dispatch);




    //Reload page when chain changed

    window.ethereum.on('chainChanged' ,() => {
      window.location.reload()
    })

    //Fetch current account balance when account is changed
    window.ethereum.on('accountsChanged' ,() => {
       loadAccount(dispatch ,provider)
    } )

    //Fetch current account  & balance fro metamask
    await loadAccount(dispatch ,provider)

    //Load Token smart Contract
    const Dapp = config[chainId].Dapp.address
    const mETH =config[chainId].mETH.address
    await loadTokens(provider,[Dapp,mETH],dispatch);

    //Load exchange contract
    const exchangeConfig = config[chainId].exchange
    const exchange = await loadExchange(provider,exchangeConfig.address,dispatch)

    //listen to events 
    subscribeToEvents(exchange,dispatch)

  }

  useEffect(()=>{
    loadBlockchainData();
  })

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets/>

          <Balance/>

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