import React, { useEffect, useState } from 'react';
import MedicalRecordService from '../../service/MedicalRecordService';

const initialForm = {
  patientId: '',
  doctorId: '',
  appointmentId: '',
  recordDate: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  weight: '',
  height: '',
  medicalNotes: ''
};

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await MedicalRecordService.getAll();
      setRecords(res);
    } catch (err) {
      alert('Lỗi khi lấy danh sách hồ sơ bệnh án');
    }
  };

  const openAddForm = () => {
    setForm(initialForm);
    setIsEdit(false);
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setForm({
      ...record,
      recordDate: record.recordDate ? record.recordDate.slice(0, 16) : ''
    });
    setIsEdit(true);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    let data = { ...form };
    // Format recordDate nếu chỉ có ngày hoặc thiếu giây
    if (data.recordDate && /^\d{4}-\d{2}-\d{2}$/.test(data.recordDate)) {
      data.recordDate = data.recordDate + "T00:00:00";
    }
    if (data.recordDate && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(data.recordDate)) {
      data.recordDate = data.recordDate + ":00";
    }
    try {
      if (isEdit && data.recordId) {
        await MedicalRecordService.update(data.recordId, data);
      } else {
        await MedicalRecordService.create(data);
      }
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      alert('Lỗi khi lưu hồ sơ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa hồ sơ này?')) {
      await MedicalRecordService.delete(id);
      fetchRecords();
    }
  };

  const handleView = (record) => {
    setSelected(record);
  };

  const closeModal = () => {
    setShowForm(false);
    setSelected(null);
  };

  return (
    <div className="medical-records-container" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#2563eb', fontWeight: 700, fontSize: 28 }}>Hồ sơ bệnh án</h2>
        <button
          onClick={openAddForm}
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 20px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.1)'
          }}
        >
          + Thêm mới
        </button>
      </div>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: 24,
        minHeight: 300
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#e0e7ff' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Bệnh nhân</th>
              <th style={thStyle}>Bác sĩ</th>
              <th style={thStyle}>Ngày ghi</th>
              <th style={thStyle}>Chẩn đoán</th>
              <th style={thStyle}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Chưa có hồ sơ nào</td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.recordId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{r.recordId}</td>
                  <td style={tdStyle}>{r.patientId}</td>
                  <td style={tdStyle}>{r.doctorId}</td>
                  <td style={tdStyle}>{r.recordDate?.replace('T', ' ').slice(0, 19)}</td>
                  <td style={tdStyle}>{r.diagnosis}</td>
                  <td style={tdStyle}>
                    <button style={actionBtn} onClick={() => handleView(r)}>Xem</button>
                    <button style={{ ...actionBtn, background: '#f87171' }} onClick={() => handleDelete(r.recordId)}>Xóa</button>
                    <button style={{ ...actionBtn, background: '#fbbf24' }} onClick={() => openEditForm(r)}>Sửa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
  <div style={modalOverlay}>
    <div style={{
      ...modalContent,
      maxWidth: 600,
      width: '90%',
      padding: 32,
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(37,99,235,0.15)'
    }}>
      <h3 style={{ marginBottom: 20, color: '#2563eb', fontWeight: 700, fontSize: 22 }}>
        {isEdit ? 'Sửa hồ sơ bệnh án' : 'Thêm hồ sơ bệnh án'}
      </h3>
      <form
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          justifyContent: 'space-between'
        }}
        onSubmit={e => { e.preventDefault(); handleSave(); }}
      >
        <div style={{ flex: '1 1 250px', minWidth: 220 }}>
          <Input label="ID bệnh nhân" name="patientId" value={form.patientId} onChange={handleChange} />
          <Input label="ID bác sĩ" name="doctorId" value={form.doctorId} onChange={handleChange} />
          <Input label="ID lịch hẹn" name="appointmentId" value={form.appointmentId} onChange={handleChange} />
          <Input label="Ngày ghi" name="recordDate" type="datetime-local" value={form.recordDate} onChange={handleChange} />
          <Input label="Chẩn đoán" name="diagnosis" value={form.diagnosis} onChange={handleChange} />
        </div>
        <div style={{ flex: '1 1 250px', minWidth: 220 }}>
          <Input label="Điều trị" name="treatment" value={form.treatment} onChange={handleChange} />
          <Input label="Đơn thuốc" name="prescription" value={form.prescription} onChange={handleChange} />
          <Input label="Cân nặng" name="weight" value={form.weight} onChange={handleChange} />
          <Input label="Chiều cao" name="height" value={form.height} onChange={handleChange} />
          <Input label="Ghi chú" name="medicalNotes" value={form.medicalNotes} onChange={handleChange} />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
          <button type="submit" style={{ ...actionBtn, minWidth: 100 }}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
          </button>
          <button type="button" style={{ ...actionBtn, background: '#f87171', minWidth: 100 }} onClick={closeModal}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Modal xem chi tiết */}
      {selected && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Chi tiết hồ sơ</h3>
            <div><b>ID:</b> {selected.recordId}</div>
            <div><b>Bệnh nhân:</b> {selected.patientId}</div>
            <div><b>Bác sĩ:</b> {selected.doctorId}</div>
            <div><b>Ngày ghi:</b> {selected.recordDate?.replace('T', ' ').slice(0, 19)}</div>
            <div><b>Chẩn đoán:</b> {selected.diagnosis}</div>
            <div><b>Điều trị:</b> {selected.treatment}</div>
            <div><b>Đơn thuốc:</b> {selected.prescription}</div>
            <div><b>Cân nặng:</b> {selected.weight}</div>
            <div><b>Chiều cao:</b> {selected.height}</div>
            <div><b>Ghi chú:</b> {selected.medicalNotes}</div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button style={actionBtn} onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Style helpers
const thStyle = { padding: 12, fontWeight: 700, color: '#2563eb', fontSize: 16, textAlign: 'left' };
const tdStyle = { padding: 10, fontSize: 15, color: '#222' };
const actionBtn = {
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '6px 14px',
  marginRight: 6,
  fontWeight: 600,
  cursor: 'pointer'
};
const modalOverlay = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalContent = {
  background: '#fff', borderRadius: 12, padding: 32, minWidth: 350, maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
};

// Input component
function Input({ label, ...props }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#2563eb' }}>
      {label}
      <input
        {...props}
        style={{
          marginTop: 4,
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #c7d2fe',
          fontSize: 15,
          outline: 'none'
        }}
      />
    </label>
  );
}

export default MedicalRecords;