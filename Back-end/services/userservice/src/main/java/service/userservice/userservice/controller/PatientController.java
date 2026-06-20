package service.userservice.userservice.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import service.userservice.userservice.context.UserContext;
import service.userservice.userservice.model.Appointment;
import service.userservice.userservice.model.DoctorProfile;
import service.userservice.userservice.model.Prescription;
import service.userservice.userservice.repository.AppointmentRepository;
import service.userservice.userservice.repository.DoctorProfileRepository;
import service.userservice.userservice.repository.PrescriptionRepository;

@RestController 
@RequestMapping("/api/v1/patient")
public class PatientController {
    
    @Autowired private AppointmentRepository apptRepo;
    @Autowired private PrescriptionRepository prescRepo;
    @Autowired private DoctorProfileRepository docRepo;

    /**
     * Helper method to validate if the user is actually a patient.
     */
    private boolean isNotPatient() {
        return !"patient".equalsIgnoreCase(UserContext.getRole());
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Role Validation
            if (isNotPatient()) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden: Only patients can book appointments."));
            }

            // 2. Validate payload exists
            if (!payload.containsKey("doctor_id") || payload.get("doctor_id") == null) {
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "Bad Request: 'doctor_id' is required."));
            }

            String doctorId = String.valueOf(payload.get("doctor_id"));
            
            // 3. Create Appointment
            Appointment appt = Appointment.builder()
                    .patientId(UserContext.getUserId())
                    .patientName(UserContext.getName())
                    .patientPhone(UserContext.getPhone())
                    .doctorId(doctorId)
                    .date(payload.get("date") != null ? String.valueOf(payload.get("date")) : "N/A")
                    .symptoms(payload.get("symptoms") != null ? String.valueOf(payload.get("symptoms")) : "N/A")
                    .transactionId(payload.get("transaction_id") != null ? String.valueOf(payload.get("transaction_id")) : "N/A")
                    .isComplete(false)
                    .build();
            
            apptRepo.save(appt);

            // 4. Create Prescription Shell
            Prescription presc = Prescription.builder()
                    .patientId(appt.getPatientId())
                    .doctorId(appt.getDoctorId())
                    .symptoms(appt.getSymptoms())
                    .transactionId(appt.getTransactionId())
                    .build();
                    
            prescRepo.save(presc);

            // 5. Fetch Doctor Profile
            DoctorProfile docProfile = docRepo.findById(doctorId).orElse(new DoctorProfile());

            // 6. Return Success Response
            return ResponseEntity.status(201).body(Map.of(
                "success", true, 
                "message", "Appointment booked successfully.", 
                "data", Map.of(
                    "prescriptionID", presc.getPrescriptionId(),
                    "patient_id", appt.getPatientId(),
                    "doctor_info", Map.of(
                            "doctorId", doctorId, 
                            "specialization", docProfile.getSpecialization() != null ? docProfile.getSpecialization() : ""
                    ),
                    "location", docProfile.getLocation() != null ? docProfile.getLocation() : "",
                    "date", appt.getDate(),
                    "serial_no", appt.getSerialNo(),
                    "symptoms", appt.getSymptoms()
                )
            ));

        } catch (Exception e) {
            // IF IT CRASHES NOW, POSTMAN WILL TELL YOU EXACTLY WHY!
            e.printStackTrace(); // This prints the error to your IDE console
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Server Error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getPrescriptions() {
        if (isNotPatient()) return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden"));
        return ResponseEntity.ok(Map.of("success", true, "data", prescRepo.findByPatientId(UserContext.getUserId())));
    }

    @GetMapping("/prescriptions/doctor/{doctorId}")
    public ResponseEntity<?> getPrescriptionsByDoctor(@PathVariable String doctorId) {
        if (isNotPatient()) return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden"));
        return ResponseEntity.ok(Map.of("success", true, "data", prescRepo.findByPatientIdAndDoctorId(UserContext.getUserId(), doctorId)));
    }
}