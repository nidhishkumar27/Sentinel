// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TravelIDRegistry {
    address public authority;

    struct IDData {
        bool isValid;
        uint256 expiryDate;
        bool isRevoked;
    }

    // Mapping from Tourist ID (Hash) to their Data
    mapping(string => IDData) public registry;

    event IDRegistered(string tourist_id, uint256 expiryDate);
    event IDRevoked(string tourist_id, string reason);

    modifier onlyAuthority() {
        require(msg.sender == authority, "Caller is not the authority");
        _;
    }

    constructor() {
        authority = msg.sender; // The deployer is the initial authority
    }

    /**
     * @dev Registers a new ID with an expiration duration (in seconds).
     */
    function registerID(string memory tourist_id, uint256 durationInSeconds) public onlyAuthority {
        registry[tourist_id] = IDData({
            isValid: true,
            expiryDate: block.timestamp + durationInSeconds,
            isRevoked: false
        });
        emit IDRegistered(tourist_id, block.timestamp + durationInSeconds);
    }

    /**
     * @dev Revokes an ID. Called when a phone is lost or ID misused.
     */
    function revokeId(string memory tourist_id) public onlyAuthority {
        require(registry[tourist_id].isValid, "ID does not exist or invalid");
        registry[tourist_id].isRevoked = true;
        emit IDRevoked(tourist_id, "Security Breach / Lost Device");
    }

    /**
     * @dev Checks if an ID is active (Exists, Not Revoked, Not Expired).
     */
    function isActive(string memory tourist_id) public view returns (bool) {
        IDData memory data = registry[tourist_id];
        
        if (!data.isValid) return false;
        if (data.isRevoked) return false;
        if (block.timestamp > data.expiryDate) return false;
        
        return true;
    }

    /**
     * @dev Returns the expiry date timestamp.
     */
    function expiryDate(string memory tourist_id) public view returns (uint256) {
        return registry[tourist_id].expiryDate;
    }
}
