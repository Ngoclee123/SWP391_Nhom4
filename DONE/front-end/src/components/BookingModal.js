function BookingModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Đặt lịch khám</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Họ và tên" className="w-full p-2 border rounded" />
          <input type="tel" placeholder="Số điện thoại" className="w-full p-2 border rounded" />
          <select className="w-full p-2 border rounded">
            <option>Chọn dịch vụ</option>
            <option>Khám nhi khoa</option>
            <option>Tư vấn trực tuyến</option>
            <option>Tiêm phòng</option>
          </select>
          <select className="w-full p-2 border rounded">
            <option>Chọn bác sĩ</option>
            <option>BS. Nguyễn Văn A</option>
            <option>BS. Trần Thị B</option>
            <option>BS. Lê Văn C</option>
          </select>
          <input type="date" className="w-full p-2 border rounded" />
          <input type="time" className="w-full p-2 border rounded" />
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Hủy</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;