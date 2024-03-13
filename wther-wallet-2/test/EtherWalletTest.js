const { assert } = require('chai');
// const { ethers } = require('hardhat');
const { expectRevert } = require('@openzeppelin/test-helpers');

describe('EtherWallet', function () {
  let EtherWallet;
  let etherWallet;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    EtherWallet = await ethers.getContractFactory('EtherWallet');
    etherWallet = await EtherWallet.deploy();
    await etherWallet.deployed();
  } );
  

  it('Should transfer ether to the owner when withdrawing', async function () {
    const initialBalance = await ethers.provider.getBalance(owner.address);
    const amount = ethers.utils.parseEther('1.0');
    await etherWallet.connect(addr1).deposit({ value: amount });
    await etherWallet.withdraw(amount);
    const finalBalance = await ethers.provider.getBalance(owner.address);
    assert.isTrue(finalBalance.gt(initialBalance), 'Ether not transferred to owner');
  });

  it('Should revert if caller is not owner', async function () {
    const amount = ethers.utils.parseEther('1.0');
    await etherWallet.connect(addr1).deposit({ value: amount });
    await expectRevert(
      etherWallet.connect(addr2).withdraw(amount),
      'caller is not owner'
    );
  });

  it('Should return correct contract balance', async function () {
    const amount = ethers.utils.parseEther('1.0');
    await etherWallet.connect(addr1).deposit({ value: amount });
    const balance = await etherWallet.getBalance();
    assert.equal(balance.toString(), amount.toString(), 'Incorrect contract balance');
  });


  it('Should set owner correctly upon deployment', async function () {
    const contractOwner = await etherWallet.owner();
    assert.equal(contractOwner, owner.address, 'Owner not set correctly');
  });
});