// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

// Import các thư viện từ OpenZeppelin để sử dụng trong hợp đồng
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

// Định nghĩa hợp đồng LiquidityTrustProtocol, kế thừa các hợp đồng ERC20, Ownable, và ReentrancyGuard
contract LiquidityTrustProtocol is ERC20, Ownable, ReentrancyGuard {
    using Address for address payable; // Sử dụng thư viện Address cho các địa chỉ có thể trả ETH

    // Định nghĩa hằng số giá LTP tính theo ETH
    uint256 public constant PRICE_PER_LTP = 0.0001 ether;

    // Khai báo biến mapping để lưu trữ số dư ETH của người dùng
    mapping(address => uint256) public ethBalances;

    // Hàm khởi tạo hợp đồng, đặt tên token và ký hiệu, đồng thời mint 1,000,000 LTP cho chủ sở hữu
    constructor() ERC20("Liquidity Trust Protocol", "LTP") Ownable() {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    // Hàm mint thêm LTP cho chủ sở hữu, chỉ có thể gọi bởi chủ sở hữu
    function mintToOwner(uint256 amount) external onlyOwner {
        _mint(owner(), amount);
    }

    // Hàm cho phép người dùng mua LTP trực tiếp bằng ETH
    function buyLTP() external payable nonReentrant {
        require(msg.value > 0, "No ETH sent"); // Kiểm tra người dùng có gửi ETH hay không

        // Tính số lượng LTP dựa trên số ETH gửi
        uint256 ltpAmount = msg.value / 10 ** 14;

        // Kiểm tra chủ sở hữu có đủ số dư LTP để chuyển hay không
        require(
            balanceOf(owner()) >= ltpAmount,
            "Insufficient LTP balance in owner account"
        );

        // Lưu trữ số dư ETH của người gửi
        ethBalances[msg.sender] += msg.value;

        // Chuyển LTP từ chủ sở hữu đến người mua
        _transfer(owner(), msg.sender, ltpAmount * 1 ether);
    }

    // Hàm cho phép người dùng bán LTP để nhận lại ETH
    function sellLTP(uint256 amount) external nonReentrant {
        require(balanceOf(msg.sender) >= amount, "Insufficient LTP balance"); // Kiểm tra số dư LTP của người dùng

        // Tính số ETH tương ứng để chuyển
        uint256 ethAmount = (((amount * 97) / 100) / 1 ether) * 10 ** 14;

        // Kiểm tra hợp đồng có đủ số dư ETH để chuyển hay không
        require(
            address(this).balance >= ethAmount,
            "Insufficient contract ETH balance"
        );

        // Chuyển LTP từ người bán đến chủ sở hữu
        _transfer(msg.sender, owner(), amount);

        // Gửi ETH cho người bán
        payable(msg.sender).sendValue(ethAmount);
    }

    // Hàm cho phép chuyển LTP nội bộ giữa các người dùng
    function transferLTP(
        address recipient,
        uint256 amount
    ) external nonReentrant {
        require(balanceOf(msg.sender) >= amount, "Insufficient LTP balance"); // Kiểm tra số dư LTP của người gửi

        // Chuyển LTP từ người gửi đến người nhận
        _transfer(msg.sender, recipient, amount);
    }

    // Hàm cho phép chủ sở hữu rút ETH từ hợp đồng
    function withdrawETH(uint256 amount) external onlyOwner {
        require(
            address(this).balance >= amount,
            "Insufficient contract ETH balance"
        ); // Kiểm tra số dư ETH của hợp đồng
        payable(owner()).sendValue(amount); // Gửi ETH cho chủ sở hữu
    }

    // Hàm cho phép chủ sở hữu xem số dư ETH của hợp đồng
    function getContractEthBalance() external view onlyOwner returns (uint256) {
        return address(this).balance; // Trả về số dư ETH của hợp đồng
    }

    // Hàm fallback để nhận ETH
    receive() external payable {}
}
