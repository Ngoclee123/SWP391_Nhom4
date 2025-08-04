import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Eye, Trash2, CheckCircle } from 'lucide-react';

const FEEDBACKS_PER_PAGE = 7;

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ratingFilter, setRatingFilter] = useState(null); // null = tất cả
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/api/admin/feedbacks');
      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Không thể tải danh sách feedback');
    } finally {
      setLoading(false);
    }
  };

  // Đếm số lượng feedback cho từng mức rating (trên toàn bộ feedbacks)
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: feedbacks.filter(fb => fb.rating === star).length
  }));

  // Lọc feedback theo rating (trên toàn bộ feedbacks)
  const filteredFeedbacks = ratingFilter
    ? feedbacks.filter(fb => fb.rating === ratingFilter)
    : feedbacks;

  // Phân trang phía client
  const totalPages = Math.ceil(filteredFeedbacks.length / FEEDBACKS_PER_PAGE);
  const paginatedFeedbacks = filteredFeedbacks.slice((currentPage - 1) * FEEDBACKS_PER_PAGE, currentPage * FEEDBACKS_PER_PAGE);

  // Khi filter đổi thì về trang 1
  useEffect(() => { setCurrentPage(1); }, [ratingFilter]);

  // Thao tác xóa và đánh dấu đã đọc (dùng API admin)
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa feedback này?')) return;
    try {
      await axiosClient.delete(`/api/admin/feedbacks/${id}`);
      fetchFeedbacks();
    } catch (err) {
      setError('Xóa feedback thất bại');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axiosClient.put(`/api/admin/feedbacks/${id}/read`);
      fetchFeedbacks();
    } catch (err) {
      setError('Đánh dấu đã đọc thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Quản lý Feedback</h2>
      {loading && <div className="text-blue-600">Đang tải dữ liệu...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded border ${ratingFilter === null ? 'border-red-500 text-red-600 font-semibold bg-red-50' : 'border-gray-200 text-gray-700 bg-white'} transition`}
          onClick={() => setRatingFilter(null)}
        >
          Tất Cả
        </button>
        {ratingCounts.map(({ star, count }) => (
          <button
            key={star}
            className={`px-4 py-2 rounded border ${ratingFilter === star ? 'border-red-500 text-red-600 font-semibold bg-red-50' : 'border-gray-200 text-gray-700 bg-white'} transition`}
            onClick={() => setRatingFilter(star)}
          >
            {star} Sao ({count})
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Parent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Doctor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nội dung</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đã đọc</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {(Array.isArray(paginatedFeedbacks) ? paginatedFeedbacks : []).map(fb => (
              <tr key={fb.feedbackId}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{fb.feedbackId}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{fb.parentName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{fb.doctorName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{fb.comment}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-600 font-semibold">{fb.rating}</td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {fb.isRead ? <CheckCircle className="inline w-5 h-5 text-green-500" /> : <span className="inline-block w-3 h-3 bg-red-400 rounded-full" title="Chưa đọc"></span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                  {!fb.isRead && <button title="Đánh dấu đã đọc" onClick={() => handleMarkAsRead(fb.feedbackId)} className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600"><CheckCircle /></button>}
                  <button title="Xóa" onClick={() => handleDelete(fb.feedbackId)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"><Trash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4 bg-gray-50 border-t border-gray-200">
          <button
            className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          
          {/* Hiển thị các trang */}
          {(() => {
            const pages = [];
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            // Điều chỉnh startPage nếu endPage quá gần cuối
            if (endPage - startPage + 1 < maxVisiblePages) {
              startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            // Thêm trang đầu nếu cần
            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
              );
              if (startPage > 2) {
                pages.push(
                  <span key="ellipsis1" className="px-2 text-gray-500">...</span>
                );
              }
            }
            
            // Thêm các trang chính
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    currentPage === i 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i}
                </button>
              );
            }
            
            // Thêm trang cuối nếu cần
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="ellipsis2" className="px-2 text-gray-500">...</span>
                );
              }
              pages.push(
                <button
                  key={totalPages}
                  className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              );
            }
            
            return pages;
          })()}
          
          <button
            className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button onClick={() => setSelected(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">×</button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">Chi tiết Feedback #{selected.id}</h3>
            <div className="space-y-2">
              <p><b>Parent:</b> {selected.parent ? selected.parent.fullName : ''}</p>
              <p><b>Doctor:</b> {selected.doctor ? selected.doctor.fullName : ''}</p>
              <p><b>Rating:</b> <span className="text-yellow-600 font-semibold">{selected.rating}</span></p>
              <p><b>Nội dung:</b> {selected.comment}</p>
              <p><b>Ngày gửi:</b> {selected.createdAt ? new Date(selected.createdAt).toISOString().slice(0, 10) : ''}</p>
              <p><b>Đã đọc:</b> {selected.isRead ? 'Đã đọc' : 'Chưa đọc'}</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              {!selected.isRead && <button onClick={() => { handleMarkAsRead(selected.id); setSelected(null); }} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Đánh dấu đã đọc</button>}
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Đóng</button>
              <button onClick={() => { handleDelete(selected.id); setSelected(null); }} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement; 