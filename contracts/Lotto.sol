// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract Lotto {

    address private bank;

    struct BettingLotto {
        uint    sessionID;      // Session id, sequence from 1
        string  target;         // target is a number of betting, verify by bettype
        uint    betType;        // bet type, 3 number above, 2 number below etc.
        uint256 value;          // value of betting
        uint    bettingDate;    // betting date
        bool    isDrawResult;   // is the session draw the result
    }

    mapping (address => BettingLotto) bettingLottos;
    address[] public bettingAccount;
    uint256 currentSessionID;

    constructor(address bankAddress) {
        bank = bankAddress;
        currentSessionID = 1;
    }

//    function setPlayerAccount(
//        string  target,
//        uint    betType,
//        uint256 value,
//        uint    bettingDate
//    ) public payable returns (bool) {
//
//        var bettingLotto = bettingLottos[msg.sender];
//        bettingLotto.sessionID = currentSessionID;
//        bettingLotto.target = target;
//        bettingLotto.betType = betType;
//        bettingLotto.value = msg.value;
//        bettingLotto.bettingDate = now;
//        bettingLotto.isDrawResult = false;
//
//        bettingAccount.push(msg.sender) -1;
//
//        return true;
//    }

//    function getPayerAccount() public view returns (address[]) {
//        return bettingAccount;
//    }

}