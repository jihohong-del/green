import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { fetchStockPrice } from '../utils/stockApi';

const PortfolioForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchInfo = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;
    setIsLoading(true);
    try {
      const info = await fetchStockPrice(trimmedCode);
      if (info) {
        setName(info.name);
        setPrice(info.price.toString());
        // 통화 정보는 나중에 handleSubmit에서 자동 계산됨
      } else {
        alert(`'${trimmedCode}' 종목 정보를 불러올 수 없습니다. 코드가 정확한지 확인해 주세요.`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !quantity) return;

    const isKoreanStock = /^[0-9]{6}$/.test(code);

    onAdd({
      id: Date.now(),
      name,
      code,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      currency: isKoreanStock ? 'KRW' : 'USD' // 초기 통화 설정
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="예: 005930 또는 AAPL"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              maxLength={10}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleFetchInfo}
              disabled={!code || isLoading}
              style={{
                padding: '0 0.75rem',
                fontSize: '0.75rem',
                background: '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                opacity: (!code || isLoading) ? 0.5 : 1
              }}
            >
              {isLoading ? '...' : '불러오기'}
            </button>
          </div>
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
