package service.userservice.userservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.userservice.userservice.context.UserContext;
import service.userservice.userservice.model.Appointment;
import service.userservice.userservice.model.Prescription;
import service.userservice.userservice.repository.AppointmentRepository;
import service.userservice.userservice.repository.PrescriptionRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController 
@RequestMapping("/api/v1/doctor")
public class DoctorController {
    
    @Autowired private AppointmentRepository apptRepo;
    @Autowired private PrescriptionRepository prescRepo;

    /**
     * Helper method to validate if the user is actually a doctor.
     */
    private boolean isNotDoctor() {
        return !"doctor".equalsIgnoreCase(UserContext.getRole());
    }

    /**
     * Helper method to generate the standard Forbidden error response.
     */
    private ResponseEntity<Map<String, Object>> forbiddenResponse() {
        return ResponseEntity.status(403).body(Map.of(
            "success", false, 
            "message", "Forbidden: Only doctors can access this resource."
        ));
    }

    @PutMapping("/prescriptions/{id}")
    public ResponseEntity<?> writePrescription(@PathVariable String id, @RequestBody Prescription payload) {
        // 1. Role Validation
        if (isNotDoctor()) return forbiddenResponse();

        // 2. Process Request
        return prescRepo.findById(id).map(p -> {
            p.setDescription(payload.getDescription());
            p.setMedicineDetails(payload.getMedicineDetails());
            prescRepo.save(p);
            
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Prescription successfully issued.", 
                "data", p
            ));
        }).orElse(ResponseEntity.status(404).body(Map.of("success", false, "message", "Prescription slot not found.")));
    }

    @GetMapping("/prescriptions/patient/{patientId}")
    public ResponseEntity<?> getPatientHistory(@PathVariable String patientId) {
        // 1. Role Validation
        if (isNotDoctor()) return forbiddenResponse();

        // 2. Process Request
        return ResponseEntity.ok(Map.of(
            "success", true, 
            "data", prescRepo.findByDoctorIdAndPatientId(UserContext.getUserId(), patientId)
        ));
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments() {
        // 1. Role Validation
        if (isNotDoctor()) return forbiddenResponse();

        // 2. Process Request
        List<Appointment> all = apptRepo.findByDoctorId(UserContext.getUserId());
        
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "incomplete", all.stream().filter(a -> !a.getIsComplete()).map(this::mapAppointmentResponse).collect(Collectors.toList()),
                "complete", all.stream().filter(Appointment::getIsComplete).map(this::mapAppointmentResponse).collect(Collectors.toList())
        )));
    }

    private Map<String, Object> mapAppointmentResponse(Appointment a) {
        return Map.of(
            "serial_no", a.getSerialNo(),
            "date", a.getDate(),
            "patient_id", a.getPatientId(),
            "name", a.getPatientName() != null ? a.getPatientName() : "Unknown",
            "phone", a.getPatientPhone() != null ? a.getPatientPhone() : "Unknown",
            "symptoms", a.getSymptoms()
        );
    }
}