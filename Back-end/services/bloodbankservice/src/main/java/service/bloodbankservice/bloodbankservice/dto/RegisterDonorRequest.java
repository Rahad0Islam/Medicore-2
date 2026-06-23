package service.bloodbankservice.bloodbankservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

public class RegisterDonorRequest {
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastdate;

    public LocalDate getLastdate() { return lastdate; }
    public void setLastdate(LocalDate lastdate) { this.lastdate = lastdate; }
}
