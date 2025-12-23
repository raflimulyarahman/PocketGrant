// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PocketGrant V2 (Dana Kaget Edu)
 * @author PocketGrant Team
 * @notice Smart contract engine for educational fund distribution with 3 modes:
 *         - Request: Beneficiaries submit requests, provider approves
 *         - DanaKaget: One-tap claim, first-come-first-served (viral feature)
 *         - GiftCard: Claim by secret code
 * @dev Optimized for Base mini-app mobile-first using IDRX token
 *      V2 adds: Admin role, Verifier role, global pause, beneficiary verification
 */
contract PocketGrant is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Enums ============

    enum ProgramMode {
        Request, // 0: Submit request, provider approves
        DanaKaget, // 1: One-tap claim, no verification (viral)
        GiftCard // 2: Claim with secret code
    }

    enum ProgramStatus {
        Active,
        Paused,
        Ended
    }

    // ============ Structs ============

    struct Program {
        address provider;
        uint256 totalFund;
        uint256 remainingFund;
        uint256 maxPerClaim;
        ProgramMode mode;
        ProgramStatus status;
        uint256 capPerWallet;
        uint64 start;
        uint64 end;
        bool requireVerification; // V2: Require beneficiary verification
    }

    struct Request {
        address requester;
        uint256 amount;
        bool approved;
        bool paid;
    }

    struct ProgramConfig {
        uint256 totalFund;
        uint256 maxPerClaim;
        ProgramMode mode;
        uint256 capPerWallet;
        uint64 start;
        uint64 end;
        bytes32 giftCodeHash;
        bool requireVerification; // V2: Require verification for this program
    }

    // ============ State Variables ============

    /// @notice The IDRX token used for all transfers
    IERC20 public immutable idrx;

    /// @notice Global admin (can manage verifiers, pause contract)
    address public admin;

    /// @notice Global pause state
    bool public globalPaused;

    /// @notice Verifiers can approve beneficiaries
    mapping(address => bool) public verifiers;

    /// @notice Verified beneficiaries per program
    mapping(uint256 => mapping(address => bool)) public verifiedBeneficiaries;

    /// @notice Counter for program IDs
    uint256 public programCount;

    /// @notice Counter for request IDs per program
    mapping(uint256 => uint256) public requestCount;

    /// @notice Mapping of program ID to Program struct
    mapping(uint256 => Program) public programs;

    /// @notice Tracking claims per program per wallet
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    /// @notice Gift code hash per program
    mapping(uint256 => bytes32) public giftCodeHash;

    /// @notice Requests per program
    mapping(uint256 => mapping(uint256 => Request)) public requests;

    /// @notice Amount claimed per wallet per program
    mapping(uint256 => mapping(address => uint256)) public claimedAmount;

    // ============ Custom Errors ============

    error InvalidAmount();
    error InvalidTimeRange();
    error ProgramNotActive();
    error ProgramNotPaused();
    error ProgramAlreadyEnded();
    error NotProvider();
    error NotAdmin();
    error NotVerifier();
    error NotVerified();
    error AlreadyClaimed();
    error InsufficientFunds();
    error ExceedsCapPerWallet();
    error InvalidMode();
    error InvalidGiftCode();
    error RequestNotFound();
    error RequestAlreadyProcessed();
    error ProgramNotStarted();
    error ProgramExpired();
    error ZeroAddress();
    error ContractPaused();
    error AlreadyVerified();

    // ============ Events ============

    event ProgramCreated(
        uint256 indexed programId,
        address indexed provider,
        uint256 totalFund,
        ProgramMode mode
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

    // V2 Events
    event AdminTransferred(
        address indexed previousAdmin,
        address indexed newAdmin
    );
    event VerifierUpdated(address indexed verifier, bool status);
    event BeneficiaryVerified(
        uint256 indexed programId,
        address indexed beneficiary,
        address indexed verifier
    );
    event GlobalPauseUpdated(bool paused);

    // ============ Constructor ============

    constructor(address _idrx, address _admin) {
        if (_idrx == address(0)) revert ZeroAddress();
        if (_admin == address(0)) revert ZeroAddress();
        idrx = IERC20(_idrx);
        admin = _admin;
    }

    // ============ Modifiers ============

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyVerifier() {
        if (!verifiers[msg.sender] && msg.sender != admin) revert NotVerifier();
        _;
    }

    modifier onlyProvider(uint256 programId) {
        if (msg.sender != programs[programId].provider) revert NotProvider();
        _;
    }

    modifier whenNotPaused() {
        if (globalPaused) revert ContractPaused();
        _;
    }

    modifier programActive(uint256 programId) {
        Program storage program = programs[programId];
        if (program.status != ProgramStatus.Active) revert ProgramNotActive();
        if (block.timestamp < program.start) revert ProgramNotStarted();
        if (program.end != 0 && block.timestamp > program.end)
            revert ProgramExpired();
        _;
    }

    // ============ Admin Functions (V2) ============

    /// @notice Transfer admin role to new address
    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    /// @notice Add or remove a verifier
    function setVerifier(address verifier, bool status) external onlyAdmin {
        if (verifier == address(0)) revert ZeroAddress();
        verifiers[verifier] = status;
        emit VerifierUpdated(verifier, status);
    }

    /// @notice Pause all contract operations (emergency)
    function setGlobalPause(bool paused) external onlyAdmin {
        globalPaused = paused;
        emit GlobalPauseUpdated(paused);
    }

    // ============ Verifier Functions (V2) ============

    /// @notice Verify a beneficiary for a program
    function verifyBeneficiary(
        uint256 programId,
        address beneficiary
    ) external onlyVerifier {
        if (beneficiary == address(0)) revert ZeroAddress();
        if (verifiedBeneficiaries[programId][beneficiary])
            revert AlreadyVerified();

        verifiedBeneficiaries[programId][beneficiary] = true;
        emit BeneficiaryVerified(programId, beneficiary, msg.sender);
    }

    /// @notice Batch verify multiple beneficiaries
    function verifyBeneficiaries(
        uint256 programId,
        address[] calldata beneficiaries
    ) external onlyVerifier {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (
                beneficiaries[i] != address(0) &&
                !verifiedBeneficiaries[programId][beneficiaries[i]]
            ) {
                verifiedBeneficiaries[programId][beneficiaries[i]] = true;
                emit BeneficiaryVerified(
                    programId,
                    beneficiaries[i],
                    msg.sender
                );
            }
        }
    }

    // ============ Provider Functions ============

    /// @notice Create a new grant program and deposit funds
    function createProgram(
        ProgramConfig calldata config
    ) external nonReentrant whenNotPaused returns (uint256 programId) {
        if (config.totalFund == 0) revert InvalidAmount();
        if (config.maxPerClaim == 0) revert InvalidAmount();
        if (config.end != 0 && config.end <= config.start)
            revert InvalidTimeRange();

        programId = ++programCount;

        programs[programId] = Program({
            provider: msg.sender,
            totalFund: config.totalFund,
            remainingFund: config.totalFund,
            maxPerClaim: config.maxPerClaim,
            mode: config.mode,
            status: ProgramStatus.Active,
            capPerWallet: config.capPerWallet,
            start: config.start,
            end: config.end,
            requireVerification: config.requireVerification
        });

        if (config.mode == ProgramMode.GiftCard) {
            giftCodeHash[programId] = config.giftCodeHash;
        }

        idrx.safeTransferFrom(msg.sender, address(this), config.totalFund);
        emit ProgramCreated(
            programId,
            msg.sender,
            config.totalFund,
            config.mode
        );
    }

    /// @notice Top up an existing program
    function topUpProgram(
        uint256 programId,
        uint256 amount
    ) external nonReentrant whenNotPaused onlyProvider(programId) {
        if (amount == 0) revert InvalidAmount();
        Program storage program = programs[programId];
        if (program.status == ProgramStatus.Ended) revert ProgramAlreadyEnded();

        program.totalFund += amount;
        program.remainingFund += amount;
        idrx.safeTransferFrom(msg.sender, address(this), amount);
        emit ProgramTopUp(programId, amount);
    }

    /// @notice Pause a program
    function pauseProgram(uint256 programId) external onlyProvider(programId) {
        Program storage program = programs[programId];
        if (program.status != ProgramStatus.Active) revert ProgramNotActive();
        program.status = ProgramStatus.Paused;
        emit ProgramPaused(programId);
    }

    /// @notice Resume a paused program
    function resumeProgram(uint256 programId) external onlyProvider(programId) {
        Program storage program = programs[programId];
        if (program.status != ProgramStatus.Paused) revert ProgramNotPaused();
        program.status = ProgramStatus.Active;
        emit ProgramResumed(programId);
    }

    /// @notice End a program permanently
    function endProgram(uint256 programId) external onlyProvider(programId) {
        Program storage program = programs[programId];
        if (program.status == ProgramStatus.Ended) revert ProgramAlreadyEnded();
        program.status = ProgramStatus.Ended;
        emit ProgramEnded(programId);
    }

    /// @notice Withdraw remaining funds (provider only, after ending)
    function withdrawRemaining(
        uint256 programId
    ) external nonReentrant onlyProvider(programId) {
        Program storage program = programs[programId];
        if (program.status != ProgramStatus.Ended) revert ProgramNotActive();

        uint256 amount = program.remainingFund;
        if (amount == 0) revert InsufficientFunds();

        program.remainingFund = 0;
        idrx.safeTransfer(msg.sender, amount);
        emit FundsWithdrawn(programId, amount);
    }

    // ============ Beneficiary Functions ============

    /// @notice Claim from Dana Kaget program (NO verification required - viral feature)
    function claimDanaKaget(
        uint256 programId
    ) external nonReentrant whenNotPaused programActive(programId) {
        Program storage program = programs[programId];

        if (program.mode != ProgramMode.DanaKaget) revert InvalidMode();
        if (hasClaimed[programId][msg.sender]) revert AlreadyClaimed();
        if (program.remainingFund == 0) revert InsufficientFunds();
        // Note: DanaKaget mode does NOT check verification (for viral user acquisition)

        uint256 claimAmount = program.maxPerClaim;
        if (program.remainingFund < claimAmount) {
            claimAmount = program.remainingFund;
        }

        if (program.capPerWallet > 0) {
            uint256 newTotal = claimedAmount[programId][msg.sender] +
                claimAmount;
            if (newTotal > program.capPerWallet) revert ExceedsCapPerWallet();
            claimedAmount[programId][msg.sender] = newTotal;
        }

        hasClaimed[programId][msg.sender] = true;
        program.remainingFund -= claimAmount;
        idrx.safeTransfer(msg.sender, claimAmount);
        emit Claimed(programId, msg.sender, claimAmount);
    }

    /// @notice Submit a funding request (verification required if set)
    function submitRequest(
        uint256 programId,
        uint256 amount
    )
        external
        whenNotPaused
        programActive(programId)
        returns (uint256 requestId)
    {
        Program storage program = programs[programId];

        if (program.mode != ProgramMode.Request) revert InvalidMode();
        if (amount == 0) revert InvalidAmount();
        if (amount > program.maxPerClaim) revert InvalidAmount();

        // Check verification if required
        if (
            program.requireVerification &&
            !verifiedBeneficiaries[programId][msg.sender]
        ) {
            revert NotVerified();
        }

        requestId = ++requestCount[programId];
        requests[programId][requestId] = Request({
            requester: msg.sender,
            amount: amount,
            approved: false,
            paid: false
        });

        emit RequestSubmitted(programId, requestId, msg.sender, amount);
    }

    /// @notice Provider approves and pays a request
    function approveAndPay(
        uint256 programId,
        uint256 requestId
    ) external nonReentrant whenNotPaused onlyProvider(programId) {
        Program storage program = programs[programId];
        Request storage request = requests[programId][requestId];

        if (program.status == ProgramStatus.Ended) revert ProgramAlreadyEnded();
        if (request.requester == address(0)) revert RequestNotFound();
        if (request.paid) revert RequestAlreadyProcessed();
        if (program.remainingFund < request.amount) revert InsufficientFunds();

        request.approved = true;
        request.paid = true;
        program.remainingFund -= request.amount;
        idrx.safeTransfer(request.requester, request.amount);
        emit RequestApproved(
            programId,
            requestId,
            request.requester,
            request.amount
        );
    }

    /// @notice Claim with gift code (verification required if set)
    function claimGift(
        uint256 programId,
        string calldata code
    ) external nonReentrant whenNotPaused programActive(programId) {
        Program storage program = programs[programId];

        if (program.mode != ProgramMode.GiftCard) revert InvalidMode();
        if (hasClaimed[programId][msg.sender]) revert AlreadyClaimed();
        if (program.remainingFund == 0) revert InsufficientFunds();

        // Check verification if required
        if (
            program.requireVerification &&
            !verifiedBeneficiaries[programId][msg.sender]
        ) {
            revert NotVerified();
        }

        bytes32 codeHash = keccak256(abi.encodePacked(code));
        if (codeHash != giftCodeHash[programId]) revert InvalidGiftCode();

        uint256 claimAmount = program.maxPerClaim;
        if (program.remainingFund < claimAmount) {
            claimAmount = program.remainingFund;
        }

        if (program.capPerWallet > 0) {
            uint256 newTotal = claimedAmount[programId][msg.sender] +
                claimAmount;
            if (newTotal > program.capPerWallet) revert ExceedsCapPerWallet();
            claimedAmount[programId][msg.sender] = newTotal;
        }

        hasClaimed[programId][msg.sender] = true;
        program.remainingFund -= claimAmount;
        idrx.safeTransfer(msg.sender, claimAmount);
        emit Claimed(programId, msg.sender, claimAmount);
    }

    // ============ View Functions ============

    function getProgram(
        uint256 programId
    )
        external
        view
        returns (
            address provider,
            uint256 totalFund,
            uint256 remainingFund,
            uint256 maxPerClaim,
            ProgramMode mode,
            ProgramStatus status,
            uint256 capPerWallet,
            uint64 start,
            uint64 end,
            bool requireVerification
        )
    {
        Program storage p = programs[programId];
        return (
            p.provider,
            p.totalFund,
            p.remainingFund,
            p.maxPerClaim,
            p.mode,
            p.status,
            p.capPerWallet,
            p.start,
            p.end,
            p.requireVerification
        );
    }

    function getRequest(
        uint256 programId,
        uint256 requestId
    )
        external
        view
        returns (address requester, uint256 amount, bool approved, bool paid)
    {
        Request storage r = requests[programId][requestId];
        return (r.requester, r.amount, r.approved, r.paid);
    }

    function canClaimDanaKaget(
        uint256 programId,
        address wallet
    ) external view returns (bool canClaim, uint256 claimAmount) {
        Program storage program = programs[programId];

        if (globalPaused) return (false, 0);
        if (program.status != ProgramStatus.Active) return (false, 0);
        if (program.mode != ProgramMode.DanaKaget) return (false, 0);
        if (hasClaimed[programId][wallet]) return (false, 0);
        if (program.remainingFund == 0) return (false, 0);
        if (block.timestamp < program.start) return (false, 0);
        if (program.end != 0 && block.timestamp > program.end)
            return (false, 0);

        claimAmount = program.maxPerClaim;
        if (program.remainingFund < claimAmount) {
            claimAmount = program.remainingFund;
        }

        if (program.capPerWallet > 0) {
            uint256 newTotal = claimedAmount[programId][wallet] + claimAmount;
            if (newTotal > program.capPerWallet) return (false, 0);
        }

        return (true, claimAmount);
    }

    function isVerified(
        uint256 programId,
        address wallet
    ) external view returns (bool) {
        return verifiedBeneficiaries[programId][wallet];
    }
}
