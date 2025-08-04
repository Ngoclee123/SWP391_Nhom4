"use client"

import { useEffect, useState } from "react"
import axios from "../../api/axiosClient"
import "./pagination.css"

function VaccineManagement() {
  const [vaccines, setVaccines] = useState([])
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: "", description: "", recommendedAge: "", image: "", price: "" })
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchVaccines()
  }, [page])

  const fetchVaccines = () => {
    axios
      .get(`/api/vaccines?page=${page}&size=${size}`)
      .then((res) => {
        setVaccines(res.data.content)
        setTotalPages(res.data.totalPages)
      })
      .catch(console.error)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) {
      axios
        .put(`/api/vaccines/${editing.id}`, form)
        .then(() => {
          setEditing(null)
          setForm({ name: "", description: "", recommendedAge: "", image: "", price: "" })
          fetchVaccines()
        })
        .catch(console.error)
    } else {
      axios
        .post("/api/vaccines", form)
        .then(() => {
          setForm({ name: "", description: "", recommendedAge: "", image: "", price: "" })
          fetchVaccines()
        })
        .catch(console.error)
    }
  }

  const handleEdit = (v) => {
    setEditing(v)
    setForm({
      name: v.name,
      description: v.description,
      recommendedAge: v.recommendedAge,
      image: v.image,
      price: v.price,
    })
  }

  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa vaccine này?")) {
      axios.delete(`/api/vaccines/${id}`).then(fetchVaccines).catch(console.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              Quản lý Vaccine
            </h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm vaccine theo tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {editing ? "Cập nhật Vaccine" : "Thêm Vaccine Mới"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên vaccine *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nhập tên vaccine"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Độ tuổi khuyến nghị</label>
                <input
                  name="recommendedAge"
                  value={form.recommendedAge}
                  onChange={handleChange}
                  placeholder="VD: 0-12 tháng"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link ảnh</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ) *</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  type="number"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {editing ? "Cập nhật" : "Thêm mới"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null)
                    setForm({ name: "", description: "", recommendedAge: "", image: "", price: "" })
                  }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">STT</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tên</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mô tả</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Độ tuổi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ảnh</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Giá</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vaccines
                  .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
                  .map((v, idx) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{page * size + idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{v.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {v.description || "Chưa có mô tả"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {v.recommendedAge || "Chưa xác định"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {v.image ? (
                          <img
                            src={v.image || "/placeholder.svg"}
                            alt="vaccine"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-green-600">
                          {new Intl.NumberFormat("vi-VN").format(v.price)} VNĐ
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(v)}
                            className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-yellow-600 transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {vaccines.filter((v) => v.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg">Không tìm thấy vaccine nào</p>
              <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm hoặc thêm vaccine mới</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={page === i ? "active" : ""} onClick={() => setPage(i)}>
              {i + 1}
            </button>
          ))}
          <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default VaccineManagement
