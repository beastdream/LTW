import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLoginPhone = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/public/login', {
                phoneNumber: phone,
                password: password
            });
            if (response.data) {
                // Lưu user vào localStorage để App.jsx nhận biết phiên đăng nhập
                localStorage.setItem('user', JSON.stringify(response.data));
                // Điều hướng dựa trên quyền hạn (Role)
                window.location.href = response.data.role === 'ADMIN' ? '/admin' : '/dashboard';
            }
        } catch (err) {
            alert(err.response?.data || "Sai số điện thoại hoặc mật khẩu!");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Đăng Nhập</h1>
                <p>Quản lý chi tiêu thông minh và hiệu quả</p>

                <form onSubmit={handleLoginPhone} className="transaction-form">
                    <input
                        type="text"
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-login-phone">Đăng nhập ngay</button>
                </form>

                <div style={{ margin: '20px 0', color: '#b2bec3', fontSize: '14px' }}>HOẶC</div>

                <button
                    className="btn-google"
                    onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
                >
                    <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="google" width="20" />
                    Tiếp tục với Google
                </button>

                <p style={{ marginTop: '25px', fontSize: '14px' }}>
                    Chưa có tài khoản? <span onClick={() => navigate('/register')} style={{ color: '#4361ee', cursor: 'pointer', fontWeight: '600' }}>Đăng ký ngay</span>
                </p>
            </div>
        </div>
    );
};

export default Login;