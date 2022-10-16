// Get funds from users
// withdraw funds
// set minimum funding in USD

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__NotSuccess();
error FundMe__NotEnoughGass();

/** @title A contract for crow funding
 *  @author Indika Maligaspe
 *  @notice A demo contract for sample funding contracts
 *  @dev Implement orice feed as a library
 */
contract FundMe {
    using PriceConverter for uint256;

    // State variables
    uint256 public constant MINIMU_USD = 50 * 1e18;
    address private immutable i_owner;

    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Sender is not the owner");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /** @notice fund function to fund us
     *  @dev minimum funds set using getConversionRate
     */
    function fund() public payable {
        // set minimum fund amount in USD
        if (msg.value.getConversionRate(s_priceFeed) < MINIMU_USD) {
            revert FundMe__NotEnoughGass();
        }
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // creating a new memory structure to save gas cost as reading / writing to storage costs GAS
        address[] memory m_funders = s_funders;
        // Note: mappings can not be in memory !!!

        for (
            uint256 funderIndex = 0;
            funderIndex < m_funders.length;
            funderIndex++
        ) {
            address funder = m_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        // withdrwing funds can be done in three ways
        // using "transfer" (uses 2300 gas and fails on error)

        // payable(msg.sender).transfer(address(this).balance);

        // using "send" (uses 2300 gas and returns boolean true / false)

        // bool sendSucess = payable(msg.sender).send(address(this).balance);
        // require(sendSucess, "Send Faild");

        // using low level "call"
        (bool callSucess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        // require(callSucess, "call Faild");
        if (!callSucess) {
            revert FundMe__NotSuccess();
        }
    }

    function getPricefeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[fundingAddress];
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }
}
