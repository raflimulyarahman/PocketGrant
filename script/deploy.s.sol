// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PocketGrant} from "../src/PocketGrant.sol";

/**
 * @title PocketGrant Deployment Script
 * @notice Deploy PocketGrant contract to Base network
 *
 * @dev Usage:
 *
 * For Base Sepolia Testnet:
 * ```bash
 * forge script script/deploy.s.sol:DeployPocketGrant \
 *   --rpc-url $BASE_SEPOLIA_RPC_URL \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --verify \
 *   --etherscan-api-key $BASESCAN_API_KEY
 * ```
 *
 * For Base Mainnet:
 * ```bash
 * forge script script/deploy.s.sol:DeployPocketGrant \
 *   --rpc-url $BASE_RPC_URL \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --verify \
 *   --etherscan-api-key $BASESCAN_API_KEY
 * ```
 */
contract DeployPocketGrant is Script {
    // IDRX Token Addresses (update these for actual deployment)
    // Base Sepolia Testnet - use mock or actual IDRX address
    address constant IDRX_BASE_SEPOLIA =
        0x18bc5BCC660CF2b7de42f11C7DedE45b4c71326C; // Replace with actual IDRX address

    // Base Mainnet - use actual IDRX address
    address constant IDRX_BASE_MAINNET =
        0x18bc5BCC660CF2b7de42f11C7DedE45b4c71326C; // Replace with actual IDRX address

    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Determine IDRX address based on chain
        address idrxAddress = _getIdrxAddress();

        console.log("=== PocketGrant Deployment ===");
        console.log("Chain ID:", block.chainid);
        console.log("IDRX Address:", idrxAddress);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("");

        address deployerAddr = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PocketGrant (deployer becomes admin)
        PocketGrant pocketGrant = new PocketGrant(idrxAddress, deployerAddr);

        console.log("PocketGrant deployed at:", address(pocketGrant));
        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("");
        console.log("Next steps:");
        console.log("1. Verify on BaseScan (if not auto-verified)");
        console.log("2. Update frontend contract address");
        console.log("3. Provider: Approve IDRX spending for PocketGrant");
        console.log("4. Provider: Call createProgram() to start a Dana Kaget");

        vm.stopBroadcast();
    }

    function _getIdrxAddress() internal view returns (address) {
        // Base Sepolia
        if (block.chainid == 84532) {
            return IDRX_BASE_SEPOLIA;
        }
        // Base Mainnet
        if (block.chainid == 8453) {
            return IDRX_BASE_MAINNET;
        }
        // Local/Anvil - will need to deploy mock
        revert("Unsupported chain. Deploy mock IDRX first for local testing.");
    }
}

/**
 * @title DeployWithMock
 * @notice Deploy PocketGrant with a mock IDRX token (for testing)
 *
 * @dev Usage for local testing:
 * ```bash
 * anvil                                    # Start local node
 * forge script script/deploy.s.sol:DeployWithMock \
 *   --rpc-url http://localhost:8545 \
 *   --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
 *   --broadcast
 * ```
 */
contract DeployWithMock is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(
                0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            )
        );
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== PocketGrant + Mock IDRX Deployment ===");
        console.log("Deployer:", deployer);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Mock IDRX
        MockIDRX mockIdrx = new MockIDRX();
        console.log("Mock IDRX deployed at:", address(mockIdrx));

        // Mint some tokens to deployer for testing
        mockIdrx.mint(deployer, 10_000_000 * 1e6); // 10M IDRX
        console.log("Minted 10M IDRX to deployer");

        // Deploy PocketGrant (deployer becomes admin)
        PocketGrant pocketGrant = new PocketGrant(address(mockIdrx), deployer);
        console.log("PocketGrant deployed at:", address(pocketGrant));

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("");
        console.log("Test flow:");
        console.log("1. Approve: mockIdrx.approve(pocketGrant, amount)");
        console.log("2. Create: pocketGrant.createProgram(...)");
        console.log("3. Claim: pocketGrant.claimDanaKaget(programId)");

        vm.stopBroadcast();
    }
}

/**
 * @title MockIDRX
 * @notice Simple mock IDRX for local deployment
 */
contract MockIDRX {
    string public constant name = "Indonesian Rupiah Extended";
    string public constant symbol = "IDRX";
    uint8 public constant decimals = 6;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        return _transfer(msg.sender, to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        return _transfer(from, to, amount);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal returns (bool) {
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
