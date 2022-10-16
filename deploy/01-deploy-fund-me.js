// 10:15

const { network } = require("hardhat");
const {
    developmentChains,
    networkConfig
} = require("../helper-hardhat-config");
const verify = require("../utils/verify");

const args = [];
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(chainId.toString())) {
        const ethUsdAggrgator = await get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggrgator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPricefeed"];
    }

    console.log("***ethUsdPriceFeedAddress", ethUsdPriceFeedAddress);
    // Mock contract for local testing
    args.push(ethUsdPriceFeedAddress);
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //constructor arguments (will be the preffered address)
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    });

    log();
    if (
        !developmentChains.includes(network.config.chainId.toString()) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress]);
    }
    log("------------------------------------------------------------");
};

module.exports.tags = ["all", "fundMe"];
