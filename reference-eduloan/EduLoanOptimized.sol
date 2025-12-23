// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title EduLoanOptimized - Gas-Optimized Version
/// @notice Sistem pinjaman dengan gas optimization

contract EduLoanOptimized {
    // ============================================
    // CUSTOM ERRORS (Gas Efficient!)
    // ============================================

    error NotAdmin();
    error NotBorrower();
    error LoanNotFound();
    error InvalidStatus();
    error InvalidAmount();
    error InsufficientBalance();
    error TransferFailed();

    // ============================================
    // ENUMS & STRUCTS
    // ============================================

    enum LoanStatus {
        Pending,
        Approved,
        Active,
        Repaid,
        Defaulted,
        Rejected
    }

    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 principalAmount;
        uint256 interestRate;
        uint256 totalAmount;
        uint256 amountRepaid;
        uint256 applicationTime;
        uint256 approvalTime;
        uint256 deadline;
        LoanStatus status;
        string purpose;
    }

    // ============================================
    // STATE VARIABLES
    // ============================================

    address public admin;
    uint256 public loanCounter;

    uint256 public constant INTEREST_RATE = 500;
    uint256 public constant LOAN_DURATION = 365 days;
    uint256 public constant MIN_LOAN = 0.01 ether;
    uint256 public constant MAX_LOAN = 10 ether;

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;

    // ============================================
    // EVENTS
    // ============================================

    event LoanApplied(uint256 indexed loanId, address indexed borrower, uint256 amount, string purpose);
    event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 totalAmount);
    event LoanRejected(uint256 indexed loanId, address indexed borrower, string reason);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event PaymentMade(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 remaining);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    event FundsDeposited(address indexed admin, uint256 amount);
    event FundsWithdrawn(address indexed admin, uint256 amount);

    // ============================================
    // MODIFIERS (Gas Optimized)
    // ============================================

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyBorrower(uint256 _loanId) {
        if (loans[_loanId].borrower != msg.sender) revert NotBorrower();
        _;
    }

    modifier loanExists(uint256 _loanId) {
        if (_loanId == 0 || _loanId > loanCounter) revert LoanNotFound();
        _;
    }

    modifier inStatus(uint256 _loanId, LoanStatus _status) {
        if (loans[_loanId].status != _status) revert InvalidStatus();
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor() {
        admin = msg.sender;
    }

    // ============================================
    // MAIN FUNCTIONS (Optimized)
    // ============================================

    /// @notice Mahasiswa mengajukan pinjaman
    function applyLoan(uint256 _amount, string calldata _purpose) external {
        // Cheap checks first
        if (_amount < MIN_LOAN) revert InvalidAmount();
        if (_amount > MAX_LOAN) revert InvalidAmount();

        // Increment counter
        uint256 newLoanId;
        unchecked {
            newLoanId = ++loanCounter;
        }

        // Calculate interest
        uint256 interest = calculateInterest(_amount);
        uint256 total;
        unchecked {
            total = _amount + interest;
        }

        // Create loan
        loans[newLoanId] = Loan({
            loanId: newLoanId,
            borrower: msg.sender,
            principalAmount: _amount,
            interestRate: INTEREST_RATE,
            totalAmount: total,
            amountRepaid: 0,
            applicationTime: block.timestamp,
            approvalTime: 0,
            deadline: 0,
            status: LoanStatus.Pending,
            purpose: _purpose
        });

        borrowerLoans[msg.sender].push(newLoanId);

        emit LoanApplied(newLoanId, msg.sender, _amount, _purpose);
    }

    /// @notice Admin menyetujui pinjaman
    function approveLoan(uint256 _loanId)
        external
        onlyAdmin
        loanExists(_loanId)
        inStatus(_loanId, LoanStatus.Pending)
    {
        Loan storage loan = loans[_loanId]; // Cache storage pointer
        loan.status = LoanStatus.Approved;
        loan.approvalTime = block.timestamp;

        emit LoanApproved(_loanId, loan.borrower, loan.totalAmount);
    }

    /// @notice Admin menolak pinjaman
    function rejectLoan(uint256 _loanId, string calldata _reason)
        external
        onlyAdmin
        loanExists(_loanId)
        inStatus(_loanId, LoanStatus.Pending)
    {
        Loan storage loan = loans[_loanId];
        loan.status = LoanStatus.Rejected;

        emit LoanRejected(_loanId, loan.borrower, _reason);
    }

    /// @notice Admin mencairkan dana
    function disburseLoan(uint256 _loanId)
        external
        onlyAdmin
        loanExists(_loanId)
        inStatus(_loanId, LoanStatus.Approved)
    {
        Loan storage loan = loans[_loanId];
        uint256 amount = loan.principalAmount;

        if (address(this).balance < amount) revert InsufficientBalance();

        unchecked {
            loan.deadline = block.timestamp + LOAN_DURATION;
        }
        loan.status = LoanStatus.Active;

        (bool success, ) = loan.borrower.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit LoanDisbursed(_loanId, loan.borrower, amount);
    }

    /// @notice Borrower membayar cicilan
    function makePayment(uint256 _loanId)
        external
        payable
        loanExists(_loanId)
        onlyBorrower(_loanId)
        inStatus(_loanId, LoanStatus.Active)
    {
        if (msg.value == 0) revert InvalidAmount();

        Loan storage loan = loans[_loanId];

        unchecked {
            loan.amountRepaid += msg.value;
        }

        uint256 remaining;
        if (loan.totalAmount > loan.amountRepaid) {
            unchecked {
                remaining = loan.totalAmount - loan.amountRepaid;
            }
        }

        if (loan.amountRepaid >= loan.totalAmount) {
            loan.status = LoanStatus.Repaid;
            emit LoanRepaid(_loanId, msg.sender);
        }

        emit PaymentMade(_loanId, msg.sender, msg.value, remaining);
    }

    /// @notice Cek default
    function checkDefault(uint256 _loanId) external loanExists(_loanId) {
        Loan storage loan = loans[_loanId];

        if (loan.status != LoanStatus.Active) revert InvalidStatus();

        if (block.timestamp > loan.deadline && loan.amountRepaid < loan.totalAmount) {
            loan.status = LoanStatus.Defaulted;
            emit LoanDefaulted(_loanId, loan.borrower);
        }
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    function getLoanDetails(uint256 _loanId)
        external
        view
        loanExists(_loanId)
        returns (Loan memory)
    {
        return loans[_loanId];
    }

    function getMyLoans() external view returns (uint256[] memory) {
        return borrowerLoans[msg.sender];
    }

    function calculateInterest(uint256 _principal) public pure returns (uint256) {
        return (_principal * INTEREST_RATE) / 10000;
    }

    function getRemainingAmount(uint256 _loanId)
        external
        view
        loanExists(_loanId)
        returns (uint256)
    {
        Loan memory loan = loans[_loanId];
        if (loan.amountRepaid >= loan.totalAmount) return 0;
        unchecked {
            return loan.totalAmount - loan.amountRepaid;
        }
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTotalLoans() external view returns (uint256) {
        return loanCounter;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    function depositFunds() external payable onlyAdmin {
        if (msg.value == 0) revert InvalidAmount();
        emit FundsDeposited(msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _amount) external onlyAdmin {
        if (_amount == 0) revert InvalidAmount();
        if (address(this).balance < _amount) revert InsufficientBalance();

        (bool success, ) = admin.call{value: _amount}("");
        if (!success) revert TransferFailed();

        emit FundsWithdrawn(msg.sender, _amount);
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        if (_newAdmin == address(0)) revert InvalidAmount();
        admin = _newAdmin;
    }

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}