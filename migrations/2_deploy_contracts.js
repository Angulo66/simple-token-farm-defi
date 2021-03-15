const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {
  // Deploy Mock DAI Token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  // Deploy Dapp Token
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  // Deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')
  // Transfer all DappToken to TokenFarm (1 million supply + 18 decimal places)
  /*
  console:
  DAPP = await DappToken.deployed()
  accounts = await web3.eth.getAccounts()
  balance = await DAPP.balanceOf(accounts[0])
  */

  await daiToken.transfer(accounts[1], '100000000000000000000')
    // Transfer 100 Mock DAI Tokens to investor
  /*
  console:
  mDAI = await DaiToken.deployed()
  ...
  ... mDAI.balanceOf(accounts[1])
  */

}


