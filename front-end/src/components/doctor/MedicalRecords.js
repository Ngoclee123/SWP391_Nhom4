"use client"

import { useEffect, useState } from "react"
import MedicalRecordService from "../../service/MedicalRecordService"

const initialForm = {
  patientId: "",
  doctorId: "",
  appointmentId: "",
  recordDate: "",
  diagnosis: "",
  treatment: "",
  prescription: "",
  weight: "",
  height: "",
  medicalNotes: "",
}

function MedicalRecords({ doctorId }) {
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({ ...initialForm, doctorId: doctorId || "" })
  const [showForm, setShowForm] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await MedicalRecordService.getAll()
      if (Array.isArray(res)) {
        setRecords(res)
      } else if (Array.isArray(res.data)) {
        setRecords(res.data)
      } else {
        setRecords([])
      }
    } catch (err) {
      alert("Lỗi khi lấy danh sách hồ sơ bệnh án")
      setRecords([])
    }
  }

  const openAddForm = () => {
    setForm({ ...initialForm, doctorId: doctorId || "" })
    setIsEdit(false)
    setShowForm(true)
  }

  const openEditForm = (record) => {
    setForm({
      ...record,
      recordDate: record.recordDate ? record.recordDate.slice(0, 16) : "",
    })
    setIsEdit(true)
    setShowForm(true)
  }

  const handleChange = (e) => {
    // Nếu là height hoặc weight thì chỉ cho nhập số
    const { name, value } = e.target
    if (name === "height" || name === "weight") {
      // Chỉ cho phép số và tối đa 3 ký tự
      if (/^\d{0,3}$/.test(value)) {
        setForm({ ...form, [name]: value })
      }
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSave = async () => {
    const data = { ...form }
    // Ép kiểu height/weight sang số, nếu rỗng thì để null
    data.height = data.height ? Number(data.height) : null
    data.weight = data.weight ? Number(data.weight) : null
    // Luôn gán doctorId từ prop
    data.doctorId = doctorId

    // Format recordDate nếu chỉ có ngày hoặc thiếu giây
    if (data.recordDate && /^\d{4}-\d{2}-\d{2}$/.test(data.recordDate)) {
      data.recordDate = data.recordDate + "T00:00:00"
    }
    if (data.recordDate && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(data.recordDate)) {
      data.recordDate = data.recordDate + ":00"
    }

    try {
      if (isEdit && data.recordId) {
        await MedicalRecordService.update(data.recordId, data)
      } else {
        await MedicalRecordService.create(data)
      }
      setShowForm(false)
      fetchRecords()
    } catch (err) {
      alert("Lỗi khi lưu hồ sơ")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa hồ sơ này?")) {
      await MedicalRecordService.delete(id)
      fetchRecords()
    }
  }

  const handleView = (record) => {
    setSelected(record)
  }

  const closeModal = () => {
    setShowForm(false)
    setSelected(null)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Hồ sơ bệnh án
        </h2>
        <button
          onClick={openAddForm}
          className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">
                  Bệnh nhân
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">Bác sĩ</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">
                  Ngày ghi
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">
                  Chẩn đoán
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-16 h-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium text-gray-600">Chưa có hồ sơ nào</p>
                      <p className="text-sm text-gray-500 mt-1">Hãy thêm hồ sơ bệnh án đầu tiên</p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.recordId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.recordId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.patientId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.doctorId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.recordDate?.replace("T", " ").slice(0, 19)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.diagnosis}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleView(r)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors duration-150"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => handleDelete(r.recordId)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors duration-150"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => openEditForm(r)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors duration-150"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {isEdit ? "Sửa hồ sơ bệnh án" : "Thêm hồ sơ bệnh án"}
              </h3>
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSave()
                }}
              >
                <div className="space-y-4">
                  <Input label="ID bệnh nhân" name="patientId" value={form.patientId} onChange={handleChange} />
                  <Input label="ID bác sĩ" name="doctorId" value={doctorId} readOnly />
                  <Input label="ID lịch hẹn" name="appointmentId" value={form.appointmentId} onChange={handleChange} />
                  <Input
                    label="Ngày ghi"
                    name="recordDate"
                    type="datetime-local"
                    value={form.recordDate}
                    onChange={handleChange}
                  />
                  <Input label="Chẩn đoán" name="diagnosis" value={form.diagnosis} onChange={handleChange} />
                </div>
                <div className="space-y-4">
                  <Input label="Điều trị" name="treatment" value={form.treatment} onChange={handleChange} />
                  <Input label="Đơn thuốc" name="prescription" value={form.prescription} onChange={handleChange} />
                  <Input
                    label="Cân nặng (kg)"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    max="300"
                  />
                  <Input
                    label="Chiều cao (cm)"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    max="300"
                  />
                  <Input label="Ghi chú" name="medicalNotes" value={form.medicalNotes} onChange={handleChange} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-150 min-w-[120px]"
                  >
                    {isEdit ? "Lưu thay đổi" : "Thêm mới"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-150 min-w-[120px]"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Chi tiết hồ sơ
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="font-semibold text-gray-700">ID:</span>
                    <p className="text-gray-900 mt-1">{selected.recordId}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="font-semibold text-gray-700">Bệnh nhân:</span>
                    <p className="text-gray-900 mt-1">{selected.patientId}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="font-semibold text-gray-700">Bác sĩ:</span>
                    <p className="text-gray-900 mt-1">{selected.doctorId}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="font-semibold text-gray-700">Ngày ghi:</span>
                    <p className="text-gray-900 mt-1">{selected.recordDate?.replace("T", " ").slice(0, 19)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="font-semibold text-gray-700">Cân nặng:</span>
                    <p className="text-gray-900 mt-1">{selected.weight}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="font-semibold text-gray-700">Chiều cao:</span>
                    <p className="text-gray-900 mt-1">{selected.height}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="font-semibold text-gray-700">Chẩn đoán:</span>
                  <p className="text-gray-900 mt-1">{selected.diagnosis}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="font-semibold text-gray-700">Điều trị:</span>
                  <p className="text-gray-900 mt-1">{selected.treatment}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="font-semibold text-gray-700">Đơn thuốc:</span>
                  <p className="text-gray-900 mt-1">{selected.prescription}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="font-semibold text-gray-700">Ghi chú:</span>
                  <p className="text-gray-900 mt-1">{selected.medicalNotes}</p>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-150"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Input component
function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 bg-gray-50 focus:bg-white"
      />
    </div>
  )
}

export default MedicalRecords
