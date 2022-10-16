const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPricefeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    }
    // 31337: {
    //     name: "hardhat",
    //     ethUsdPricefeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    // }
};

const developmentChains = ["31337", "localhost"];

const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
    developmentChains,
    networkConfig,
    DECIMALS,
    INITIAL_ANSWER
};
