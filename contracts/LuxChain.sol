//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LuxChain is ERC721 {
    address _owner = msg.sender;
    uint256 _supply;

    mapping(uint256 => Token) tokens;
    mapping(string => uint256) serialNumbers;

    event mintToken(address _to, string _serNumber, uint256 tokenId);
    event transferEvent(address _from, address _to, uint256 _tokenId);

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    struct Token {
        string serialNumber;
        string name;
        string information;
    }

    modifier adminOnly {
        require(msg.sender == _owner, "Admin only function");
        _;
    }

    modifier adminOrOwnerOnly(uint256 _tokenId) {
        require(msg.sender == _owner || msg.sender == ownerOf(_tokenId), "Admin or owner only function");
        _;
    }

    // When a product is sold, an accompanying token created
    function mint(address _to, string memory _serialNumber, string memory _name) public adminOnly {
        super._mint(_to, _supply);
        Token memory newToken = Token(_serialNumber, _name, '');
        tokens[_supply] = newToken;
        serialNumbers[_serialNumber] = _supply++;
        emit mintToken(_to, _serialNumber, _supply);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) public override adminOrOwnerOnly(_tokenId) {
        super.transferFrom(_from, _to, _tokenId);
        tokens[_tokenId].information = '';
        emit transferEvent(_from, _to, _tokenId);
    }

    function updateInformation(uint256 _tokenId, string memory _information) public adminOrOwnerOnly(_tokenId) {
        tokens[_tokenId].information = _information;
    }

    function viewSerialNumber(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        return tokens[_tokenId].serialNumber;
    }

    function viewName(uint256 _tokenId) public view returns (string memory) {
        return tokens[_tokenId].name;
    }

    function viewTokenId(string memory _serialNumber)
        public
        view
        returns (uint256)
    {
        return serialNumbers[_serialNumber];
    }

    function getTotalSupply() public view returns (uint256) {
        return _supply;
    }

    /*
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "ERC721: owner query for nonexistent token");
        return owner;
    }
    */
}
