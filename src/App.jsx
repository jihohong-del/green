import React, { useState, useEffect } from 'react';
import PortfolioForm from './components/PortfolioForm';
import PortfolioTable from './components/PortfolioTable';
import Dashboard from './components/Dashboard';
import { TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import { fetchMultipleStockPrices } from './utils/stockApi';

function App() {
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('portfolio');
    return saved ? JSON.parse(saved) : [];
  });

  const [exchangeRate, setExchangeRate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    const getInitialRate = async () => {
      const { fetchExchangeRate } = await import('./utils/stockApi');
      const rate = await fetchExchangeRate();
      setExchangeRate(rate);
    };
    getInitialRate();
  }, []);

  const addStock = (stock) => {
    setStocks([...stocks, stock]);
  };

  const deleteStock = (id) => {
    setStocks(stocks.filter(s => s.id !== id));
  };

  const refreshPrices = async () => {
    if (stocks.length === 0 || isRefreshing) return;

    setIsRefreshing(true);
    try {
      const { updatedStocks, exchangeRate: newRate } = await fetchMultipleStockPrices(stocks);
      setExchangeRate(newRate);

      if (updatedStocks.length > 0) {
        setStocks(prevStocks => prevStocks.map(stock => {
          const updatedInfo = updatedStocks.find(u => u.code === stock.code);
          if (updatedInfo) {
            let finalPrice = updatedInfo.price;
            // USD 종목인 경우 환율 적용 (대소문자 무시)
            const currency = (updatedInfo.currency || '').toUpperCase();
            if (currency === 'USD') {
              finalPrice = updatedInfo.price * newRate;
            }
            return { ...stock, price: finalPrice, currency: currency };
          }
          return stock;
        }));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ background: '#3b82f6', padding: '0.75rem', borderRadius: '1rem' }}>
          <TrendingUp size={32} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800 }}>Stock Portfolio</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ margin: 0, color: '#94a3b8' }}>자산 비중 관리 및 시각화 대시보드</p>
            {exchangeRate && (
              <span style={{ fontSize: '0.8125rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                USD/KRW: {exchangeRate.toLocaleString()}원
              </span>
            )}
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={refreshPrices}
          disabled={isRefreshing || stocks.filter(s => s.code).length === 0}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: (isRefreshing || stocks.filter(s => s.code).length === 0) ? 0.6 : 1
          }}
        >
          {isRefreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          현재가 업데이트
        </button>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <PortfolioForm onAdd={addStock} />
          <PortfolioTable stocks={stocks} onDelete={deleteStock} />
        </div>

        <div style={{ position: 'sticky', top: '2rem' }}>
          <Dashboard stocks={stocks} />
        </div>
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: '#475569', fontSize: '0.875rem' }}>
        © {new Date().getFullYear()} Stock Portfolio Dashboard. Built with React & Recharts.
      </footer>
    </div>
  );
}

export default App;
