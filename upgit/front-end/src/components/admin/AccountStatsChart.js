import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import userService from '../../service/userService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AccountStatsChart = () => {
    const [accountStats, setAccountStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAccountStats();
    }, []);

    const fetchAccountStats = async () => {
        try {
            setLoading(true);
            const response = await userService.getAccountStats();
            const data = Array.isArray(response) ? response : response?.data;
            if (Array.isArray(data)) {
                setAccountStats(data);
                setError(null);
            } else {
                setAccountStats([]);
                setError('Không thể tải dữ liệu thống kê');
            }
        } catch (err) {
            setAccountStats([]);
            setError('Không thể tải dữ liệu thống kê');
            console.error('Error fetching account stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalAccounts = accountStats.reduce((sum, item) => sum + item.count, 0);

    const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 20;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        const role = accountStats[index]?.role;
        const count = accountStats[index]?.count;
        return (
            <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${role}: ${(percent * 100).toFixed(0)}% (${count})`}
            </text>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500 text-center">
                    <p>{error}</p>
                    <button 
                        onClick={fetchAccountStats}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!Array.isArray(accountStats) || accountStats.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Không có dữ liệu thống kê</p>
            </div>
        );
    }

   return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Thống kê tài khoản theo vai trò
        </h3>
        <div className="w-full h-[300px] sm:h-[360px] md:h-[400px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={accountStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="count"
                        nameKey="role"
                        labelLine={false}
                        label={renderLabel}
                        cornerRadius={8}
                    >
                        {accountStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} tài khoản`} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
            Tổng cộng: <span className="font-bold">{totalAccounts}</span> tài khoản
        </div>
    </div>
);

};

export default AccountStatsChart;
