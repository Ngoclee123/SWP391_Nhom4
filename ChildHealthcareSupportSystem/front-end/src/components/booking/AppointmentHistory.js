import React, { useState, useEffect } from "react";
import AppointmentService from "../../service/AppointmentService";
import UserService from "../../service/userService";


// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };


  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }


  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto py-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p>{this.state.error.message}</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // Store all appointments
  const [patients, setPatients] = useState({});
  const [patientsList, setPatientsList] = useState([]); // Store patients list for dropdown
  const [selectedPatientId, setSelectedPatientId] = useState("all"); // Selected patient filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const appointmentService = AppointmentService;


  useEffect(() => {
    fetchPatients();
  }, []);


  useEffect(() => {
    if (patientsList.length > 0) {
      fetchAllAppointments();
    }
  }, [patientsList]);


  useEffect(() => {
    filterAppointmentsByPatient();
  }, [selectedPatientId, allAppointments]);


  const fetchPatients = async () => {
    try {
      const response = await UserService.getPatients();
      const patientMap = {};
      const patientArray = [];


      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((patient) => {
          patientMap[patient.id] = patient.fullName || "Unknown Patient";
          patientArray.push(patient);
          console.log(`Mapping patient ${patient.id} to ${patient.fullName}`);
        });
      }
      console.log("Patient map:", patientMap);
      console.log("Patients list:", patientArray);


      setPatients(patientMap);
      setPatientsList(patientArray);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };


  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      const allAppointmentsData = [];


      // Fetch appointments for each patient
      for (const patient of patientsList) {
        try {
          const response = await appointmentService.getAppointmentsByPatient(
            patient.id
          );
          console.log(`Appointments for patient ${patient.id}:`, response);


          if (response && Array.isArray(response)) {
            const appointmentsWithPatientInfo = response.map((apt) => ({
              ...apt,
              appointmentId: apt.appointmentId || apt.id || apt.appointment_id,
              patientId: patient.id,
              patientName: patient.fullName,
            }));
            allAppointmentsData.push(...appointmentsWithPatientInfo);
          }
        } catch (error) {
          console.error(
            `Error fetching appointments for patient ${patient.id}:`,
            error
          );
        }
      }


      console.log("All appointments data:", allAppointmentsData);
      setAllAppointments(allAppointmentsData);
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      setError(
        "Failed to load appointment history: " +
          (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };


  const filterAppointmentsByPatient = () => {
    if (selectedPatientId === "all") {
      setAppointments(allAppointments);
    } else {
      const filtered = allAppointments.filter(
        (appointment) =>
          String(appointment.patientId) === String(selectedPatientId)
      );
      setAppointments(filtered);
    }
  };


  const handlePatientChange = (event) => {
    setSelectedPatientId(event.target.value);
  };


  const cancelAppointment = async (appointmentId) => {
    if (!appointmentId || isNaN(appointmentId)) {
      alert("ID lịch hẹn không hợp lệ. Vui lòng làm mới trang.");
      return;
    }


    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }


    try {
      const accountId = UserService.getAccountId();
      if (!accountId || isNaN(accountId)) {
        alert("Không tìm thấy accountId hợp lệ. Vui lòng kiểm tra đăng nhập.");
        return;
      }
      console.log(
        `Attempting to cancel appointment ${appointmentId} for account ${accountId}`
      );


      const response = await appointmentService.cancelAppointment(
        appointmentId,
        accountId
      );
      console.log(
        `Cancel response for appointment ${appointmentId}:`,
        response
      );


      await fetchAllAppointments();
      console.log(
        `Appointment list refreshed after cancellation of ${appointmentId}`
      );
      alert("Hủy lịch hẹn thành công!");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            alert(
              "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng thử lại sau."
            );
            break;
          case 403:
            alert("Bạn không có quyền hủy lịch hẹn này.");
            break;
          case 400:
            alert(
              "Yêu cầu không hợp lệ: " +
                (error.response.data?.message || "Kiểm tra ID lịch hẹn.")
            );
            break;
          case 500:
            alert(
              "Lỗi máy chủ: " +
                (error.response.data?.message || "Vui lòng thử lại sau.")
            );
            break;
          default:
            alert(
              "Lỗi không xác định: " +
                (error.response.data?.message || error.message)
            );
        }
      } else {
        alert("Lỗi kết nối: " + (error.message || "Vui lòng kiểm tra mạng."));
      }
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr || dateTimeStr === "N/A") return "N/A";
    const date = new Date(dateTimeStr);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  };


  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointment history...</p>
          </div>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }


  return (
    <ErrorBoundary>
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Appointment History
          </h2>


          {/* Patient Filter Dropdown */}
          <div className="mb-6">
            <label
              htmlFor="patientFilter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filter by Patient:
            </label>
            <select
              id="patientFilter"
              value={selectedPatientId}
              onChange={handlePatientChange}
              className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Patients</option>
              {patientsList.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName || `Patient ${patient.id}`}
                </option>
              ))}
            </select>
          </div>


          {/* Appointments Count */}
          {appointments.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {appointments.length} appointment
                {appointments.length !== 1 ? "s" : ""}
                {selectedPatientId !== "all" && (
                  <span>
                    {" "}
                    for{" "}
                    {
                      patientsList.find(
                        (p) => String(p.id) === String(selectedPatientId)
                      )?.fullName
                    }
                  </span>
                )}
              </p>
            </div>
          )}


          {appointments.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
              <p className="text-gray-600 text-lg">No appointments found.</p>
              <p className="text-gray-500 mt-2">
                {selectedPatientId === "all"
                  ? "No appointments have been booked yet."
                  : `No appointments found for ${
                      patientsList.find(
                        (p) => String(p.id) === String(selectedPatientId)
                      )?.fullName || "this patient"
                    }.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <div
                  key={appointment.appointmentId || index} // Sử dụng index làm fallback
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Appointment #{index + 1}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status || "Unknown"}
                        </span>
                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-600 text-sm">Patient Name</p>
                          <p className="font-medium">
                            {appointment.patientName ||
                              patients[appointment.patient?.id] ||
                              patients[appointment.patientId] ||
                              appointment.patient?.fullName ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">
                            Appointment Time
                          </p>
                          <p className="font-medium">
                            {formatDateTime(
                              appointment.appointmentDate ||
                                appointment.appointment_date ||
                                appointment.appointmentTime ||
                                "N/A"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Created At</p>
                          <p className="font-medium">
                            {formatDateTime(
                              appointment.createdAt ||
                                appointment.created_at ||
                                "N/A"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Symptom</p>
                          <p className="font-medium">
                            {appointment.symptom || appointment.notes || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>


                    <div className="ml-4">
                      {appointment.status === "Pending" &&
                        appointment.appointmentId &&
                        !isNaN(appointment.appointmentId) && (
                          <button
                            onClick={() =>
                              cancelAppointment(appointment.appointmentId)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
                          >
                            Cancel
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}


export default AppointmentHistory;





