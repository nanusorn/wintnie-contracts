// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract Bank {
    using SafeMath for uint256;

    string public name = "Banking";

    // dictionary that maps address to balances
    mapping (address => uint256) private balances;
    // Users in the system
    address[] accounts;
    // Interest rate
    uint256 interestRate = 2;

    address public owner;
    address public dealer;

    // Events
    event DepositMode(address indexed account, uint amount);
    event WithdrawMade(address indexed account, uint amount);
    event SystemWithdrawMade(address indexed account, uint amount);
    event SystemDepositMode(address indexed account, uint amount);

    // run only once when deploy the contract
    constructor() {
        owner = msg.sender;
    }

    function setDealer(address newDealer) public {
        dealer = newDealer;
    }

    function deposit() public payable returns (uint256) {
        // Record account into array
        if (0 == balances[msg.sender]) {
            accounts.push(msg.sender);
        }

        balances[msg.sender] = balances[msg.sender].add(msg.value);

        emit DepositMode(msg.sender, msg.value);
        return balances[msg.sender];
    }

    function withdraw(uint amount) public payable returns (uint256) {
        require(balances[msg.sender] >= amount, "Balance is not enough");
        balances[msg.sender] = balances[msg.sender].sub(amount);

        // Send money back to user
        payable(msg.sender).transfer(amount);

        // emit event
        emit WithdrawMade(msg.sender, msg.value);

        return balances[msg.sender];
    }

    function systemBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function userBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    //--------------------------------------
    //Admin section
    //--------------------------------------
    function systemWithdraw(uint amount) public {
        require(owner == msg.sender, "Your are not authorized");
        require(systemBalance() >= amount, "System balance is not enough");

        // send money back to user, revert if failed.
        payable(msg.sender).transfer(amount);

        // broadcast event
        emit SystemWithdrawMade(msg.sender, amount);
    }

    function systemDeposit() public payable {
        require(owner == msg.sender, "Your are not authorized");

        //Broadcast event system deposit
        emit SystemDepositMode(msg.sender, msg.value);
    }

    function calculateInterest(address user) private view returns (uint256) {
        uint256 interest = (balances[user].mul(interestRate.add(100)).div(100)).sub(balances[user]);
        return interest;
    }

    function totalInterestPerYear() external view returns (uint256) {
        uint256 total = 0;
        // need to improve by remove for loop
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            uint256 interest = calculateInterest(account);
            total = total.add(interest);
        }
        return total;
    }

    function payDividendsPerYear() public payable {
        require(owner == msg.sender, "You are not authorized");
        uint256 totalInterest = 0;
        // need to improve by remove for loop
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            uint256 interest = calculateInterest(account);
            balances[account] = balances[account].add(interest);
            totalInterest = totalInterest.add(interest);
        }
        require(msg.value == totalInterest, "Not enough interest to pay!");
    }

    //--------------------------------------
    function getName() public view returns (string memory) {
        return name;
    }

    function getNumber(uint a) public pure returns (uint256) {
        return a + 5;
    }
    //--------------------------------------
}