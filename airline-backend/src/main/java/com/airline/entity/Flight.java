package com.airline.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "flights")
public class Flight {
    @Id
    private String id;

    @Indexed(unique = true)
    private String flightNumber;

    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Double price;
    private Integer totalSeats;
    private Integer availableSeats;
    private java.util.Map<String, Integer> totalSeatsByClass;
    private java.util.Map<String, Integer> availableSeatsByClass;

    public Flight() {}

    public Flight(String id, String flightNumber, String origin, String destination, 
                  LocalDateTime departureTime, LocalDateTime arrivalTime, 
                  Double price, Integer totalSeats, Integer availableSeats,
                  java.util.Map<String, Integer> totalSeatsByClass, 
                  java.util.Map<String, Integer> availableSeatsByClass) {
        this.id = id;
        this.flightNumber = flightNumber;
        this.origin = origin;
        this.destination = destination;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.price = price;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
        this.totalSeatsByClass = totalSeatsByClass;
        this.availableSeatsByClass = availableSeatsByClass;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFlightNumber() { return flightNumber; }
    public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }
    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
    public java.util.Map<String, Integer> getTotalSeatsByClass() { return totalSeatsByClass; }
    public void setTotalSeatsByClass(java.util.Map<String, Integer> totalSeatsByClass) { this.totalSeatsByClass = totalSeatsByClass; }
    public java.util.Map<String, Integer> getAvailableSeatsByClass() { return availableSeatsByClass; }
    public void setAvailableSeatsByClass(java.util.Map<String, Integer> availableSeatsByClass) { this.availableSeatsByClass = availableSeatsByClass; }
}
