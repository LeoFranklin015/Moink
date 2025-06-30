// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract PaymentGateway  is Ownable{


//     uint256 public constant SERVICE_COST = 0.001 ether; // The cost of the service (0.001 ETH)
    
//     // Event to be emitted when payment is received for the service
//     event PaymentReceived(address payer, uint256 amount, uint256 serviceId);

//      constructor() Ownable(msg.sender) {
       
//     }

//     // Function to make the payment and receive the service
//     function payForService(uint256 serviceId) external payable  {
//         // Check if the correct payment amount is sent
//         require(msg.value == SERVICE_COST, "Incorrect payment amount. The service cost is 0.001 ETH");

//         // Emit the event to confirm the payment and service ID
//         emit PaymentReceived(msg.sender, msg.value, serviceId);
//     }


   

//     function withdraw() external onlyOwner {
//         uint256 balance = address(this).balance;
//         require(balance > 0, "No funds to withdraw");

//         // Transfer the balance to the owner
//         payable(owner()).transfer(balance);
//     }
// }
