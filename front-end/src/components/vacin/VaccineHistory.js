import React, { useEffect, useState } from 'react';
import VaccineAppointmentService from '../../service/VaccineAppointmentService';

const VaccineHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await VaccineAppointmentService.getHistory();
                setHistory(response.data);
            } catch (error) {
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <p>Đang tải lịch sử...</p>;
    if (!history.length) return <p>Không có lịch sử đặt vaccin.</p>;

    return (
        <div className="p-4 mt-24">
            <h2 className="text-xl font-bold mb-4">Lịch sử đặt vaccin</h2>
            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border px-2">Hình ảnh</th>
                            <th className="border px-2">Vaccine</th>
                            <th className="border px-2">Ngày hẹn</th>
                            <th className="border px-2">Địa điểm</th>
                            <th className="border px-2">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.vaccineAppointmentId}>
                                <td>
                                {item.vaccineImage
                                    ? <img src={item.vaccineImage} alt="Vaccine" className="w-16 h-16 object-cover" />
                                    : <span className="text-gray-400">Không có</span>
                                }
                                </td>
                                <td className="border px-2">{item.vaccineName}</td>
                                <td className="border px-2">{new Date(item.appointmentDate).toLocaleString('vi-VN')}</td>
                                <td className="border px-2">{item.location}</td>
                                <td className="border px-2">{item.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VaccineHistory; 