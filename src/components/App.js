import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    //const web3 = window.Web3
    let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId();

    // Load Dai Token contract
    const daiTokenData = DaiToken.networks[networkId]
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account.toString()).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
      console.log('mDai balance:')
      console.log(web3.utils.fromWei(daiTokenBalance, 'Ether'))
    } else {
      window.alert('DaiToken contract not deployed to detected network!')
    }

    // Load DappToken contract
    const dappTokenData = DappToken.networks[networkId]
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account.toString()).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
      console.log('Dapp balance')
      console.log(web3.utils.fromWei(dappTokenBalance, 'Ether'))
    } else {
      window.alert('DappToken contract not deployed to detected network!')
    }

    // Load TokenFarm contract
    const tokenFarmData = TokenFarm.networks[networkId]
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account.toString()).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
      console.log('Staking balance')
      console.log(web3.utils.fromWei(stakingBalance, 'Ether'))
    } else {
      window.alert('TokenFarm contract not deployed to detected network!')
    }
    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account })
          .on('transactionHash', (hash) => {
            this.setState({ loading: false })
          })
      })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
  }

  render() {
    let content
    if (this.state.loading) {
      content = <p id='loader' className='text-center'>Loading...</p>
    } else {
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }
    return (
      <div>
        <h1>Token Farm</h1>
        <Navbar account={this.state.account} />

        <div className='container-fluid mt-5'>
          <div className='row'>
            <main role='main' className='col-lg-12 ml-auto mr-auto' style={{ maxWidth: '600px' }}>
              <div className='content mr-auto ml-auto'>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

}

export default App;
