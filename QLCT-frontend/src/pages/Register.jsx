import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ phoneNumber: '', password: '', fullName: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/public/register', formData);
            alert("Đăng ký thành công! Hãy đăng nhập để bắt đầu.");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data || "Có lỗi xảy ra khi đăng ký!");
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Tham Gia Ngay</h2>
                <p>Bắt đầu kiểm soát tài chính cá nhân của bạn</p>

                <form onSubmit={handleSubmit} className="transaction-form">
                    <input
                        type="text"
                        placeholder="Họ và tên"
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Số điện thoại"
                        onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        required
                    />
                    <button type="submit" className="btn-submit">Xác nhận đăng ký</button>
                </form>

                <p onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#4361ee', marginTop: '20px', fontSize: '14px' }}>
                    Đã có tài khoản? <strong>Đăng nhập ngay</strong>
                </p>
            </div>
        </div>
    );
};

export default Register;