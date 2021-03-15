pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    address[] public stakers;
    mapping (address => uint) public stakingBalance; // Get staking balance from address
    mapping (address => bool) public hasStaked;
    mapping (address => bool) public isStaking;
 
    // once DappToken & DaiToken are deployed we take theres addresses and add them as parameters to the constructor
    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // Staking Tokens 
    function stakeTokens (uint _amount) public {
        require(_amount > 0, "amount cannot be 0");
        // Transfer Mock DAI Tokens to this contract for staking
        daiToken.transferFrom((msg.sender), address(this), _amount); // msg global variable in solidity 

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add users to stakers list *only* if they have not staked
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender); 
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true; 
    }

    // Unstaking Tokens
    function unstakeTokens () public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, 'Staking balance cannot be 0');
        daiToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    // Issuing Tokens
    function issueTokens () public {
        require(msg.sender == owner, 'Caller must be the owner!');
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance); // 1 / 1 Dai to Dapp Token
            }
        }
    }
}