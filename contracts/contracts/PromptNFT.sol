// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PromptNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;
    string private _baseTokenURI;
    
    // 映射存储每个NFT的prompt内容
    mapping(uint256 => string) private _prompts;
    
    // 事件
    event TokenMinted(address indexed to, uint256 indexed tokenId, string prompt);
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        _nextTokenId = 1;
    }
    
    /**
     * @dev Mint NFT with prompt
     */
    function mint(address to, string memory prompt) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        // 存储prompt内容
        _prompts[tokenId] = prompt;
        
        emit TokenMinted(to, tokenId, prompt);
        return tokenId;
    }
    
    /**
     * @dev 获取NFT的prompt内容
     */
    function getPrompt(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _prompts[tokenId];
    }
    
    /**
     * @dev 获取用户拥有的所有NFT
     */
    function getUserTokens(address user) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_ownerOf(i) == user) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }
    
    /**
     * @dev 设置baseURI
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    // 重写必要的函数
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
