package service.bloodbankservice.bloodbankservice.repository;

import service.bloodbankservice.bloodbankservice.model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonorRepository extends JpaRepository<Donor, String> {
    Optional<Donor> findByDonorId(String donorId);
    List<Donor> findByBloodgroup(String bloodgroup);
}
