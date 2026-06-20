package service.authservice.authservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "medicore_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String userId;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String role;
    
    private String phone;

    @Column(name = "blood_group")
    private String bloodGroup;

    private Boolean approval;

    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.userId == null) {
            this.userId = "usr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        
        if (this.approval == null) {
            this.approval = !"doctor".equalsIgnoreCase(this.role);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}