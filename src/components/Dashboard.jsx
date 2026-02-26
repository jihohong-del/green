import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

const Dashboard = ({ stocks }) => {
    const [chartType, setChartType] = useState('pie');

    const data = stocks.map(stock => ({
        name: stock.name,
        value: Number(stock.price) * Number(stock.quantity)
    })).sort((a, b) => b.value - a.value);

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#1e293b', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#f8fafc' }}>{payload[0].name}</p>
                    <p style={{ margin: '0.25rem 0 0', color: '#3b82f6', fontWeight: 700 }}>
                        {payload[0].value.toLocaleString()}원
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                        비중: {((payload[0].value / totalValue) * 100).toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>포트폴리오 분석</h2>
                <div style={{ display: 'flex', background: '#1e293b', padding: '0.25rem', borderRadius: '0.5rem' }}>
                    <button
                        onClick={() => setChartType('pie')}
                        style={{
                            background: chartType === 'pie' ? '#334155' : 'transparent',
                            border: 'none', color: 'white', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center'
                        }}
                    >
                        <PieIcon size={16} />
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        style={{
                            background: chartType === 'bar' ? '#334155' : 'transparent',
                            border: 'none', color: 'white', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center'
                        }}
                    >
                        <BarChart3 size={16} />
                    </button>
                </div>
            </div>

            <div style={{ height: '350px', width: '100%', position: 'relative' }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'pie' ? (
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={800}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    labelLine={true}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        ) : (
                            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40, top: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="right"
                                        content={(props) => {
                                            const { x, y, width, value } = props;
                                            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
                                            return (
                                                <text x={x + width + 5} y={y + 16} fill="#94a3b8" fontSize={11} textAnchor="start">
                                                    {percentage}%
                                                </text>
                                            );
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                        데이터가 없습니다.
                    </div>
                )}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>총 자산 가치</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0', color: '#f8fafc' }}>
                    {totalValue.toLocaleString()}원
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
