pragma experimental ABIEncoderV2;
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

/// @title Nft Factory mints LG NFTs
/// @notice Nft factory has gives to other contracts or wallet addresses permission
/// to mint NFTs. It gives two type of permission set as roles:
///
/// Static role - allows to mint only Common quality NFTs
/// Generator role - allows to mint NFT of any quality.
///
/// Nft Factory can revoke the role, or give it to any number of contracts.
library SafeMath {

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

contract NftFactory is Ownable,ReentrancyGuard {
    using SignatureChecker for address;
    using SafeMath for uint256;
    using Address for address payable;
    using Address for address;
    uint256 public mintFeeL1 = 1 * 10**17;
    uint256 public mintFeeL2 = 3 * 10**17;
    uint256 public mintFeeL3 = 5 * 10**17;

    address public signer;

    uint256 public constant DENOMINATOR = 10 ** 14;

    uint256 public quota = 1;

    mapping(address=>uint256) public L1;
    mapping(address=>uint256) public L2;
    mapping(address=>uint256) public L3;

    address public l1Address ;
    address public l2Address ;
    address public l3Address ;

    event Withdrawal(address indexed sender, uint256 indexed balance);

    receive() external payable {
    }

    function mintL1(address to) public nonReentrant payable{
        require(L1[to] < quota, "One people can only mint one piece, sorry for the inconvenience");
        require(msg.value == mintFeeL1,"Insufficient expenses");
        L1[to] = L1[to].add(1);
        l1Address.functionCall(abi.encodeWithSignature("mint(address)",to));

    }

    function mintL2(address to,bytes memory signature) public nonReentrant payable{
        bytes32 message = keccak256(abi.encodePacked(msg.sender,l2Address,to));
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
        require(signer.isValidSignatureNow(hash, signature), "signature error");

        require(L2[to] < quota, "One people can only mint one piece, sorry for the inconvenience");
        require(msg.value == mintFeeL2,"Insufficient expenses");
        L2[to] = L2[to].add(1);
        l2Address.functionCall(abi.encodeWithSignature("mint(address)",to));
    }

    function mintL3(address to,bytes memory signature) public nonReentrant payable{
        bytes32 message = keccak256(abi.encodePacked(msg.sender,l3Address,to));
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
        require(signer.isValidSignatureNow(hash, signature), "signature error");
        require(L3[to] < quota, "One people can only mint one piece, sorry for the inconvenience");
        require(msg.value == mintFeeL3,"Insufficient expenses");
        L3[to] = L3[to].add(1);
        l3Address.functionCall(abi.encodeWithSignature("mint(address)",to));
    }

    function withdraw(uint256 amount) public onlyOwner{
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function setMintFeeL1(uint256 _fee) public onlyAdmin {
        mintFeeL1 = _fee;
    }
    function setMintFeeL2(uint256 _fee) public onlyAdmin {
        mintFeeL2 = _fee;
    }
    function setMintFeeL3(uint256 _fee) public onlyAdmin {
        mintFeeL3 = _fee;
    }

    function setL1Address(address l1) public onlyOwner {
        l1Address = l1;
    }

    function setL2Address(address l2) public onlyOwner {
        l2Address = l2;
    }
    function setL3Address(address l3) public onlyOwner {
        l3Address = l3;
    }

    function setQuota(uint256 _quota) public onlyAdmin{
        quota = _quota;
    }

    function setSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function multiTransfer(address[] memory receivers, uint256[] memory amounts) public onlyAdmin{
        for (uint256 i = 0; i < receivers.length; i++) {
            transfer(receivers[i], amounts[i]);
        }
    }

    function transfer(address to,uint256 value) private{
        require(address(this).balance >= value,"transfer amount exceeds balance");
        require(to != address(0),"transfer to the zero address");
        payable(to).transfer(value);
    }


    /* create random number
     * */
    function random() private view returns(uint256 ret) {
        uint256 random = uint256(blockhash(block.number - 1));
        random = random % 10;
        return random.mul(DENOMINATOR);
    }

    modifier onlyAdmin() {
        require(owner() == _msgSender(), "Ownable: caller is not the admin");
        _;
    }
}


