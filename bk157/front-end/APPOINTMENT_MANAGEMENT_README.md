# Appointment Management System

## Tổng quan

Hệ thống quản lý appointments (lịch hẹn) cho admin với đầy đủ tính năng CRUD, thống kê và biểu đồ trực quan.

## Tính năng chính

### 1. Appointment Management (`AppointmentManagement.js`)

#### Chức năng:
- ✅ **Xem danh sách appointments** - Hiển thị tất cả appointments với thông tin chi tiết
- ✅ **Tìm kiếm** - Tìm theo tên bệnh nhân, bác sĩ hoặc ID appointment
- ✅ **Lọc theo status** - PENDING, CONFIRMED, COMPLETED, CANCELLED
- ✅ **Xem chi tiết** - Modal hiển thị thông tin đầy đủ
- ✅ **Chỉnh sửa** - Cập nhật ngày, giờ, status, ghi chú
- ✅ **Xóa appointment** - Với xác nhận trước khi xóa
- ✅ **Cập nhật status** - Thay đổi trạng thái appointment

#### Giao diện:
- 📊 Bảng hiển thị với pagination
- 🎨 Status badges với màu sắc phân biệt
- 🔍 Search và filter controls
- 📱 Responsive design
- ⚡ Loading states và error handling

### 2. Appointment Statistics (`AppointmentStatsDashboard.js`)

#### Chức năng:
- ✅ **Summary Cards** - Tổng appointments, hôm nay, tháng này, năm nay
- ✅ **Pie Chart** - Phân bố theo status
- ✅ **Bar Chart** - Xu hướng theo tháng
- ✅ **Area Chart** - Xu hướng theo ngày (7 ngày gần nhất)
- ✅ **Line Chart** - So sánh status
- ✅ **Detailed Table** - Bảng chi tiết với tỷ lệ phần trăm

#### Charts sử dụng:
- 📈 **Recharts** - Thư viện chart hiện đại
- 🎨 **Responsive** - Tự động điều chỉnh kích thước
- 🌈 **Color coding** - Màu sắc phân biệt cho từng status

## Cấu trúc Backend

### 1. Models
```java
// Appointment.java
@Entity
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
    
    private LocalDateTime appointmentDate;
    private String appointmentTime;
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 2. DTOs
```java
// AppointmentDTO.java
public class AppointmentDTO {
    private Long id;
    private PatientDTO patient;
    private DoctorDTO doctor;
    private String appointmentDate;
    private String appointmentTime;
    private String status;
    private String notes;
    private String createdAt;
    private String updatedAt;
}
```

### 3. Repository
```java
// AppointmentRepository.java
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // CRUD operations
    List<Appointment> findByStatus(String status);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    
    // Statistics queries
    @Query("SELECT COUNT(a) FROM Appointment a WHERE CAST(a.createdAt AS date) = CAST(GETDATE() AS date)")
    Long countTodayAppointments();
    
    @Query("SELECT a.status, COUNT(a) FROM Appointment a GROUP BY a.status")
    List<Object[]> getStatusCounts();
    
    @Query("SELECT CAST(a.createdAt AS date) as date, COUNT(a) FROM Appointment a " +
           "WHERE a.createdAt >= DATEADD(day, -7, GETDATE()) " +
           "GROUP BY CAST(a.createdAt AS date) ORDER BY date")
    List<Object[]> getDailyStats();
}
```

### 4. Service
```java
// AppointmentService.java
@Service
public class AppointmentService {
    // CRUD operations
    public List<AppointmentDTO> getAllAppointments();
    public AppointmentDTO getAppointmentById(Long id);
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO dto);
    public void deleteAppointment(Long id);
    public AppointmentDTO updateStatus(Long id, String status);
    
    // Statistics
    public Map<String, Object> getAppointmentStats();
}
```

### 5. Controller
```java
// AdminAppointmentController.java
@RestController
@RequestMapping("/api/admin/appointments")
public class AdminAppointmentController {
    // REST endpoints
    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments();
    
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id);
    
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Long id, @RequestBody AppointmentDTO dto);
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id);
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentDTO> updateStatus(@PathVariable Long id, @RequestBody String status);
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAppointmentStats();
}
```

## Cấu trúc Frontend

### 1. Service Layer
```javascript
// AppointmentService.js
class AppointmentService {
    // Admin management methods
    getAllAppointments() { /* ... */ }
    getAppointmentById(id) { /* ... */ }
    updateAppointment(id, data) { /* ... */ }
    deleteAppointment(id) { /* ... */ }
    updateAppointmentStatus(id, status) { /* ... */ }
    getAppointmentStats() { /* ... */ }
    
    // Existing user booking methods (unchanged)
    bookAppointment(userId, appointmentData) { /* ... */ }
    createPayment(userId, paymentData) { /* ... */ }
}
```

### 2. Components
```javascript
// AppointmentManagement.js
const AppointmentManagement = () => {
    // State management
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Functions
    const loadAppointments = async () => { /* ... */ };
    const handleViewAppointment = (appointment) => { /* ... */ };
    const handleEditAppointment = (appointment) => { /* ... */ };
    const handleDeleteAppointment = (appointment) => { /* ... */ };
    const handleSaveEdit = async () => { /* ... */ };
    
    return (
        <div>
            {/* Search and Filter */}
            {/* Appointments Table */}
            {/* View/Edit Modal */}
            {/* Delete Confirmation Modal */}
        </div>
    );
};
```

```javascript
// AppointmentStatsDashboard.js
const AppointmentStatsDashboard = () => {
    // State management
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Charts data preparation
    const statusData = [/* ... */];
    const monthlyData = [/* ... */];
    const dailyData = [/* ... */];
    
    return (
        <div>
            {/* Summary Cards */}
            {/* Charts Grid */}
            {/* Detailed Statistics Table */}
        </div>
    );
};
```

## API Endpoints

### Admin Management APIs
```
GET    /api/admin/appointments           - Lấy tất cả appointments
GET    /api/admin/appointments/{id}      - Lấy appointment theo ID
PUT    /api/admin/appointments/{id}      - Cập nhật appointment
DELETE /api/admin/appointments/{id}      - Xóa appointment
PATCH  /api/admin/appointments/{id}/status - Cập nhật status
GET    /api/admin/appointments/stats     - Lấy thống kê
```

### Filter APIs
```
GET    /api/admin/appointments/status/{status}    - Lọc theo status
GET    /api/admin/appointments/patient/{patientId} - Lọc theo patient
GET    /api/admin/appointments/doctor/{doctorId}   - Lọc theo doctor
GET    /api/admin/appointments/date/{date}         - Lọc theo ngày
```

## Cách sử dụng

### 1. Truy cập Admin Dashboard
```
http://localhost:3000/admin
```

### 2. Navigation
- **Lịch hẹn** - Quản lý appointments
- **Thống kê lịch hẹn** - Xem biểu đồ và thống kê

### 3. Quản lý Appointments
1. Vào tab "Lịch hẹn"
2. Sử dụng search và filter để tìm appointments
3. Click "Xem" để xem chi tiết
4. Click "Sửa" để chỉnh sửa
5. Click "Xóa" để xóa (có xác nhận)

### 4. Xem thống kê
1. Vào tab "Thống kê lịch hẹn"
2. Xem các biểu đồ và số liệu
3. Phân tích xu hướng và phân bố

## Dependencies

### Backend
- Spring Boot 2.7+
- Spring Data JPA
- SQL Server
- Maven

### Frontend
- React 19+
- Axios
- Recharts (for charts)
- Tailwind CSS
- Lucide React (icons)

## Lưu ý quan trọng

### 1. Database Compatibility
- Sử dụng SQL Server syntax cho date functions
- `CAST(created_at AS DATE)` thay vì `DATE()`
- `GETDATE()` thay vì `NOW()`

### 2. Code Safety
- Không sửa đổi code cũ trong `AppointmentService.js`
- Thêm method mới mà không xóa code hiện có
- Giữ nguyên class syntax và existing methods

### 3. Error Handling
- Loading states cho tất cả API calls
- Error messages cho user
- Console logging cho debugging

### 4. Performance
- Lazy loading cho charts
- Debounced search
- Optimized database queries

## Troubleshooting

### 1. Charts không hiển thị
- Kiểm tra `recharts` package đã cài đặt
- Kiểm tra data format từ API
- Kiểm tra console errors

### 2. API errors
- Kiểm tra backend logs
- Kiểm tra database connection
- Kiểm tra CORS configuration

### 3. Search không hoạt động
- Kiểm tra search term format
- Kiểm tra API response structure
- Kiểm tra filter logic

## Future Enhancements

### 1. Tính năng có thể thêm:
- Export appointments to Excel/PDF
- Bulk operations (delete multiple, update status)
- Advanced filters (date range, doctor specialty)
- Email notifications
- Calendar view
- Drag & drop scheduling

### 2. Performance improvements:
- Pagination for large datasets
- Virtual scrolling
- Caching strategies
- Real-time updates with WebSocket

### 3. Analytics enhancements:
- More chart types (heatmap, scatter plot)
- Custom date ranges
- Comparative analytics
- Predictive analytics

---

**Hệ thống Appointment Management đã hoàn chỉnh và sẵn sàng sử dụng! 🎉** 