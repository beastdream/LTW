import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// Import icon mơi: TrendUp cho thu nhập, TrendDown cho chi tiêu
import { FiArrowUpRight, FiArrowDownLeft, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'

axios.defaults.withCredentials = true;
const API_BASE_URL = 'http://localhost:8080';

const getTransactionIcon = (type) => {
  if (type === 'INCOME') {
    return <FiTrendingUp style={{ color: '#2ecc71', fontSize: '20px' }} />;
  } else {
    return <FiTrendingDown style={{ color: '#e74c3c', fontSize: '20px' }} />;
  }
};

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
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [user.email, user.phoneNumber]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const barData = useMemo(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const data = months.map(m => ({ name: m, thu: 0, chi: 0 }));
    transactions.forEach(t => {
      const mIdx = new Date(t.date).getMonth();
      if (t.type === 'INCOME') data[mIdx].thu += t.amount;
      else data[mIdx].chi += t.amount;
    });
    return data;
  }, [transactions]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;

  const pieData = useMemo(() => [
    { name: 'Thu nhập', value: totalIncome },
    { name: 'Chi tiêu', value: totalExpense }
  ], [totalIncome, totalExpense]);

  const PIE_COLORS = ['#2ecc71', '#e74c3c'];

  // --- LOGIC 3: BIẾN ĐỘNG 6 THÁNG (CẬP NHẬT TỰ ĐỘNG THEO DỮ LIỆU) ---
  const recentStats = useMemo(() => {
    const result = [];

    // Tìm mốc thời gian mới nhất từ dữ liệu, mặc định là hôm nay nếu chưa có data
    let latestDate = new Date();
    if (transactions.length > 0) {
      const dates = transactions.map(t => new Date(t.date).getTime());
      latestDate = new Date(Math.max(...dates));
    }

    // Lùi lại 7 tháng từ mốc mới nhất để tính toán biến động
    for (let i = 6; i >= 0; i--) {
      const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      const mTrans = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === m && td.getFullYear() === y;
      });

      const thu = mTrans.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const chi = mTrans.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

      result.push({
        label: `T${m + 1}/${y.toString().slice(-2)}`,
        thu,
        chi
      });
    }

    const formatValue = (value) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
      return value.toString();
    };

    return result.slice(1).map((item, idx) => {
      const prev = result[idx];
      const calcChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        const change = ((current - previous) / previous) * 100;
        return Math.min(change, 999);
      };
      return {
        ...item,
        thuFormatted: formatValue(item.thu),
        chiFormatted: formatValue(item.chi),
        thuChange: calcChange(item.thu, prev.thu),
        chiChange: calcChange(item.chi, prev.chi)
      };
    });
  }, [transactions]);

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    const identifier = user.email || user.phoneNumber;
    try {
      const newTransaction = { description, amount: parseFloat(amount), category, type, date, userEmail: identifier };
      await axios.post(`${API_BASE_URL}/api/transactions`, newTransaction);
      setDescription(''); setAmount('');
      await fetchTransactions();
    } catch { alert("Lỗi thêm giao dịch"); }
  };

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
          <div className="card balance"><h3>Tổng số dư</h3><h2>{balance.toLocaleString('vi-VN')} ₫</h2></div>
          <div className="card income"><h3>Tổng thu nhập</h3><h2>+{totalIncome.toLocaleString('vi-VN')} ₫</h2></div>
          <div className="card expense"><h3>Tổng chi phí</h3><h2>-{totalExpense.toLocaleString('vi-VN')} ₫</h2></div>
        </div>

        <div className="charts-layout">
          <div className="chart-card bar-chart-box">
            <h3 className="section-title">Xu hướng hàng tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(v) => `${v.toLocaleString()} ₫`} />
                <Legend />
                <Bar dataKey="thu" name="Thu nhập" fill="#2ecc71" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chi" name="Chi tiêu" fill="#e74c3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card pie-chart-box">
            <h3 className="section-title">Tỷ lệ Thu nhập / Chi tiêu</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v.toLocaleString()} ₫`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="recent-stats-container">
          <h3 className="section-title">Biến động 6 tháng gần nhất</h3>
          <div className="recent-stats-grid">
            {recentStats.map((stat, i) => (
                <div className="stat-mini-card" key={i}>
                  <div className="stat-month">{stat.label}</div>
                  <div className="stat-item">
                    <span className="stat-label">Thu nhập</span>
                    <div className="stat-value-box">
                      <span className="text-green">{stat.thuFormatted}</span>
                      <div className={`change-badge ${stat.thuChange >= 0 ? 'bg-green-light' : 'bg-red-light'}`}>
                        {stat.thuChange >= 0 ? <FiArrowUpRight /> : <FiArrowDownLeft />}
                        {Math.abs(stat.thuChange).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Chi tiêu</span>
                    <div className="stat-value-box">
                      <span className="text-red">{stat.chiFormatted}</span>
                      <div className={`change-badge ${stat.chiChange > 0 ? 'bg-red-light' : 'bg-green-light'}`}>
                        {stat.chiChange > 0 ? <FiArrowUpRight /> : <FiArrowDownLeft />}
                        {Math.abs(stat.chiChange).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="stat-bar-bg">
                    <div className="stat-bar-fill" style={{ width: `${stat.thu + stat.chi > 0 ? (stat.thu/(stat.thu+stat.chi))*100 : 0}%` }}></div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          <div className="form-section">
            <h3 className="section-title">Thêm giao dịch mới</h3>
            <form onSubmit={handleSubmit} className="transaction-form">
              <input placeholder="Mô tả" value={description} onChange={e => setDescription(e.target.value)} required />
              <input type="number" placeholder="Số tiền" value={amount} onChange={e => setAmount(e.target.value)} required />
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Ăn uống">Ăn uống</option>
                <option value="Di chuyển">Di chuyển</option>
                <option value="Mua sắm">Mua sắm</option>
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

          <div className="table-section personal-history">
            <h3 className="section-title">Lịch sử cá nhân</h3>
            <div className="history-list">
              {transactions.length === 0 ? (
                  <div className="no-data">Chưa có giao dịch.</div>
              ) : (
                  transactions.sort((a,b) => new Date(b.date) - new Date(a.date)).map((t) => (
                      <div className="history-item-card" key={t.id}>
                        <div className="item-icon-box" style={{ background: t.type === 'INCOME' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)' }}>
                          {getTransactionIcon(t.type)}
                        </div>
                        <div className="item-info">
                          <div className="item-date">{t.date}</div>
                          <div className="item-description">{t.description}</div>
                        </div>
                        <div className={`item-amount ${t.type === 'INCOME' ? 'text-green' : 'text-red'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;