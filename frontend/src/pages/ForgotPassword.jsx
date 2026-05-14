import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Emel tidak dijumpai.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fd] p-4 font-sans">
      <div className="w-full max-w-md p-10 bg-white rounded-[2.5rem] shadow-xl border border-white text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 mx-auto">
          <KeyRound size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Lupa Password?</h2>
        <p className="text-slate-400 text-sm mb-8">Masukkan emel berdaftar anda.</p>

        <form onSubmit={handleReset} className="space-y-4 text-left">
          <input 
            type="email" placeholder="Emel anda"
            className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-400 focus:outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)} required
          />
          {message && <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-bold border border-green-100">{message}</div>}
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
          <button className="w-full bg-[#638cf0] hover:bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200">Check Password</button>
        </form>

        <button onClick={() => navigate('/login')} className="mt-8 flex items-center gap-2 text-slate-400 text-sm font-bold hover:text-blue-600 mx-auto">
          <ArrowLeft size={16} /> Kembali ke Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;