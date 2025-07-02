import React, { useEffect, useState } from "react";
import axios from "../../api/axiosClient";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function VaccineStatistics() {
  const [stats, setStats] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [month, year]);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/vaccine-appointments/statistics?month=${month}&year=${year}`);
      setStats(res.data);
    } catch (e) {
      setError("Không thể tải thống kê. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  const typeLabels = stats ? Object.keys(stats.vaccineTypeCount || {}) : [];
  const typeData = stats ? Object.values(stats.vaccineTypeCount || {}) : [];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Thống kê Vaccine tháng {month}/{year}</h2>
      <div className="flex gap-4 mb-4">
        <label>
          Tháng:
          <input type="number" min={1} max={12} value={month} onChange={e => setMonth(Number(e.target.value))} className="ml-2 border rounded px-2 py-1 w-16" />
        </label>
        <label>
          Năm:
          <input type="number" min={2020} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} className="ml-2 border rounded px-2 py-1 w-20" />
        </label>
      </div>
      {loading ? (
        <div>Đang tải thống kê...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : stats ? (
        <>
          <div className="mb-6">
            <div className="text-lg font-semibold">Tổng doanh thu: <span className="text-blue-600">{stats.totalRevenue.toLocaleString()} VNĐ</span></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Số lượng từng loại vaccine</h3>
              <Bar
                data={{
                  labels: typeLabels,
                  datasets: [
                    {
                      label: "Số lượng đặt",
                      data: typeData,
                      backgroundColor: "#60a5fa"
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false }
                  }
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tỉ lệ loại vaccine</h3>
              <Pie
                data={{
                  labels: typeLabels,
                  datasets: [
                    {
                      label: "Tỉ lệ",
                      data: typeData,
                      backgroundColor: [
                        "#60a5fa",
                        "#fbbf24",
                        "#34d399",
                        "#f87171",
                        "#a78bfa",
                        "#f472b6",
                        "#facc15"
                      ]
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    title: { display: false }
                  }
                }}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default VaccineStatistics; 