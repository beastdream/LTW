import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'

axios.defaults.withCredentials = true;
const API_BASE_URL = 'http://localhost:8080';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user`);
      if (response.data && !response.data.error) {
        setUser(response.data);
      } else {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
      }
    } catch {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkLoginStatus();
  }, [checkLoginStatus]);

  if (loading) return <div className="loading-screen">Đang tải hệ thống...</div>;

  return (
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'ADMIN' ? "/admin" : "/dashboard"} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <UserDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
  );
}

function UserDashboard({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Ăn uống');
  const [type, setType] = useState('EXPENSE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchTransactions = useCallback(async () => {
    const identifier = user.email || user.phoneNumber;
    if (!identifier) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/transactions?identifier=${identifier}`);
      setTimeout(() => { setTransactions(res.data); }, 0);
    } catch (err) {
      console.error(err);
    }
  }, [user.email, user.phoneNumber]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    const identifier = user.email || user.phoneNumber;
    try {
      const newTransaction = {
        description,
        amount: parseFloat(amount),
        category,
        type,
        date,
        userEmail: identifier
      };
      await axios.post(`${API_BASE_URL}/api/transactions`, newTransaction);
      setDescription('');
      setAmount('');
      await fetchTransactions();
    } catch {
      alert("Lỗi thêm giao dịch");
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h2>Xin chào, {user.fullName || user.name}! 👋</h2>
            <p style={{ color: '#636e72', fontSize: '14px' }}>{user.email || user.phoneNumber}</p>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="btn-logout-style">
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
          <div className="form-section">
            <h3 className="section-title">Thêm giao dịch mới</h3>
            <form onSubmit={(e) => { void handleSubmit(e); }} className="transaction-form">
              <input placeholder="Mô tả (Ví dụ: Đi chơi nét)" value={description} onChange={e => setDescription(e.target.value)} required />
              <input type="number" placeholder="Số tiền" value={amount} onChange={e => setAmount(e.target.value)} required />
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Ăn uống">Ăn uống</option>
                <option value="Di chuyển">Di chuyển</option>
                <option value="Lương">Lương</option>
                <option value="Khác">Khác</option>
              </select>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="EXPENSE">Khoản Chi</option>
                <option value="INCOME">Khoản Thu</option>
              </select>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              <button type="submit" className="btn-submit">Lưu Giao Dịch</button>
            </form>
          </div>

          <div className="table-section">
            <h3 className="section-title">Lịch sử cá nhân</h3>
            <div style={{overflowX: 'auto'}}>
              <table className="transaction-table">
                <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                </tr>
                </thead>
                <tbody>
                {transactions.length === 0 ? (
                    <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>Chưa có giao dịch.</td></tr>
                ) : (
                    transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.date}</td>
                          <td>{t.description}</td>
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
      </div>
  );
}

export default App;