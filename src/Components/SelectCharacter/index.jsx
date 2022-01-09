import React, {useEffect, useState} from 'react';
import './SelectCharacter.css';
import {CONTRACT_ADDRESS, transformCharacterData} from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import { ethers } from 'ethers';
import LoadingIndicator from '../LoadingIndicator';

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);
  
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      console.log('Game contract loaded');
      setGameContract(gameContract);
    } else {
      console.log('Ethereum contract not found');
    }
  }, []);

  useEffect(() => {

    const getCharacters = async () => {
      try {
        console.log('Getting characters to mint');

        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log(charactersTxn);

        const characters = charactersTxn.map((characterData) => transformCharacterData(characterData)
        );

        setCharacters(characters);
      } catch(e) {
        console.error('Error fetching characters: ', e);
      } 
    }

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
      `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
    );

      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);

        setCharacterNFT(transformCharacterData(characterNFT));

        alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`)
      }
    }

    if (gameContract) {
      getCharacters();
      
      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off('CharacterNFTMinted');
      }
    }

  }, [gameContract]);

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        console.log('Minting character...');
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);
        setMintingCharacter(false);
      }
    } catch (e) {
      console.error('Error minting character:', e);
      setMintingCharacter(false);
    }
  }

  const renderCharacters = () => characters.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>{character.name}</p>
        <small>({character.maxHp} HP / {character.attackDamage} DMG)</small>
      </div>
      <img src={character.imageURI} alt={character.name} />
      <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)}
        >
        {`Выбрать ${character.name}`}
        </button>
    </div>
  ));
 // TODO https://c.tenor.com/tIAHsEeMQNAAAAAC/beard-glittery.gif
  return (
    <div className="select-character-container">
      <h2>Создай своего Героя. Выбирай мудро.</h2>
      {characters.length > 0 && (
        <div className="character-grid">
          {renderCharacters()}
        </div>
      )}
      {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>Чеканим Героя в блокчейне...</p>
        </div>
        <img
          src="https://media.giphy.com/media/thNsW0HZ534DC/giphy.gif"
          alt="Чеканим Героя в блокчейне"
        />
      </div>
    )}
    </div>
  );
};

export default SelectCharacter;