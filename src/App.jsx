import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';
import {CONTRACT_ADDRESS, transformCharacterData} from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';

const checkNetwork = async () => {
  try {
  if (window.etherum.networkVersion !== '4') {
    alert('Подключитесь к тестовой сети Rinkeby в MetaMask!');
  }
  } catch(e) {
    console.error(e);
  }
}

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const renderContent = () => {

    if (isLoading) {
      return <LoadingIndicator />
    }

    if (!currentAccount) {
      return (<React.Fragment>
          <p className="sub-text">Создай NFT персонажа и останови локомотив Гейба<br/> с командой отважных друзей!</p>
          <div className="connect-wallet-container">
            <img
              src="https://media.giphy.com/media/AcbborW0z5XW0/giphy.gif"
            />

            <button
              className="cta-button connect-wallet-button"
              onClick={connectWalletAction}
              >
              Подключи MetaMask для старта
              </button>


              <div className="tutorial-container">
                <h1>Новичек? 🐣</h1>
                <ol>
                  <li><a className="footer-text" href="https://metamask.io/" target="_blank">Установи кошелек MetaMask</a>. Ты получишь уникальный адрес - это считай твой номер карты. На нем ты будешь хранить ETH, игровые NFT и другие токены.</li>
                  <li><a className="footer-text " href="https://devtonight.com/posts/metamask-testnet-wallet-setup-for-blockchain-development" target="_blank">Включи тест-сеть Rinkeby в Metamask</a>. Благодаря ней игра стоит только тестового эфира, а не реального.</li>
                  <li><a className="footer-text " href="https://faucets.chain.link/rinkeby" target="_blank">Получи тестовый ETH</a>. Это бесплатно. Вставь публичный адрес кошелька на сайте.</li>
                </ol>
                
                Теперь ты в Крипте! 😎 После этих шагов у тебя есть кошелек с деньгами для хранения NFT и проведения транзакций.
              </div>
          </div>
      </React.Fragment>);
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT}  setCharacterNFT={setCharacterNFT} />
    }
  };

  const checkIsWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you connected MetaMask');
          setIsLoading(false);
        return;
      } else {
        console.log('We have connection!', ethereum);

        const accounts = await ethereum.request(
          {method: 'eth_accounts'}
        );

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log('Found active account:', account);
            setCurrentAccount(account);
        } else {
          console.log('No active accounts found');
        }
      }
    } catch (e) {
      console.log(e);
    }

    setIsLoading(false);
  }

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      console.log('Connected:', accounts[0]);
      setCurrentAccount(accounts[0]);
     } catch (e) {
       console.log(e);
     }
  }

  useEffect(() => {
      setIsLoading(true);
      checkIsWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking NFT for address: ', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      
      if (txn.name) {
        console.log('User has Character NFT:', txn.name);
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No Character NFT found');
      }

      setIsLoading(false);
    }

    if (currentAccount) {
      console.log('Current Account: ', currentAccount);
      fetchNFTMetadata();
    }

  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Уничтожь Империю Скинов ⚔️</p>
          
          {renderContent()}
        </div>
        <div className="footer-container">
          <br/>
          <div className="footer-text">
            Hey Jojo, built by @krutovoy
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
