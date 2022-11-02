import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { set } from '@project-serum/anchor/dist/cjs/utils/features';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
	'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
	'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
	'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
	'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp'
]

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputText, setInputText] = useState("")
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    // We're using optional chaining (question mark) to check if the object is null
      if (window?.solana?.isPhantom) {
        console.log('Phantom wallet found!');
        const response = await window.solana.connect({ onlyIfTrusted: true });
    console.log(
      'Connected with Public Key:',
      response.publicKey.toString()
    );
    setWalletAddress(response.publicKey.toString());
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    };

    const connectWallet = async () => {
      const { solana } = window;
    
      if (solana) {
        const response = await solana.connect();
        console.log('Connected with Public Key:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      }
    };
    const renderNotConnectedContainer = () => (
      <button
        className="cta-button connect-wallet-button"
        onClick={connectWallet}
      >
        Connect to Wallet
      </button>
    );

    const handleChange = (event) => {
      setInputText(event.target.value)
    }
    const sendGif = async () => {
      if (inputText.length > 0) {
        console.log('Gif link:', inputText);
        setGifList([...gifList, inputText]);
      } else {
        console.log('Empty input. Try again.');
      }
    };

    const renderConnectedContainer = () => (
      <div className="connected-container">
        <form
          onSubmit={(event) => {
          event.preventDefault();
          sendGif();
        }}
        >
      <input type="text" onChange={handleChange} placeholder="Enter gif link!" />
      <button type="submit" className="cta-button submit-gif-button">Submit</button>
    </form>
        <div className="gif-grid">
          {gifList.map(gif => (
            <div className="gif-item" key={gif}>
              <img src={gif} alt={gif} />
            </div>
          ))}
        </div>
      </div>
    );

    useEffect(() => {
      const onLoad = async () => {
        await checkIfWalletIsConnected();
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }, []);

    useEffect(() => {
      if (walletAddress) {
        console.log('Fetching GIF list...');
        
        // Call Solana program here.
    
        // Set state
        setGifList(TEST_GIFS);
      }
    }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 Squid Game Memes</p>
          <p className="sub-text">
            The metaverse is netaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
