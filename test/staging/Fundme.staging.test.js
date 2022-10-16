const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

const {
    developmentChains,
    networkConfig
} = require("../../helper-hardhat-config");

const chainId = network.config.chainId;

!developmentChains.includes(chainId.toString())
    ? describe("Fund me on test net", async function() {
          let deployer;
          let fundMe;
          const sendValue = ethers.utils.parseEther("0.1");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async function() {
              const fundTxResponse = await fundMe.fund({ value: sendValue });
              await fundTxResponse.wait(1);
              const withdrawTxResponse = await fundMe.withdraw();
              await withdrawTxResponse.wait(1);

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal..."
              );
              assert.equal(endingFundMeBalance.toString(), "0");
          });
      })
    : describe.skip;
