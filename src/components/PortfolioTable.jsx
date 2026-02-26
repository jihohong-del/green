import React from 'react';
import { Trash2 } from 'lucide-react';

const PortfolioTable = ({ stocks, onDelete }) => {
    const totalValue = stocks.reduce((sum, stock) => sum + stock.price * stock.quantity, 0);

    return (
        <div className="glass-card">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>보유 종목 리스트</h2>
            <div style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>종목 (코드)</th>
                            <th>현재가</th>
                            <th>수량</th>
                            <th>평가금액</th>
                            <th>비중 (%)</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((stock) => {
                            const value = stock.price * stock.quantity;
                            const weight = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;

                            return (
                                <tr key={stock.id}>
                                    <td style={{ fontWeight: 600 }}>
                                        {stock.name}
                                        {stock.code && <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{stock.code}</span>}
                                    </td>
                                    <td>
                                        {stock.price.toLocaleString()}원
                                        {stock.currency === 'USD' && (
                                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#10b981' }}>
                                                (USD 연동됨)
                                            </span>
                                        )}
                                    </td>
                                    <td>{stock.quantity.toLocaleString()}</td>
                                    <td>{value.toLocaleString()}원</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ flex: 1, height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${weight}%`, height: '100%', background: '#3b82f6' }} />
                                            </div>
                                            <span style={{ minWidth: '45px', textAlign: 'right' }}>{weight}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button onClick={() => onDelete(stock.id)} className="btn-danger">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {stocks.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    등록된 종목이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PortfolioTable;
