// // src/components/DoctorList.js
// import React, { useState, useEffect } from "react";
// import { getDoctors } from "../api"; // Adjust path to your api.js

// const DoctorList = () => {
//   const [doctors, setDoctors] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         const response = await getDoctors();
//         setDoctors(response.data);
//       } catch (err) {
//         setError("Failed to fetch doctors");
//         console.error(err);
//       }
//     };
//     fetchDoctors();
//   }, []);

//   if (error) return <div>{error}</div>;
//   return (
//     <div>
//       <h2>Doctors</h2>
//       <ul>
//         {doctors.map((doctor) => (
//           <li key={doctor.id}>{doctor.name}</li> // Adjust based on your API response
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default DoctorList;
