package com.airline.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "payments")
public class Payment {
    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private Booking booking;

    private Double amount;
    private String transactionId;
    private String status; // SUCCESS, FAILED
    private LocalDateTime paymentDate;

    public Payment() {}

    public Payment(String id, User user, Booking booking, Double amount, String transactionId, String status, LocalDateTime paymentDate) {
        this.id = id;
        this.user = user;
        this.booking = booking;
        this.amount = amount;
        this.transactionId = transactionId;
        this.status = status;
        this.paymentDate = paymentDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
}
