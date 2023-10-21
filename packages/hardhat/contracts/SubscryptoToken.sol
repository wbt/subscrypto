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

struct Subscription {
	uint tier; //tier index
	uint start; //seconds since 1/1/70 UTC
}

contract SubscryptoToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {

	// State Variables
	string public greeting = "Building Unstoppable Apps!!!";
	bool public premium = false;
	uint256 public totalCounter = 0;
	// mapping(address => uint) public freeBalances; //commented out b/c ERC20 covers it
	mapping(/*merchant*/ address => mapping(/*customer*/ address => uint)) public serviceDeposits;
	mapping(/*merchant*/ address => Tier[]) public tiersOffered;
	mapping(/*merchant*/ address => mapping(/*customer*/ address => Subscription)) public subscriptions;

	event TierAdded(
		address indexed merchant,
		uint tierIndex,
		uint unitsPerWeek,
		uint pricePerWeek,
		bool isActivelyOffered
	);

	event TierSelected(
		address indexed merchant,
		address indexed customer,
		uint tierIndex
	);

	event RevenueRealized(
		address indexed merchant,
		address indexed customer,
		uint amount
	);

	event TopUp(
		address indexed merchant,
		address indexed customer,
		uint amount
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

	function addTier(
		uint unitsPerWeek,
		uint pricePerWeek
		//This fn sets a default isActivelyOffered = true
	) public {
		addTier(unitsPerWeek, pricePerWeek, true);
	}

	/**
	 *  Called by a merchant to offer a way to pay for the merchant's services.
	 */
	function addTier(
		uint unitsPerWeek,
		uint pricePerWeek,
		bool isActivelyOffered
	) public {
		tiersOffered[msg.sender].push(Tier({
			unitsPerWeek: unitsPerWeek,
			pricePerWeek: pricePerWeek,
			isActivelyOffered: isActivelyOffered
		}));
		emit TierAdded(
			msg.sender,
			tiersOffered[msg.sender].length,
			unitsPerWeek,
			pricePerWeek,
			isActivelyOffered
		);
	}

	function topUpWithMerchant(
		address merchant,
		uint amount
	) public {
		topUpWithMerchant(
			merchant,
			msg.sender,
			amount,
		);
	}

	function topUpWithMerchant(
		address merchant,
		address customer,
		uint amount
	) private {
		require(balanceOf(customer) >= amount, 'Insufficient balance in Subscrypto contract.');
		_burn(customer, amount);
		serviceDeposits[merchant][customer] += amount;
		emit TopUp(
			merchant,
			msg.sender,
			amount
		);
	}

	/**
	 * Called by a customer to choose which tier to be in
	 * Set tierIndex = 0 to end subscription
	 */
	function setTier(
		address merchant,
		uint tierIndex
	) public {
		accountAtSubscriptionEnd(merchant, msg.sender);
		subscriptions[merchant][msg.sender] = Subscription({
			tier: tierIndex,
			start: block.timestamp
		});
		emit TierSelected(
			merchant,
			msg.sender,
			tierIndex
		);
	}

	function accountAtSubscriptionEnd(
		address merchant,
		address customer
	) private {
		uint dueToMerchant = amountDueToMerchant(merchant, customer);
		if(dueToMerchant > 0) {
			uint cappedToMerchant = min(dueToMerchant, serviceDeposits[merchant][customer]);
			serviceDeposits[merchant][customer] -= cappedToMerchant;
			_mint(merchant, cappedToMerchant);
			emit RevenueRealized(
				merchant,
				customer,
				cappedToMerchant
			);
		}
	}

	function amountDueToMerchant(
		address merchant,
		address customer
	) public view returns(uint) {
		uint tierIndex = subscriptions[merchant][customer].tier;
		if(tierIndex > 0) {
			uint tierRate = tiersOffered[merchant][tierIndex].pricePerWeek;
			uint timeAtRate = block.timestamp - subscriptions[merchant][customer].start;
			uint dueToMerchant = (timeAtRate * tierRate / (604800)); //604800 = seconds/week
			return dueToMerchant;
		} else {
			return 0;
		}
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
	function sendEthTo(address recipient) public onlyOwner {
		(bool success, ) = recipient.call{ value: address(this).balance }("");
		require(success, "Failed to send Ether");
	}

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}

	function min(uint256 a, uint256 b) public pure returns (uint256) {
		return a <= b ? a : b;
	}
}
