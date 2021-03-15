const { assert } = require('chai')

const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
  // Write tests here
  let daiToken, dappToken, tokenFarm

  // Using before to let recreate a actual contract migration
  before(async () => {
    // Load contracts
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    // Transfer all dapp tokens to TokenFarm
    await dappToken.transfer(tokenFarm.address, tokens('1000000')) // 1mil

    // Send tokens to investor 
    await daiToken.transfer(investor, tokens('100'), { from: owner })
  })

  describe('Mock DAI deployment', async () => {
    it('has a name', async () => {
      //let daiToken = await DaiToken.new()
      const name = await daiToken.name()
      assert.equal(name, 'Mock DAI Token')
    })
  })

  describe('DApp deployment', async () => {
    it('has a name', async () => {
      //let daiToken = await DaiToken.new()
      const name = await dappToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('Dapp Token Farm', async () => {
    it('has a name', async () => {
      //let daiToken = await DaiToken.new()
      const name = await tokenFarm.name()
      assert.equal(name, 'Dapp Token Farm')
    })
  })

  it('contract has tokens', async () => {
    let balance = await dappToken.balanceOf(tokenFarm.address)
    assert.equal(balance.toString(), tokens('1000000'))
  })

  describe('Farming tokens', async () => {
    it('rewards investors for staking mDai Tokens', async () => {
      let result
      result = await daiToken.balanceOf(investor)
      // Check investor balance
      assert.equal(result.toString(), tokens('100'), 'Investor Mock DAI wallet correct before staking')
      // Aprove DAI Tokens for staking
      await daiToken.approve(tokenFarm.address ,tokens('100'), {from : investor})
      // Sake mock DAI Tokens
      await tokenFarm.stakeTokens(tokens('100'), {from : investor})
      // Check staking results
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokens('0'), 'Investor Mock DAI wallet balance correct after staking')

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI wallet balance correct after staking')

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(), tokens('100'), 'Investor staking balance correct after staking')

      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(), 'true', 'Investor staking status correct after staking')

      // Issue tokens
      await tokenFarm.issueTokens({ from: owner })
      
      // Check balance after issue
      result = await dappToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'Investor DApp Token wallet balance correct after issuing tokens')

      // Ensure only owner can issue tokens
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected

      // Unstake tokens
      await tokenFarm.unstakeTokens({ from: investor })

      // Check results after unstaking tokens
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')

      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
    })
  })

})