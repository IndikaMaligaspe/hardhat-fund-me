const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", async function() {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    const startValue = ethers.utils.parseEther("1"); // 1 ETH
    beforeEach(async function() {
        // -----------Can also use
        // const accounts = await ethers.getSigners();
        // const accountZeero = accounts[0];
        //-----------
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("constructor", async function() {
        it("sets the aggregator address correctly ", async function() {
            const response = await fundMe.getPricefeed();
            assert.equal(response, mockV3Aggregator.address);
        });
    });

    describe("fund", async function() {
        it("Fails if you do not send enough ETH", async function() {
            await expect(fundMe.fund()).to.be.reverted;
        });
        it("Passes if amount funded are provided", async function() {
            await fundMe.fund({ value: startValue });
            const response = await fundMe.getAddressToAmountFunded(
                mockV3Aggregator.address
            );
            assert(response, startValue);
        });
        it("Add funder to funders in contract", async function() {
            await fundMe.fund({ value: startValue });
            const funder = await fundMe.getFunder(0);
            assert(funder, deployer);
        });
    });
    describe("Withdraw", async function() {
        beforeEach(async function() {
            await fundMe.fund({ value: startValue });
        });

        it("Can withdraw ETH from single funder", async function() {
            const startingFunderBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingdeployerBalance = await fundMe.provider.getBalance(
                deployer
            );
            const transactionResponse = await fundMe.withdraw();
            const transactionReciept = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReciept;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFunderBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            assert.equal(endingFunderBalance, 0);
            assert.equal(
                startingFunderBalance.add(startingdeployerBalance).toString(),
                endingDeployerBalance.add(gasCost)
            );
        });

        it("Can widraw from multiple accounts", async function() {
            // Arrange
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
                const accountToFundFrom = await fundMe.connect(accounts[i]);
                await accountToFundFrom.fund({ value: startValue });
            }
            const startingFunderBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingdeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReciept = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReciept;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            assert.equal(
                startingFunderBalance.add(startingdeployerBalance).toString(),
                endingDeployerBalance.add(gasCost)
            );

            await expect(fundMe.getFunder(0)).to.be.reverted;

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                );
            }
        });

        it("Only owner can withdraw", async function() {
            const accounts = await ethers.getSigners();
            const fundMeConnectedContract = await fundMe.connect(accounts[1]);
            await expect(fundMeConnectedContract.withdraw()).to.be.reverted;
        });
    });
});
