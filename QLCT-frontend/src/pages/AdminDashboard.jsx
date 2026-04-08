import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllLogs = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/admin/transactions');
                setLogs(res.data);
            } catch (err) {
                console.error("Lỗi lấy dữ liệu Admin", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllLogs();
    }, []);

    const totalMoney = logs.reduce((sum, log) => sum + log.amount, 0);

    if (loading) return <div className="loading-screen">Đang tải dữ liệu tổng thể...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header admin-header">
                <div>
                    <h1 style={{color: '#ff7675'}}>HỆ THỐNG QUẢN TRỊ</h1>
                    <p style={{color: '#eee'}}>Chế độ kiểm soát giao dịch toàn hệ thống</p>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                    <button className="btn-submit" style={{padding: '8px 16px'}} onClick={() => window.location.href='/dashboard'}>Về Dashboard</button>
                    <button className="btn-logout-style" onClick={() => {localStorage.clear(); window.location.href='/login'}}>Đăng xuất</button>
                </div>
            </header>

            <div className="summary-cards">
                <div className="card admin-stat-card">
                    <h3>Tổng số giao dịch</h3>
                    <h2>{logs.length}</h2>
                </div>
                <div className="card admin-stat-card">
                    <h3>Dòng tiền lưu thông</h3>
                    <h2 className="text-green">{totalMoney.toLocaleString('vi-VN')} ₫</h2>
                </div>
            </div>

            <div className="admin-table-container">
                <h3 className="section-title">Chi tiết lịch sử hệ thống</h3>
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Người dùng</th>
                        <th>Mô tả</th>
                        <th>Số tiền</th>
                        <th>Ngày</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td><span className="user-badge">{log.userEmail || "N/A"}</span></td>
                            <td>{log.description}</td>
                            <td className={log.type === 'INCOME' ? 'text-green' : 'text-red'}>
                                {log.type === 'INCOME' ? '+' : '-'}{log.amount.toLocaleString('vi-VN')} ₫
                            </td>
                            <td>{log.date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminDashboard;