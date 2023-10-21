//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

struct Tier {
	uint unitsPerWeek;
	uint pricePerWeek;
	bool isActivelyOffered;
}

contract SubscryptoToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {

	// State Variables
	string public greeting = "Building Unstoppable Apps!!!";
	bool public premium = false;
	uint256 public totalCounter = 0;
	// mapping(address => uint) public freeBalances; //commented out b/c ERC20 covers it
	mapping(/*merchant*/ address => mapping(/*customer*/ address => uint)) public serviceDeposits;
	mapping(/*merchant*/ address => Tier[]) public tiers;

	event TierAdded(
		address indexed merchant,
		uint tierIndex,
		uint unitsPerWeek;
		uint pricePerWeek;
		bool isActivelyOffered;
	);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address initialOwner)
		ERC20("SubscriptoToken", "SSCO")
		Ownable(initialOwner)
		ERC20Permit("SubscriptoToken")
	{}

	function mint(address to, uint256 amount) public onlyOwner {
		_mint(to, amount);
	}

	// Modifier: used to define a set of rules that must be met before or after a function is executed
	// Check the withdraw() function
	modifier isOwner() {
		// msg.sender: predefined variable that represents address of the account that called the current function
		require(msg.sender == owner, "Not the Owner");
		_;
	}

	function addTier(
		uint tierIndex,
		uint unitsPerWeek;
		uint pricePerWeek;
		bool isActivelyOffered;
	) public {
		tiers[msg.sender].push(Tier({
			unitsPerWeek: unitsPerWeek,
			pricePerWeek: pricePerWeek,
			isActivelyOffered;
		}));
		emit TierAdded(
			msg.sender,
			tiers.length,
			unitsPerWeek;
			pricePerWeek;
			isActivelyOffered;
		);
	}

	/**
	 * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
	 *
	 * @param _newGreeting (string memory) - new greeting to save on the contract
	 */
	function setGreeting(string memory _newGreeting) public payable {
		// Print data to the hardhat chain console. Remove when deploying to a live network.
		console.log(
			"Setting new greeting '%s' from %s",
			_newGreeting,
			msg.sender
		);

		// Change state variables
		greeting = _newGreeting;
		totalCounter += 1;

		// msg.value: built-in global variable that represents the amount of ether sent with the transaction
		if (msg.value > 0) {
			premium = true;
		} else {
			premium = false;
		}
	}

	/**
	 * Function that allows the owner to withdraw all the Ether in the contract
	 * The function can only be called by the owner of the contract as defined by the isOwner modifier
	 */
	function withdraw() public isOwner {
		(bool success, ) = owner.call{ value: address(this).balance }("");
		require(success, "Failed to send Ether");
	}

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}
