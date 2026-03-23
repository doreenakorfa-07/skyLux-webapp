package com.airline.service;

import com.airline.entity.Booking;
import com.airline.entity.Flight;
import com.airline.entity.User;
import com.airline.repository.BookingRepository;
import com.airline.repository.FlightRepository;
import com.airline.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import com.airline.entity.Payment;
import com.airline.repository.PaymentRepository;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    FlightRepository flightRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PaymentRepository paymentRepository;

    public Booking bookTicket(String flightId, String seatNumber, String flightClass, String paymentMethod) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        if (flight.getAvailableSeats() <= 0) {
            throw new RuntimeException("No seats available on this flight");
        }
        
        String clazz = flightClass.toUpperCase();
        Integer classSeats = flight.getAvailableSeatsByClass() != null ? flight.getAvailableSeatsByClass().get(clazz) : null;
        if (classSeats != null && classSeats <= 0) {
            throw new RuntimeException("No seats available in " + clazz + " class");
        }

        if (bookingRepository.existsByFlightAndSeatNumberAndStatusNot(flight, seatNumber, "CANCELLED")) {
            throw new RuntimeException("Seat is already occupied");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate class-based price
        Double basePrice = flight.getPrice();
        Double totalPrice = calculatePrice(basePrice, flightClass);

        Booking booking = new Booking(null, user, flight, LocalDateTime.now(), "CONFIRMED", seatNumber, flightClass, totalPrice);
        
        // Update available seats
        flight.setAvailableSeats(flight.getAvailableSeats() - 1);
        if (flight.getAvailableSeatsByClass() != null && flight.getAvailableSeatsByClass().containsKey(clazz)) {
            flight.getAvailableSeatsByClass().put(clazz, flight.getAvailableSeatsByClass().get(clazz) - 1);
        }
        flightRepository.save(flight);

        Booking savedBooking = bookingRepository.save(booking);

        // Simulated Secure Payment Process or Airport Payment
        String txnId;
        String payStatus;
        if ("AIRPORT".equalsIgnoreCase(paymentMethod)) {
            txnId = "PENDING-AIRPORT";
            payStatus = "PENDING";
        } else {
            txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            payStatus = "SUCCESS";
        }
        
        Payment payment = new Payment(null, user, savedBooking, totalPrice, txnId, payStatus, LocalDateTime.now());
        paymentRepository.save(payment);

        return savedBooking;
    }

    private Double calculatePrice(Double basePrice, String flightClass) {
        return switch (flightClass.toUpperCase()) {
            case "PREMIUM_ECONOMY" -> basePrice * 1.5;
            case "BUSINESS" -> basePrice * 3.0;
            case "FIRST" -> basePrice * 6.0;
            default -> basePrice;
        };
    }

    public List<Booking> getUserBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<String> getOccupiedSeats(String flightId) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found"));
        return bookingRepository.findByFlightAndStatusNot(flight, "CANCELLED")
                .stream()
                .map(Booking::getSeatNumber)
                .toList();
    }

    public void cancelBooking(String bookingId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized cancellation attempt");
        }
        
        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");
        Flight flight = booking.getFlight();
        flight.setAvailableSeats(flight.getAvailableSeats() + 1);
        
        String clazz = booking.getFlightClass() != null ? booking.getFlightClass().toUpperCase() : null;
        if (clazz != null && flight.getAvailableSeatsByClass() != null && flight.getAvailableSeatsByClass().containsKey(clazz)) {
            flight.getAvailableSeatsByClass().put(clazz, flight.getAvailableSeatsByClass().get(clazz) + 1);
        }
        
        flightRepository.save(flight);
        bookingRepository.save(booking);
        
        // Also cancel the pending or actual payment record
        List<Payment> payments = paymentRepository.findByUser(user);
        for(Payment p : payments) {
            if (p.getBooking().getId().equals(booking.getId())) {
                p.setStatus("CANCELLED");
                paymentRepository.save(p);
            }
        }
    }
}
