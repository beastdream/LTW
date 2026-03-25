import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Đảm bảo trình duyệt luôn gửi kèm session/cookie khi gọi API
axios.defaults.withCredentials = true;

// Địa chỉ backend Spring Boot (Sau này up backend lên server thì đổi URL này)
const API_BASE_URL = 'https://tracker-rkd1.onrender.com';

function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // State quản lý dữ liệu Form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Ăn uống');
  const [type, setType] = useState('EXPENSE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Lấy ngày hôm nay làm mặc định

  // Chạy 1 lần duy nhất khi vừa mở web
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user`);
      if (response.data && response.data.email) {
        setUser(response.data);
        fetchTransactions(); // Nếu đã đăng nhập thành công thì đi kéo dữ liệu về
      }
    } catch (error) {
      console.log("Người dùng chưa đăng nhập");
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Lỗi khi kéo dữ liệu chi tiêu", error);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };
  const handleLogout = () => {
    // Chuyển hướng người dùng sang Backend để nó xóa Cookie, sau đó Backend sẽ tự động đá người dùng về lại Vercel
    window.location.href = `${API_BASE_URL}/logout`;
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); // Chặn việc web bị load lại khi bấm submit form
    try {
      const newTransaction = {
        description,
        amount: parseFloat(amount),
        category,
        type,
        date
      };
      // Gọi API POST sang Spring Boot để lưu vào MySQL
      await axios.post(`${API_BASE_URL}/api/transactions`, newTransaction);
      
      // Thành công thì kéo dữ liệu mới nhất về hiển thị lại bảng
      fetchTransactions(); 
      
      // Xóa trắng form để nhập cái mới
      setDescription('');
      setAmount('');
    } catch (error) {
      console.error("Lỗi khi thêm giao dịch mới", error);
      alert("Không thể thêm giao dịch, hãy kiểm tra lại kết nối mạng!");
    }
  };

  // --- MÀN HÌNH 1: NẾU CHƯA ĐĂNG NHẬP ---
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Quản Lý Chi Tiêu</h1>
          <p>Hệ thống theo dõi ngân sách thông minh</p>
          <button onClick={handleLogin} className="btn-google">
            Đăng nhập bằng Gmail
          </button>
        </div>
      </div>
    );
  }

  // Tính toán dữ liệu cho các thẻ thống kê
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // --- MÀN HÌNH 2: DASHBOARD (ĐÃ ĐĂNG NHẬP) ---
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2>Xin chào, {user.name}! 👋</h2>
          <p style={{ color: '#7f8c8d', marginTop: '5px' }}>{user.email}</p>
        </div>
        {/* Nút đăng xuất thêm vào đây */}
        <button 
          onClick={handleLogout} 
          style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Đăng xuất
        </button>
      </header>

      <div className="summary-cards">
        <div className="card balance">
          <h3>Tổng số dư</h3>
          <h2>{balance.toLocaleString('vi-VN')} ₫</h2>
        </div>
        <div className="card income">
          <h3>Tổng thu nhập</h3>
          <h2>+{totalIncome.toLocaleString('vi-VN')} ₫</h2>
        </div>
        <div className="card expense">
          <h3>Tổng chi phí</h3>
          <h2>-{totalExpense.toLocaleString('vi-VN')} ₫</h2>
        </div>
      </div>

      <div className="main-content">
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <div className="form-section">
          <h3 className="section-title">Thêm giao dịch mới</h3>
          <form onSubmit={handleSubmit} className="transaction-form">
            <input type="text" placeholder="Mô tả (VD: Đi siêu thị Coopmart)" value={description} onChange={e => setDescription(e.target.value)} required />
            <input type="number" placeholder="Số tiền (VD: 50000)" value={amount} onChange={e => setAmount(e.target.value)} required />
            
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Ăn uống">Ăn uống (Food)</option>
              <option value="Di chuyển">Di chuyển (Transport)</option>
              <option value="Hóa đơn">Hóa đơn (Bills)</option>
              <option value="Mua sắm">Mua sắm (Shopping)</option>
              <option value="Lương">Lương (Salary)</option>
              <option value="Khác">Khác (Other)</option>
            </select>

            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="EXPENSE">Khoản Chi (Expense)</option>
              <option value="INCOME">Khoản Thu (Income)</option>
            </select>

            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <button type="submit" className="btn-submit">Lưu Giao Dịch</button>
          </form>
        </div>

        {/* CỘT PHẢI: BẢNG DỮ LIỆU */}
        <div className="table-section">
          <h3 className="section-title">Lịch sử giao dịch</h3>
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mô tả</th>
                <th>Danh mục</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#7f8c8d'}}>
                    Chưa có giao dịch nào. Hãy thêm một khoản mới bên trái!
                  </td>
                </tr>
              ) : (
                // Sắp xếp ngày mới nhất lên đầu bảng
                transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.description}</td>
                    <td>{t.category}</td>
                    <td className={t.type === 'INCOME' ? 'text-green' : 'text-red'}>
                      {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App