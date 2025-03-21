import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import {
  Program, Provider, web3
} from '@project-serum/anchor';
import kp from './keypair.json'


// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// This is the address of your solana program, if you forgot, just run solana address -k target/deploy/myepicproject-keypair.json
const programID = new PublicKey("2svzVCpgRRpcthnBuSgziNuniVKTWprNB8qDrfPp1rnd");

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

// All your other Twitter and GIF constants you had.

// Constants
const TWITTER_HANDLE = 'hippo__alpha';
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
  const [gifList, setGifList] = useState(TEST_GIFS);

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

    const getProvider = () => {
      const connection = new Connection(network, opts.preflightCommitment);
      const provider = new Provider(
        connection, window.solana, opts.preflightCommitment,
      );
      return provider;
    }

    const createGifAccount = async () => {
      try {
        const provider = getProvider();
        const program = await getProgram();
        
        console.log("ping")
        await program.rpc.startStuffOff({
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [baseAccount]
        });
        console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
        await getGifList();
    
      } catch(error) {
        console.log("Error creating BaseAccount account:", error)
      }
    }

    const getProgram = async () => {
      // Get metadata about your solana program
      const idl = await Program.fetchIdl(programID, getProvider());
      // Create a program that you can call
      return new Program(idl, programID, getProvider());
    };
    
    const getGifList = async() => {
      try {
        const program = await getProgram(); 
        const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
        
        console.log("Got the account", account)
        setGifList(account.gifList)
    
      } catch (error) {
        console.log("Error in getGifList: ", error)
        setGifList(null);
      }
    }
    
    useEffect(() => {
      if (walletAddress) {
        console.log('Fetching GIF list...');
        getGifList()
      }
    }, [walletAddress]);

    const sendGif = async () => {
      if (inputText.length === 0) {
        console.log("No gif link given!")
        return
      }
      setInputText('');
      console.log('Gif link:', inputText);
      try {
        const provider = getProvider()
        const program = await getProgram(); 
    
        await program.rpc.addGif(inputText, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log("GIF successfully sent to program", inputText)
    
        await getGifList();
      } catch (error) {
        console.log("Error sending GIF:", error)
      }
    };
    /* const sendGif = async () => {
      if (inputText.length > 0) {
        console.log('Gif link:', inputText);
        setGifList([...gifList, inputText]);
      } else {
        console.log('Empty input. Try again.');
      }
    }; */

    const renderConnectedContainer = () => {
      // If we hit this, it means the program account hasn't been initialized.
        if (gifList === null) {
          return (
            <div className="connected-container">
              <button className="cta-button submit-gif-button" onClick={createGifAccount}>
                Do One-Time Initialization For GIF Program Account
              </button>
            </div>
          )
        } 
        // Otherwise, we're good! Account exists. User can submit GIFs.
        else {
          return(
            <div className="connected-container">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendGif();
                }}
              >
                <input
                  type="text"
                  placeholder="Enter gif link!"
                  value={inputText}
                  onChange={handleChange}
                />
                <button type="submit" className="cta-button submit-gif-button">
                  Submit
                </button>
              </form>
              <div className="gif-grid">
                {/* We use index as the key instead, also, the src is now item.gifLink */}
                {gifList.map((item, index) => (
                  <div className="gif-item" key={index}>
                    <img src={item.gifLink} />
                  </div>
                ))}
              </div>
            </div>
          )
        }
      }

    useEffect(() => {
      const onLoad = async () => {
        await checkIfWalletIsConnected();
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }, []);

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 DeMemes</p>
          <p className="sub-text">
            SBF is a spoiled kid ✨
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
