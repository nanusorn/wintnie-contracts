import { expect } from "chai";
import { ethers } from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {Bank} from "../typechain";

describe("Bank", function () {
    let owner: SignerWithAddress;
    let dealer: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let bank: Bank;

    beforeEach( async () => {
        [owner, dealer, addr1, addr2] = await ethers.getSigners();
        const Bank = await ethers.getContractFactory("Bank");
        bank = await Bank.deploy();
        await bank.deployed();
        await bank.setDealer(dealer.address);
    })

    it("Should return name", async function () {
        expect(await bank.getName()).to.equal("Banking");
    });

    it("Should return 10 when a = 5", async function () {
        expect(await bank.getNumber(5)).to.equal(10);
    });

    it("Owner should be the same address of deployer", async function() {
        expect(await bank.owner()).to.equal(owner.address);
    });

    it("Set dealer address and dealer should be dealer", async function() {
        expect(await bank.dealer()).to.equal(dealer.address);
    });

    it("Deposite 100 the balances should have 100", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).userBalance()).to.equal(ethers.utils.parseEther(("100")));
    });

    it("Withdraw 50 the balances should have 50 left", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).userBalance()).to.equal(ethers.utils.parseEther(("100")));
        expect(await bank.connect(addr1).withdraw(ethers.utils.parseEther("50"))).to.emit(bank, "WithdrawMade");
        expect(await bank.connect(addr1).userBalance()).to.equal(ethers.utils.parseEther(("50")));
    });

    it("addr1 deposit 100, withdraw 110 should error", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).systemBalance()).to.equal(ethers.utils.parseEther(("100")));
        await expect(bank.connect(addr1).withdraw(ethers.utils.parseEther("110"))).to.be.revertedWith("Balance is not enough");
    });

    it("addr1 deposit 100, system balance should have 100, addr1 withdraw 30, system balance should have 70 left", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).systemBalance()).to.equal(ethers.utils.parseEther(("100")));
        expect(await bank.connect(addr1).withdraw(ethers.utils.parseEther("30"))).to.emit(bank, "WithdrawMade");
        expect(await bank.connect(addr1).systemBalance()).to.equal(ethers.utils.parseEther(("70")));
    });

    it("addr1 deposit 100, addr1 should not be able to withdraw", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).systemBalance()).to.equal(ethers.utils.parseEther("100"));
        await expect(bank.connect(addr1).systemWithdraw(ethers.utils.parseEther("1"))).to.be.revertedWith("Your are not authorized");
    });

    it("addr1 deposit 100, admin withdraw 200, should revert", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).systemBalance()).to.equal(ethers.utils.parseEther("100"));
        await expect(bank.systemWithdraw(ethers.utils.parseEther("200"))).to.be.revertedWith("System balance is not enough")
    });

    it("addr1 deposit 100, admin withdraw 50, system balance should have 50 left", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).systemBalance()).to.equal(ethers.utils.parseEther("100"));
        expect(await bank.systemBalance()).to.equal(ethers.utils.parseEther("100"))
        const balance = await bank.systemWithdraw((ethers.utils.parseEther("50")))
        expect(await bank.systemBalance()).to.equal(ethers.utils.parseEther("50"))
    });

    it("addr1 deposit 100, addr2 deposit 50, system withdraw 100, system balance should have 50 left", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).systemBalance()).to.equal(ethers.utils.parseEther("100"));
        expect(await bank.connect(addr2).deposit({value: ethers.utils.parseEther("50")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr2).systemBalance()).to.equal(ethers.utils.parseEther("150"));
        expect(await bank.systemBalance()).to.equal(ethers.utils.parseEther("150"))
        await bank.systemWithdraw((ethers.utils.parseEther("100")))
        expect(await bank.systemBalance()).to.equal(ethers.utils.parseEther("50"))
        expect(await bank.connect(addr1).userBalance()).to.equal(ethers.utils.parseEther(("100")));
        expect(await bank.connect(addr2).userBalance()).to.equal(ethers.utils.parseEther(("50")));
    });

    it("addr1 deposit 100, addr2 deposit 50, system withdraw 100, addr1 try withdraw 100 should error ", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).systemBalance()).to.equal(ethers.utils.parseEther("100"));
        expect(await bank.connect(addr2).deposit({value: ethers.utils.parseEther("50")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr2).systemBalance()).to.equal(ethers.utils.parseEther("150"));
        expect(await bank.systemBalance()).to.equal(ethers.utils.parseEther("150"))
        await bank.systemWithdraw((ethers.utils.parseEther("100")))
        expect(await bank.systemBalance()).to.equal(ethers.utils.parseEther("50"))

        await expect(bank.connect(addr1).withdraw(ethers.utils.parseEther("100"))).to.be.reverted;

    });

    it("addr1 try withdraw 100 but balance sufficient, so system need deposit back 50 ", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr1).systemBalance()).to.equal(ethers.utils.parseEther("100"));
        expect(await bank.connect(addr2).deposit({value: ethers.utils.parseEther("50")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr2).systemBalance()).to.equal(ethers.utils.parseEther("150"));
        expect(await bank.systemBalance()).to.equal(ethers.utils.parseEther("150"))
        await bank.systemWithdraw((ethers.utils.parseEther("100")))
        expect(await bank.systemBalance()).to.equal(ethers.utils.parseEther("50"))
        await expect(bank.connect(addr1).withdraw(ethers.utils.parseEther("100"))).to.be.reverted;

        expect(await bank.systemDeposit(({value: ethers.utils.parseEther("50")})));
        await bank.connect(addr1).withdraw(ethers.utils.parseEther("100"));
        expect(await bank.systemBalance()).to.equal(ethers.utils.parseEther("0"));
    });

    it("addr1 has 100 addr2 has 200, interest perYear should return correctly", async function() {
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr2).deposit({value: ethers.utils.parseEther("200")})).to.emit(bank, "DepositMode");
        expect(await bank.totalInterestPerYear()).to.equal(ethers.utils.parseEther("6"));
    });

    it("addr1 has 100 addr2 has 200, system should not transfer dividend per year correctly because of insufficient balance", async function() {
        // start up owner's balance
        expect(await bank.connect(addr1).deposit({value: ethers.utils.parseEther("100")})).to.emit(bank, "DepositMode");
        expect(await bank.connect(addr2).deposit({value: ethers.utils.parseEther("200")})).to.emit(bank, "DepositMode");
        await expect(bank.payDividendsPerYear()).to.be.revertedWith("Not enough interest to pay!");
    });
});