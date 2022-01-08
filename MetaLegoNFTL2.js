//SPDX-License-Identifier: Unlicense
pragma experimental ABIEncoderV2;
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./BEP721/BEP721.sol";
contract MetaLegoNFTL2 is BEP721,Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private tokenId;

    address private factory;

    constructor(string memory baseUri,address _factory) BEP721("MetaLegoNFTL2", "MetaLegoNFTL2") {
        setBaseUri(baseUri);
        factory = _factory;
        tokenId.increment();
    }

    function mint(address _to) public onlyFactory  returns (uint256) {
        uint256 _tokenId = tokenId.current();
        require(_tokenId > 0 && _tokenId <= 200000, "EXCEEDS LIMIT");
        _safeMint(_to, _tokenId);
        tokenId.increment();
        return _tokenId;
    }

    function setOwner(address _owner) public onlyOwner {
        transferOwnership(_owner);
    }

    function setFactory(address _factory) public onlyOwner {
        factory = _factory;
    }

    function setBaseUri(string memory _uri) public onlyOwner {
        _setBaseURI(_uri);
    }

    modifier onlyFactory() {
        require(factory == _msgSender(), "LG NFT: Only NFT Factory can call the method");
        _;
    }
}
