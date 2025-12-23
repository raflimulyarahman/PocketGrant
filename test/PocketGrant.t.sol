// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {PocketGrant} from "../src/PocketGrant.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PocketGrant V2 Test Suite
 * @notice Comprehensive tests for PocketGrant including admin/verifier roles
 */
contract PocketGrantTest is Test {
    PocketGrant public pocketGrant;
    MockERC20 public idrx;

    address public admin = address(0x999);
    address public verifier = address(0x888);
    address public provider = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    address public user4 = address(0x5);
    address public user5 = address(0x6);

    uint256 public constant INITIAL_BALANCE = 1_000_000 * 1e6;
    uint256 public constant PROGRAM_FUND = 100_000 * 1e6;
    uint256 public constant MAX_PER_CLAIM = 10_000 * 1e6;

    event ProgramCreated(
        uint256 indexed programId,
        address indexed provider,
        uint256 totalFund,
        PocketGrant.ProgramMode mode
    );
    event ProgramTopUp(uint256 indexed programId, uint256 amount);
    event Claimed(
        uint256 indexed programId,
        address indexed claimant,
        uint256 amount
    );
    event RequestSubmitted(
        uint256 indexed programId,
        uint256 indexed requestId,
        address indexed requester,
        uint256 amount
    );
    event RequestApproved(
        uint256 indexed programId,
        uint256 indexed requestId,
        address indexed beneficiary,
        uint256 amount
    );
    event ProgramPaused(uint256 indexed programId);
    event ProgramResumed(uint256 indexed programId);
    event ProgramEnded(uint256 indexed programId);
    event FundsWithdrawn(uint256 indexed programId, uint256 amount);
    event VerifierUpdated(address indexed verifier, bool status);
    event BeneficiaryVerified(
        uint256 indexed programId,
        address indexed beneficiary,
        address indexed verifier
    );
    event GlobalPauseUpdated(bool paused);

    function setUp() public {
        idrx = new MockERC20("Indonesian Rupiah Extended", "IDRX", 6);
        pocketGrant = new PocketGrant(address(idrx), admin);
        idrx.mint(provider, INITIAL_BALANCE);
        vm.prank(provider);
        idrx.approve(address(pocketGrant), type(uint256).max);

        // Setup verifier
        vm.prank(admin);
        pocketGrant.setVerifier(verifier, true);
    }

    // ============ Helper Functions ============

    function _createDanaKagetProgram() internal returns (uint256 programId) {
        vm.prank(provider);
        programId = pocketGrant.createProgram(
            PocketGrant.ProgramConfig({
                totalFund: PROGRAM_FUND,
                maxPerClaim: MAX_PER_CLAIM,
                mode: PocketGrant.ProgramMode.DanaKaget,
                capPerWallet: 0,
                start: 0,
                end: 0,
                giftCodeHash: bytes32(0),
                requireVerification: false
            })
        );
    }

    function _createRequestProgram(
        bool requireVerification
    ) internal returns (uint256 programId) {
        vm.prank(provider);
        programId = pocketGrant.createProgram(
            PocketGrant.ProgramConfig({
                totalFund: PROGRAM_FUND,
                maxPerClaim: MAX_PER_CLAIM,
                mode: PocketGrant.ProgramMode.Request,
                capPerWallet: 0,
                start: 0,
                end: 0,
                giftCodeHash: bytes32(0),
                requireVerification: requireVerification
            })
        );
    }

    function _createGiftCardProgram(
        string memory code,
        bool requireVerification
    ) internal returns (uint256 programId) {
        bytes32 codeHash = keccak256(abi.encodePacked(code));
        vm.prank(provider);
        programId = pocketGrant.createProgram(
            PocketGrant.ProgramConfig({
                totalFund: PROGRAM_FUND,
                maxPerClaim: MAX_PER_CLAIM,
                mode: PocketGrant.ProgramMode.GiftCard,
                capPerWallet: 0,
                start: 0,
                end: 0,
                giftCodeHash: codeHash,
                requireVerification: requireVerification
            })
        );
    }

    // ============ Admin Role Tests (V2) ============

    function test_admin_setVerifier() public {
        vm.expectEmit(true, false, false, true);
        emit VerifierUpdated(user1, true);

        vm.prank(admin);
        pocketGrant.setVerifier(user1, true);

        assertTrue(pocketGrant.verifiers(user1));
    }

    function test_admin_setVerifier_RevertsNotAdmin() public {
        vm.prank(user1);
        vm.expectRevert(PocketGrant.NotAdmin.selector);
        pocketGrant.setVerifier(user2, true);
    }

    function test_admin_transferAdmin() public {
        vm.prank(admin);
        pocketGrant.transferAdmin(user1);

        assertEq(pocketGrant.admin(), user1);
    }

    function test_admin_globalPause() public {
        uint256 programId = _createDanaKagetProgram();

        vm.prank(admin);
        pocketGrant.setGlobalPause(true);

        vm.prank(user1);
        vm.expectRevert(PocketGrant.ContractPaused.selector);
        pocketGrant.claimDanaKaget(programId);

        // Unpause
        vm.prank(admin);
        pocketGrant.setGlobalPause(false);

        vm.prank(user1);
        pocketGrant.claimDanaKaget(programId);
        assertTrue(pocketGrant.hasClaimed(programId, user1));
    }

    // ============ Verifier Role Tests (V2) ============

    function test_verifier_verifyBeneficiary() public {
        uint256 programId = _createRequestProgram(true);

        vm.expectEmit(true, true, true, false);
        emit BeneficiaryVerified(programId, user1, verifier);

        vm.prank(verifier);
        pocketGrant.verifyBeneficiary(programId, user1);

        assertTrue(pocketGrant.isVerified(programId, user1));
    }

    function test_verifier_batchVerify() public {
        uint256 programId = _createRequestProgram(true);
        address[] memory beneficiaries = new address[](3);
        beneficiaries[0] = user1;
        beneficiaries[1] = user2;
        beneficiaries[2] = user3;

        vm.prank(verifier);
        pocketGrant.verifyBeneficiaries(programId, beneficiaries);

        assertTrue(pocketGrant.isVerified(programId, user1));
        assertTrue(pocketGrant.isVerified(programId, user2));
        assertTrue(pocketGrant.isVerified(programId, user3));
    }

    function test_requestWithVerification_RevertsIfNotVerified() public {
        uint256 programId = _createRequestProgram(true);

        vm.prank(user1);
        vm.expectRevert(PocketGrant.NotVerified.selector);
        pocketGrant.submitRequest(programId, 5_000 * 1e6);
    }

    function test_requestWithVerification_SuccessIfVerified() public {
        uint256 programId = _createRequestProgram(true);

        // Verify user first
        vm.prank(verifier);
        pocketGrant.verifyBeneficiary(programId, user1);

        // Now submit request
        vm.prank(user1);
        uint256 requestId = pocketGrant.submitRequest(programId, 5_000 * 1e6);
        assertEq(requestId, 1);
    }

    // ============ DanaKaget NO Verification Tests ============

    function test_danaKaget_NoVerificationRequired() public {
        // Create DanaKaget program even with requireVerification true
        vm.prank(provider);
        uint256 programId = pocketGrant.createProgram(
            PocketGrant.ProgramConfig({
                totalFund: PROGRAM_FUND,
                maxPerClaim: MAX_PER_CLAIM,
                mode: PocketGrant.ProgramMode.DanaKaget,
                capPerWallet: 0,
                start: 0,
                end: 0,
                giftCodeHash: bytes32(0),
                requireVerification: true // Even if set to true
            })
        );

        // User CAN claim without verification (DanaKaget is viral feature)
        vm.prank(user1);
        pocketGrant.claimDanaKaget(programId);

        assertTrue(pocketGrant.hasClaimed(programId, user1));
        assertEq(idrx.balanceOf(user1), MAX_PER_CLAIM);
    }

    // ============ GiftCard with Verification Tests ============

    function test_giftCard_RevertsIfNotVerified() public {
        string memory code = "SECRET";
        uint256 programId = _createGiftCardProgram(code, true);

        vm.prank(user1);
        vm.expectRevert(PocketGrant.NotVerified.selector);
        pocketGrant.claimGift(programId, code);
    }

    function test_giftCard_SuccessIfVerified() public {
        string memory code = "SECRET";
        uint256 programId = _createGiftCardProgram(code, true);

        vm.prank(verifier);
        pocketGrant.verifyBeneficiary(programId, user1);

        vm.prank(user1);
        pocketGrant.claimGift(programId, code);

        assertTrue(pocketGrant.hasClaimed(programId, user1));
    }

    // ============ Original Tests (Updated for V2) ============

    function test_createProgram_Success() public {
        uint256 providerBalanceBefore = idrx.balanceOf(provider);
        uint256 contractBalanceBefore = idrx.balanceOf(address(pocketGrant));

        uint256 programId = _createDanaKagetProgram();

        assertEq(programId, 1);
        assertEq(
            idrx.balanceOf(provider),
            providerBalanceBefore - PROGRAM_FUND
        );
        assertEq(
            idrx.balanceOf(address(pocketGrant)),
            contractBalanceBefore + PROGRAM_FUND
        );
    }

    function test_danaKagetClaimSuccess() public {
        uint256 programId = _createDanaKagetProgram();
        uint256 userBalanceBefore = idrx.balanceOf(user1);

        vm.prank(user1);
        pocketGrant.claimDanaKaget(programId);

        assertEq(idrx.balanceOf(user1), userBalanceBefore + MAX_PER_CLAIM);
        assertTrue(pocketGrant.hasClaimed(programId, user1));
    }

    function test_danaKagetDoubleClaimFails() public {
        uint256 programId = _createDanaKagetProgram();

        vm.prank(user1);
        pocketGrant.claimDanaKaget(programId);

        vm.prank(user1);
        vm.expectRevert(PocketGrant.AlreadyClaimed.selector);
        pocketGrant.claimDanaKaget(programId);
    }

    function test_requestApproveFlow() public {
        uint256 programId = _createRequestProgram(false);
        uint256 requestAmount = 5_000 * 1e6;
        uint256 userBalanceBefore = idrx.balanceOf(user1);

        vm.prank(user1);
        uint256 requestId = pocketGrant.submitRequest(programId, requestAmount);

        vm.prank(provider);
        pocketGrant.approveAndPay(programId, requestId);

        assertEq(idrx.balanceOf(user1), userBalanceBefore + requestAmount);
    }

    function test_giftCodeClaim_Success() public {
        string memory code = "SECRET_CODE_123";
        uint256 programId = _createGiftCardProgram(code, false);

        vm.prank(user1);
        pocketGrant.claimGift(programId, code);

        assertTrue(pocketGrant.hasClaimed(programId, user1));
    }

    function test_pauseBehavior() public {
        uint256 programId = _createDanaKagetProgram();

        vm.prank(provider);
        pocketGrant.pauseProgram(programId);

        vm.prank(user1);
        vm.expectRevert(PocketGrant.ProgramNotActive.selector);
        pocketGrant.claimDanaKaget(programId);

        vm.prank(provider);
        pocketGrant.resumeProgram(programId);

        vm.prank(user1);
        pocketGrant.claimDanaKaget(programId);
        assertTrue(pocketGrant.hasClaimed(programId, user1));
    }

    function test_withdrawRemaining_Success() public {
        uint256 programId = _createDanaKagetProgram();

        vm.prank(provider);
        pocketGrant.endProgram(programId);

        uint256 providerBalanceBefore = idrx.balanceOf(provider);

        vm.prank(provider);
        pocketGrant.withdrawRemaining(programId);

        assertEq(
            idrx.balanceOf(provider),
            providerBalanceBefore + PROGRAM_FUND
        );
    }

    // ============ Constructor Tests ============

    function test_constructor_RevertsOnZeroIDRX() public {
        vm.expectRevert(PocketGrant.ZeroAddress.selector);
        new PocketGrant(address(0), admin);
    }

    function test_constructor_RevertsOnZeroAdmin() public {
        vm.expectRevert(PocketGrant.ZeroAddress.selector);
        new PocketGrant(address(idrx), address(0));
    }
}
