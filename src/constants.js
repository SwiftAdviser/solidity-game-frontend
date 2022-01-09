const CONTRACT_ADDRESS = '0x961C61a085d3F7234657eD49Bc27eeCA36cb051D';

const transformCharacterData = (data) => {
  let character = {
      name: data.name,
      imageURI: data.imageURI,
      hp: data.hp.toNumber(),
      maxHp: data.maxHp.toNumber(),
      attackDamage: data.attackDamage.toNumber()
  }

  if (data.respawnIn) {
    character.respawnIn = data.respawnIn.toNumber()
  }

  return character
}

export { CONTRACT_ADDRESS, transformCharacterData };