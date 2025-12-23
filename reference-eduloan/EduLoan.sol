// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title EduLoan - Decentralized Student Loan System
/// @author Ethereum Jakarta
/// @notice Sistem pinjaman pendidikan terdesentralisasi di Mantle Network
/// @dev Challenge Final Mantle Co-Learning Camp

contract EduLoan {
    // ============================================
    // ENUMS & STRUCTS
    // ============================================

    enum LoanStatus {
        Pending,    // 0: Menunggu approval
        Approved,   // 1: Disetujui, menunggu pencairan
        Active,     // 2: Sudah dicairkan, dalam masa cicilan
        Repaid,     // 3: Sudah lunas
        Defaulted,  // 4: Gagal bayar (melewati deadline)
        Rejected    // 5: Ditolak oleh admin
    }

    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 principalAmount;    // Jumlah pinjaman pokok
        uint256 interestRate;       // Bunga dalam basis points (100 = 1%)
        uint256 totalAmount;        // Total yang harus dibayar (pokok + bunga)
        uint256 amountRepaid;       // Jumlah yang sudah dibayar
        uint256 applicationTime;    // Waktu pengajuan
        uint256 approvalTime;       // Waktu disetujui
        uint256 deadline;           // Batas waktu pelunasan
        LoanStatus status;
        string purpose;             // Tujuan pinjaman (SPP, buku, dll)
    }

    // ============================================
    // STATE VARIABLES
    // ============================================

    address public admin;
    uint256 public loanCounter;

    uint256 public constant INTEREST_RATE = 500; // 5% dalam basis points (500/10000)
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
    // MODIFIERS
    // ============================================

    modifier onlyAdmin() {
        require(msg.sender == admin, "Hanya admin!");
        _;
    }

    modifier onlyBorrower(uint256 _loanId) {
        require(loans[_loanId].borrower == msg.sender, "Bukan borrower!");
        _;
    }

    modifier loanExists(uint256 _loanId) {
        require(_loanId > 0 && _loanId <= loanCounter, "Loan tidak ditemukan!");
        _;
    }

    modifier inStatus(uint256 _loanId, LoanStatus _status) {
        require(loans[_loanId].status == _status, "Status loan tidak sesuai!");
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor() {
        admin = msg.sender;
    }

    // ============================================
    // MAIN FUNCTIONS
    // ============================================

    /// @notice Mahasiswa mengajukan pinjaman
    /// @param _amount Jumlah pinjaman yang diajukan
    /// @param _purpose Tujuan pinjaman
    function applyLoan(uint256 _amount, string memory _purpose) public {
        require(_amount >= MIN_LOAN, "Pinjaman terlalu kecil! Min 0.01 ETH");
        require(_amount <= MAX_LOAN, "Pinjaman terlalu besar! Max 10 ETH");

        loanCounter++;

        uint256 interest = calculateInterest(_amount);
        uint256 total = _amount + interest;

        Loan memory newLoan = Loan({
            loanId: loanCounter,
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

        loans[loanCounter] = newLoan;
        borrowerLoans[msg.sender].push(loanCounter);

        emit LoanApplied(loanCounter, msg.sender, _amount, _purpose);
    }

    /// @notice Admin menyetujui pinjaman
    function approveLoan(uint256 _loanId)
        public
        onlyAdmin
        loanExists(_loanId)
        inStatus(_loanId, LoanStatus.Pending)
    {
        loans[_loanId].status = LoanStatus.Approved;
        loans[_loanId].approvalTime = block.timestamp;

        emit LoanApproved(_loanId, loans[_loanId].borrower, loans[_loanId].totalAmount);
    }

    /// @notice Admin menolak pinjaman
    function rejectLoan(uint256 _loanId, string memory _reason)
        public
        onlyAdmin
        loanExists(_loanId)
        inStatus(_loanId, LoanStatus.Pending)
    {
        loans[_loanId].status = LoanStatus.Rejected;

        emit LoanRejected(_loanId, loans[_loanId].borrower, _reason);
    }

    /// @notice Admin mencairkan dana pinjaman
    function disburseLoan(uint256 _loanId)
        public
        onlyAdmin
        loanExists(_loanId)
        inStatus(_loanId, LoanStatus.Approved)
    {
        Loan storage loan = loans[_loanId];

        require(address(this).balance >= loan.principalAmount, "Saldo contract tidak cukup!");

        loan.deadline = block.timestamp + LOAN_DURATION;
        loan.status = LoanStatus.Active;

        (bool success, ) = loan.borrower.call{value: loan.principalAmount}("");
        require(success, "Transfer gagal!");

        emit LoanDisbursed(_loanId, loan.borrower, loan.principalAmount);
    }

    /// @notice Borrower membayar cicilan
    function makePayment(uint256 _loanId)
        public
        payable
        loanExists(_loanId)
        onlyBorrower(_loanId)
        inStatus(_loanId, LoanStatus.Active)
    {
        require(msg.value > 0, "Pembayaran harus lebih dari 0!");

        Loan storage loan = loans[_loanId];

        loan.amountRepaid += msg.value;

        uint256 remaining = 0;
        if (loan.totalAmount > loan.amountRepaid) {
            remaining = loan.totalAmount - loan.amountRepaid;
        }

        if (loan.amountRepaid >= loan.totalAmount) {
            loan.status = LoanStatus.Repaid;
            emit LoanRepaid(_loanId, msg.sender);
        }

        emit PaymentMade(_loanId, msg.sender, msg.value, remaining);
    }

    /// @notice Cek apakah pinjaman sudah default
    function checkDefault(uint256 _loanId)
        public
        loanExists(_loanId)
    {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.Active, "Loan tidak dalam status Active!");

        if (block.timestamp > loan.deadline && loan.amountRepaid < loan.totalAmount) {
            loan.status = LoanStatus.Defaulted;
            emit LoanDefaulted(_loanId, loan.borrower);
        }
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    function getLoanDetails(uint256 _loanId)
        public
        view
        loanExists(_loanId)
        returns (Loan memory)
    {
        return loans[_loanId];
    }

    function getMyLoans() public view returns (uint256[] memory) {
        return borrowerLoans[msg.sender];
    }

    function calculateInterest(uint256 _principal) public pure returns (uint256) {
        return (_principal * INTEREST_RATE) / 10000;
    }

    function getRemainingAmount(uint256 _loanId)
        public
        view
        loanExists(_loanId)
        returns (uint256)
    {
        Loan memory loan = loans[_loanId];

        if (loan.amountRepaid >= loan.totalAmount) {
            return 0;
        }

        return loan.totalAmount - loan.amountRepaid;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTotalLoans() public view returns (uint256) {
        return loanCounter;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    function depositFunds() public payable onlyAdmin {
        require(msg.value > 0, "Deposit harus lebih dari 0!");
        emit FundsDeposited(msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _amount) public onlyAdmin {
        require(_amount > 0, "Amount harus lebih dari 0!");
        require(address(this).balance >= _amount, "Saldo tidak cukup!");

        (bool success, ) = admin.call{value: _amount}("");
        require(success, "Withdraw gagal!");

        emit FundsWithdrawn(msg.sender, _amount);
    }

    function transferAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "Address tidak valid!");
        admin = _newAdmin;
    }

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}