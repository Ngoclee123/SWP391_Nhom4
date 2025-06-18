import React from 'react';

const Feedback = () => {
  const feedbacks = [
    { id: 1, parent: "Nguyen Thi A", rating: 5, comment: "Bác sĩ rất tận tâm!" },
    { id: 2, parent: "Tran Van C", rating: 4, comment: "Dịch vụ tốt, cần cải thiện thời gian chờ." },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Phản hồi / Đánh giá</h2>
      <div className="space-y-4">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">{fb.parent}</p>
            <p className="text-yellow-500">{'★'.repeat(fb.rating)}</p>
            <p>{fb.comment}</p>
          </div>
        ))}
      </div>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Xem tất cả
      </button>
    </div>
  );
};

export default Feedback;