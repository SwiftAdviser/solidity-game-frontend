import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from '../LoadingIndicator';

const Arena = ({characterNFT, setCharacterNFT}) => {
  const [gameContract, setGameContract] = useState(null);

  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [showToast, setShowToast] = useState(false);

  // UseEffects
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

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBoss();
      console.log('Boss:', bossTxn);

      setBoss(transformCharacterData(bossTxn));
    }

    const onAttackComplete = async (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();

      console.log(`New Boss HP: ${bossHp}, new Player HP: ${playerHp}`);

      setBoss((prevState) => {
        return {...prevState, hp: bossHp};
      })

      setCharacterNFT((prevState) => {
          return {...prevState, hp: playerHp}
      });
      
    }

    if (gameContract) {
      fetchBoss();
      gameContract.on('AttackComplete', onAttackComplete);
    }

    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackComplete);
      }
    }
  }, [gameContract]);

  const runAttackAction = async () => {
    try {

      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking boss...');

        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log('Attack Txn: ', attackTxn);

        setAttackState('hit');

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }

    } catch (e) {
      console.error('Error attacking boss:', e);
      setAttackState('');
    }
  }

  const renderAttackBlock = () => {
    const respawnIn = characterNFT.respawnIn;
    const now = Math.floor(Date.now() / 1000);
    console.log('Respawn In', new Date(respawnIn * 1000));
    console.log('Now', new Date(now * 1000));
    console.log('diff', (now - respawnIn));
    if (respawnIn > now) {
      return <p>Вы умерли</p>;
    } 
    // TODO написать кнопку возрождения

    return <button className="cta-button"
            onClick={runAttackAction}
            >💥 Атаковать {boss.name}
            </button>;
  }

  return (
    <div className="arena-container">
    {boss && characterNFT && (
      <div id="toast" className={showToast ? 'show' : ''}>
        <div id="desc">{`💥 ${boss.name} получил ${characterNFT.attackDamage} урона!`}</div>
      </div>
    )}
      {/* Boss */}
    {boss && (
      <div className="boss-container">
        <div className={`boss-content ${attackState}`}>
          <h2>🔥 {boss.name} 🔥</h2>
          <div className="image-content">
            <img src={boss.imageURI} />
            <div className="health-bar">
              <progress value={boss.hp} max={boss.maxHp} />
              <p>{boss.hp} / {boss.maxHp} HP</p>
            </div>
          </div>
        </div>
        <div className="attack-container">
          {renderAttackBlock()}
        </div>
        {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator />
          <p>Атакуем! ⚔️</p>
        </div>
      )}
      </div>
    )}

      {/* Character NFT */}
      {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>Твой персонаж</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.imageURI}
                alt={`Герой ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`⚔️ Атака: ${characterNFT.attackDamage}`}</h4>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default Arena;