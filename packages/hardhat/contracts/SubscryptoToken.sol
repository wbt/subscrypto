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

	// Deprecated variables originally included in scaffold-ETH
	string public greeting = "Building Unstoppable Apps!!!";
	bool public premium = false;
	uint256 public totalCounter = 0;

	address masterCoin; //for future use: the address of the stablecoin to move in/out of (native ETH for now)
	address feeRecipient;
	uint millipercentFee = 2000; //2% fee default
	uint fixedConversionFromNative = 16;
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
		uint amount,
		uint fee
	);

	event TopUp(
		address indexed merchant,
		address indexed customer,
		uint amount
	);

	event RefundIssued(
		address indexed merchant,
		address indexed customer,
		uint amount
	);

	event MasterCoinSet(
		address indexed mastercoin
	);

	event FeeRecipientSet(
		address indexed feeRecipient
	);

	event FeeRateSet(
		uint millipercentFee
	);

	event ConversionRateSet(
		uint fixedConversionFromNative
	);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address initialOwner, address _masterCoin)
		ERC20("SubscriptoToken", "SSCO")
		Ownable(initialOwner)
		ERC20Permit("SubscriptoToken")
	{
		masterCoin = _masterCoin;
		feeRecipient = initialOwner;
		emit MasterCoinSet(_masterCoin);
	}

	function setMasterCoin(address _masterCoin) public onlyOwner {
		masterCoin = _masterCoin;
		emit MasterCoinSet(_masterCoin);
	}

	function setFixedConversionFromNative(uint _fixedConversionFromNative) public onlyOwner {
		fixedConversionFromNative = _fixedConversionFromNative;
		emit ConversionRateSet(_fixedConversionFromNative);
	}

	function setFeeRecipient(address _recipient) public onlyOwner {
		feeRecipient = _recipient;
		emit FeeRecipientSet(_recipient);
	}

	function setFeeRate(uint _millipercentFee) public onlyOwner {
		millipercentFee = _millipercentFee;
		emit FeeRateSet(_millipercentFee);
	}

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

	function topUpWithMerchantAndSetTier(
		address merchant,
		uint tierIndex,
		uint amount
	) public {
		topUpWithMerchantAndSetTier(
			merchant,
			msg.sender,
			tierIndex,
			amount
		);
	}

	function topUpWithMerchantAndSetTier(
		address merchant,
		address customer,
		uint tierIndex,
		uint amount
	) private {
		//setTier FIRST so any existing balance is subject to the cap of
		//funds in the account regarding the amount due, as the merchant
		//may have stopped providing services after the balance reached 0.
		setTier(merchant, customer, tierIndex);
		topUpWithMerchant(merchant, customer, amount);
	}

	function topUpWithMerchant(
		address merchant,
		uint amount
	) public {
		topUpWithMerchant(
			merchant,
			msg.sender,
			amount
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
		setTier(
			merchant,
			msg.sender,
			tierIndex
		);
	}

	function setTier(
		address merchant,
		address customer,
		uint tierIndex
	) private {
		accountAtSubscriptionEnd(merchant, customer);
		subscriptions[merchant][customer] = Subscription({
			tier: tierIndex,
			start: block.timestamp
		});
		emit TierSelected(
			merchant,
			customer,
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
			uint fee = cappedToMerchant * millipercentFee / 100000;
			uint merchantRevenue = cappedToMerchant - fee;
			_mint(merchant, merchantRevenue);
			_mint(feeRecipient, fee);
			emit RevenueRealized(
				merchant,
				customer,
				merchantRevenue,
				fee
			);
		}
	}

	function claimRevenue(
		address merchant,
		address customer
	) public { //Anyone can pay the gas - TODO check for security downsides
		accountAtSubscriptionEnd(merchant, customer);
		subscriptions[merchant][customer].start = block.timestamp;
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

	function remainingAvailableDeposit(
		address merchant,
		address customer
	) public view returns(uint) {
		return serviceDeposits[merchant][customer] - amountDueToMerchant(merchant, customer);
	}

	function remainingSecondsAtCurrentTier(
		address merchant,
		address customer
	) public view returns(uint) {
		uint tierIndex = subscriptions[merchant][customer].tier;
		if(tierIndex > 0) {
			uint tierRate = tiersOffered[merchant][tierIndex].pricePerWeek;
			return remainingAvailableDeposit(merchant, customer) * (604800) / tierRate ;
		} else {
			return 0;
		}
	}

	function stopAndRefund(
		address merchant
	) public {
		stopAndRefund(
			merchant,
			msg.sender
		);
	}

	function stopAndRefund(
		address merchant,
		address customer
	) private {
		//This sends money due the merchant back to the merchant
		setTier(
			merchant,
			customer,
			0
		);
		uint amountToRefund = serviceDeposits[merchant][customer];
		serviceDeposits[merchant][customer] = 0;
		_mint(customer, amountToRefund);
		emit RefundIssued(
			merchant,
			customer,
			amountToRefund
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
