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

    public List<Booking> bookTickets(String flightId, Integer numSeats, String flightClass, String paymentMethod) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        if (flight.getAvailableSeats() < numSeats) {
            throw new RuntimeException("Not enough seats available on this flight");
        }
        
        String clazz = flightClass.toUpperCase();
        Integer classSeats = flight.getAvailableSeatsByClass() != null ? flight.getAvailableSeatsByClass().get(clazz) : null;
        if (classSeats != null && classSeats < numSeats) {
            throw new RuntimeException("Not enough seats available in " + clazz + " class");
        }

        List<String> assignedSeats = assignSeats(flight, flightClass, numSeats);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Double basePrice = flight.getPrice();
        Double totalPricePerSeat = calculatePrice(basePrice, flightClass);
        
        java.util.List<Booking> savedBookings = new java.util.ArrayList<>();

        for (String seat : assignedSeats) {
            Booking booking = new Booking(null, user, flight, LocalDateTime.now(), "CONFIRMED", seat, flightClass, totalPricePerSeat);
            
            // Update available seats for each ticket
            flight.setAvailableSeats(flight.getAvailableSeats() - 1);
            if (flight.getAvailableSeatsByClass() != null && flight.getAvailableSeatsByClass().containsKey(clazz)) {
                flight.getAvailableSeatsByClass().put(clazz, flight.getAvailableSeatsByClass().get(clazz) - 1);
            }
            
            Booking savedBooking = bookingRepository.save(booking);
            savedBookings.add(savedBooking);

            // Create payment record for each booking
            String txnId = "AIRPORT".equalsIgnoreCase(paymentMethod) ? "PENDING-AIRPORT" : "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String payStatus = "AIRPORT".equalsIgnoreCase(paymentMethod) ? "PENDING" : "SUCCESS";
            Payment payment = new Payment(null, user, savedBooking, totalPricePerSeat, txnId, payStatus, LocalDateTime.now());
            paymentRepository.save(payment);
        }

        flightRepository.save(flight);
        return savedBookings;
    }

    private List<String> assignSeats(Flight flight, String flightClass, int count) {
        List<String> occupied = getOccupiedSeats(flight.getId());
        List<String> assigned = new java.util.ArrayList<>();
        
        int startRow, endRow;
        switch (flightClass.toUpperCase()) {
            case "FIRST" -> { startRow = 1; endRow = 2; }
            case "BUSINESS" -> { startRow = 3; endRow = 6; }
            case "PREMIUM_ECONOMY" -> { startRow = 7; endRow = 12; }
            default -> { startRow = 13; endRow = 35; }
        }

        char[] cols = {'A', 'B', 'C', 'D', 'E', 'F'};
        for (int r = startRow; r <= endRow; r++) {
            for (char c : cols) {
                String seat = r + String.valueOf(c);
                if (!occupied.contains(seat) && !assigned.contains(seat)) {
                    assigned.add(seat);
                    if (assigned.size() == count) return assigned;
                }
            }
        }
        
        if (assigned.size() < count) {
            throw new RuntimeException("Could not find enough available seats in " + flightClass);
        }
        return assigned;
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
