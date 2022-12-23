// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Lottery is Ownable {
    bool public betsOpen;
    uint256 public betsClosingTime;
    //    use price and not ratio; ratio cannot split tokens when it comes to price
    uint256 public purchaseRatio;
    LotteryToken public paymentToken;
    uint256 public prizePool;
    uint256 public ownerPool;
    uint256 public betFee;
    uint256 public betPrice;

    mapping(address => uint256) public prize;

    address[] _slots;

    /// @notice Constructor function
    /// @param tokenName Name of the token used for payment
    /// @param tokenSymbol Symbol of the token used for payment
    /// @param _purchaseRatio Amount of tokens per ETH payed
    /// @param _betFee Tokens required to place a bet that goes to the prize pool
    /// @param _betPrice Tokens required for placing bets for the owner pool
    constructor (
        string memory tokenName,
        string memory tokenSymbol,
        uint256 _purchaseRatio,
        uint256 _betFee,
        uint256 _betPrice) {
        paymentToken = new LotteryToken(tokenName, tokenSymbol);
        purchaseRatio = _purchaseRatio;
        betFee = _betFee;
        betPrice = _betPrice;
    }

    modifier whenBetsClosed(){
        require(
            !betsOpen, "Lottery is open"
        );
        _;
    }

    modifier whenBetsOpen(){
        require(
            betsOpen && block.timestamp < betsClosingTime,
            "Lottery is closed"
        );
        _;
    }

    function openBets(uint256 duration) external onlyOwner {
        require(!betsOpen, "Lottery: Bets need to be open to place a bet.");

        betsOpen = true;
        betsClosingTime = block.timestamp + duration;
    }

    function betMany(uint256 times) public {
        require(times > 0);
        while (times > 0) {
            placeBet();
            times--;
        }
    }

    function closeLottery() public {
        require(block.timestamp >= betsClosingTime, "Bets are not closed yet");
        require(betsOpen, "Close the bets first");
        if (_slots.length > 0) {
            uint256 winnerIndex = getRandomNumber() % _slots.length;
            address  winner = _slots[winnerIndex];
            prize[winner] += prizePool;
            prizePool = 0;
            delete (_slots);
        }
        betsOpen = false;
    }

    function getRandomNumber() public view returns (uint256 randomNumber) {
        randomNumber = block.difficulty;
    }

    function purchaseTokens() external payable {
        paymentToken.mint(msg.sender, msg.value * purchaseRatio);
    }

    function placeBet() public whenBetsOpen {
        ownerPool += betFee;
        prizePool += betPrice;
        _slots.push(msg.sender);
        paymentToken.transferFrom(msg.sender, address(this), betPrice + betFee);
    }

    function prizeWithdraw(uint256 amount) public {
        require(amount <= prize[msg.sender], "Not enough prize");
        prize[msg.sender] -= amount;
        paymentToken.transfer(msg.sender, amount);
    }

    function ownerWithdraw(uint256 amount) public onlyOwner {
        require(amount <= ownerPool, "Not enough fees collected");
        ownerPool -= amount;
        paymentToken.transfer(msg.sender, amount);
    }

    function returnTokens(uint256 amount) public {
        paymentToken.burnFrom(msg.sender, amount);
        payable(msg.sender).transfer(amount / purchaseRatio);
    }

    function burnTokens(uint256 amount) external payable {
        paymentToken.burnFrom(msg.sender, amount);
        payable(msg.sender).transfer(amount * amount);
    }
}

contract LotteryToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
