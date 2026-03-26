package com.airline.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private Flight flight;

    private LocalDateTime bookingDate;
    private String status; // CONFIRMED, CANCELLED
    private String seatNumber;
    private String flightClass; // ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
    private Double totalPrice;
    private String currency; // USD, GHS, NGN, KES, ZAR
    private String paymentMethod; // ONLINE, AIRPORT
    private boolean archivedByUser;
    private boolean archivedByAdmin;

    public Booking() {}

    public Booking(String id, User user, Flight flight, LocalDateTime bookingDate, String status, String seatNumber, String flightClass, Double totalPrice, String currency, String paymentMethod) {
        this.id = id;
        this.user = user;
        this.flight = flight;
        this.bookingDate = bookingDate;
        this.status = status;
        this.seatNumber = seatNumber;
        this.flightClass = flightClass;
        this.totalPrice = totalPrice;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Flight getFlight() { return flight; }
    public void setFlight(Flight flight) { this.flight = flight; }
    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public String getFlightClass() { return flightClass; }
    public void setFlightClass(String flightClass) { this.flightClass = flightClass; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public boolean isArchivedByUser() { return archivedByUser; }
    public void setArchivedByUser(boolean archivedByUser) { this.archivedByUser = archivedByUser; }
    public boolean isArchivedByAdmin() { return archivedByAdmin; }
    public void setArchivedByAdmin(boolean archivedByAdmin) { this.archivedByAdmin = archivedByAdmin; }
}
