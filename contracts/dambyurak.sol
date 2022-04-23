// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
/*
###########  ##       ##        ##    ##  #############  ##
###########  ##       ##        ##    ##             ##  ##
###          ####     ##        ##    ##             ##  ##
###          ####     ##        ##    ##  #############  #####
###########  ##       ############ #####  ##             ## 
###########  ##       ############    ##  ##             ##
                      ##        ## #####  #############  ##
################      ##        ##    ##  
##            ##      ##        ##    ##  ################# 
##            ##      ############    ##                 ## 
################      ############    ##                 ##
*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Dambyurak is ERC721, Ownable {
    using Strings for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct Nakseo {
        address writer;
        string content;
    }

    modifier onlyHolderOf(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender);
        _;
    }

    modifier checkPriceOf(uint256 _tokenId) {
        if (ownerOf(_tokenId) != msg.sender) {
            require(msg.value == writePrice[_tokenId], "Dambyurak: Writing price is not enough");
            payable(ownerOf(_tokenId)).transfer(msg.value);
        }
        else {
            require(msg.value == 0.0 ether, "Dambyurak: Owner does not have to pay to write");
        }
        _;
    }

    mapping(uint256 => uint256) public nakseoCount;
    mapping(uint256 => mapping(uint256 => Nakseo)) public nakseo;
    mapping(uint256 => uint256) public writePrice;

    string private baseTokenURI;
    string private tokenSuffix;
    string private baseAssetURI;
    string private assetSuffix;

    constructor(
        string memory _initialBaseTokenURI,
        string memory _initialTokenSuffix,
        string memory _initialBaseAssetURI,
        string memory _initialAssetSuffix
    ) ERC721("Dambyurak", "DBR") {
        baseTokenURI = _initialBaseTokenURI;
        baseAssetURI = _initialBaseAssetURI;
        tokenSuffix = _initialTokenSuffix;
        assetSuffix = _initialAssetSuffix;
    }

    // Metadata Management
    function setBaseTokenURI(string memory _newBaseURI) public onlyOwner {
        baseTokenURI = _newBaseURI;
    }

    function setTokenSuffix(string memory _suffix) public onlyOwner {
        tokenSuffix = _suffix;
    }

    function setBaseAssetURI(string memory _newBaseURI) public onlyOwner {
        baseAssetURI = _newBaseURI;
    }

    function setAssetSuffix(string memory _suffix) public onlyOwner {
        assetSuffix = _suffix;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "ERC721: Token does not exist");
        string memory _uri = super.tokenURI(_tokenId);
        return string(abi.encodePacked(_uri, tokenSuffix));
    }

    function assetURI(uint256 _tokenId) public view returns (string memory) {
        require(_exists(_tokenId), "ERC721: Token does not exist");
        return string(abi.encodePacked(baseAssetURI, _tokenId.toString(), assetSuffix));
    }

    // Nakseo Management
    function writeOnWall(uint256 _tokenId, string memory _content)
        public
        payable
        checkPriceOf(_tokenId)
    {
        require(_exists(_tokenId), "ERC721: Token does not exist");
        uint256 msgCount = nakseoCount[_tokenId];
        nakseoCount[_tokenId] += 1;
        nakseo[_tokenId][msgCount] = Nakseo(msg.sender, _content);
    }

    function setWritePrice(uint256 _tokenId, uint256 _price)
        public
        onlyHolderOf(_tokenId)
    {
        require(_exists(_tokenId), "ERC721: Token does not exist");
        writePrice[_tokenId] = _price;
    }

    function getAllNakseo(uint256 _tokenId)
        public
        view
        returns(Nakseo[] memory)
    {
        require(_exists(_tokenId), "ERC721: Token does not exist");

        uint256 _count = nakseoCount[_tokenId];
        Nakseo[] memory _allNakseo = new Nakseo[](_count);
        
        for(uint256 i = 0; i < _count; i++) {
            _allNakseo[i] = nakseo[_tokenId][i];
        }
        return _allNakseo;
    }

    // Minting
    function safeMint(address to)
        public onlyOwner
        returns (uint256)
    {
        _tokenIdCounter.increment();
        uint256 newItemId = _tokenIdCounter.current();

        _safeMint(to, newItemId);
        nakseoCount[newItemId] = 1;
        nakseo[newItemId][0] = Nakseo(msg.sender, "Welcome to dambyurak!");
        writePrice[newItemId] = 0.0 ether;
        return newItemId;
    }

    function bulkMint(address to, uint256 amount)
        public onlyOwner
    {
        for(uint256 i = 0; i < amount; i++) {
            safeMint(to);
        }
    }

    function totalSupply()
        public
        view
        returns (uint256)
    {
        return _tokenIdCounter.current();
    }
}
