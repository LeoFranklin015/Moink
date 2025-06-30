// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract DiscountCouponNFT is ERC721URIStorage, Ownable {
//     uint256 public tokenIdCounter;

//     // Mapping to store the discount for each NFT
//     mapping(uint256 => string) public tokenDiscount;

//     // Event to be emitted when a new NFT is minted
//     event CouponMinted(address recipient, uint256 tokenId, string metadataURI);

//     constructor() ERC721("MarriotCoupon", "MNFT") Ownable(msg.sender) {}

//     // Function to mint the discount coupon NFT
//     function mintCoupon(address recipient) external onlyOwner {
//         uint256 tokenId = tokenIdCounter;
//         tokenIdCounter++;

//         // Set the metadata URI for the NFT, including the 15% discount
//         string memory metadataURI = generateMetadata(tokenId);

//         // Mint the NFT to the recipient
//         _safeMint(recipient, tokenId);

//         // Set the URI
//         _setTokenURI(tokenId, metadataURI);

//         // Store the discount in the mapping
//         tokenDiscount[tokenId] = "15% Discount";

//         // Emit event
//         emit CouponMinted(recipient, tokenId, metadataURI);
//     }

//     // Function to generate metadata URI (this can be extended or integrated with IPFS)
//     function generateMetadata(uint256 tokenId) private pure returns (string memory) {
//         string memory discount = "15% Discount"; // Fixed 15% discount
//         string memory json = string(
//             abi.encodePacked(
//                 '{"name": "Discount Coupon #',
//                 uint2str(tokenId),
//                 '", "description": "This NFT represents a 15% discount.", "discount": "15%", "image": "https://example.com/discount_image.png"}'
//             )
//         );

//         // Return the metadata URI (this can be changed to IPFS if needed)
//         return string(abi.encodePacked("data:application/json;base64,", base64Encode(bytes(json))));
//     }

//     // Convert uint to string
//     function uint2str(uint256 _i) private pure returns (string memory _uintAsString) {
//         if (_i == 0) {
//             return "0";
//         }
//         uint256 j = _i;
//         uint256 length;
//         while (j != 0) {
//             length++;
//             j /= 10;
//         }
//         bytes memory bstr = new bytes(length);
//         uint256 k = length;
//         j = _i;
//         while (j != 0) {
//             bstr[--k] = bytes1(uint8(48 + j % 10));
//             j /= 10;
//         }
//         return string(bstr);
//     }

//     // Base64 encode function (used to encode the metadata to base64)
//     function base64Encode(bytes memory data) private pure returns (string memory) {
//         bytes memory base64Table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
//         uint256 encodedLen = 4 * ((data.length + 2) / 3);
//         bytes memory result = new bytes(encodedLen);
//         uint256 i = 0;
//         uint256 j = 0;

//         while (i < data.length) {
//             uint256 a = uint8(data[i++]);
//             uint256 b = i < data.length ? uint8(data[i++]) : 0;
//             uint256 c = i < data.length ? uint8(data[i++]) : 0;

//             result[j++] = base64Table[a >> 2];
//             result[j++] = base64Table[((a & 3) << 4) | (b >> 4)];
//             result[j++] = base64Table[((b & 15) << 2) | (c >> 6)];
//             result[j++] = base64Table[c & 63];
//         }

//         return string(result);
//     }
// }
