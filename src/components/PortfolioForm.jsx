import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const PortfolioForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !quantity) return;

    onAdd({
      id: Date.now(),
      name,
      code, // 종목 코드 추가
      price: parseFloat(price),
      quantity: parseFloat(quantity),
    });

    setName('');
    setCode('');
    setPrice('');
    setQuantity('');
  };

  const handlePriceChange = (e) => {
    // 숫자가 아닌 문자 제거 (콤마 제거 포함)
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPrice(value);
  };

  const formatPrice = (val) => {
    if (!val) return '';
    return Number(val).toLocaleString();
  };

  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PlusCircle size={24} color="#3b82f6" />
        종목 추가
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>종목명</label>
          <input
            type="text"
            placeholder="예: 삼성전자"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>종목코드 (옵션)</label>
          <input
            type="text"
            placeholder="예: 005930 또는 AAPL"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            maxLength={10}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>현재가 / 평단가</label>
          <input
            type="text"
            placeholder="0"
            value={formatPrice(price)}
            onChange={handlePriceChange}
            required
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>보유 수량</label>
          <input
            type="number"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0.625rem' }}>
          추가하기
        </button>
      </form>
    </div>
  );
};

export default PortfolioForm;
