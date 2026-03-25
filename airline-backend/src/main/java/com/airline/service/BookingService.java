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

    public List<Booking> bookTickets(String flightId, Integer numSeats, String flightClass, String paymentMethod, String currency) {
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
        Double totalPricePerSeat = calculatePrice(basePrice, flightClass, currency);
        
        java.util.List<Booking> savedBookings = new java.util.ArrayList<>();

        for (String seat : assignedSeats) {
            Booking booking = new Booking(null, user, flight, LocalDateTime.now(), "CONFIRMED", seat, flightClass, totalPricePerSeat, currency);
            
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
            Payment payment = new Payment(null, user, savedBooking, totalPricePerSeat, currency, txnId, payStatus, LocalDateTime.now());
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

    private Double calculatePrice(Double basePrice, String flightClass, String currency) {
        double multiplier = flightClass.equalsIgnoreCase("FIRST") ? 6.0 :
                flightClass.equalsIgnoreCase("BUSINESS") ? 3.0 :
                flightClass.equalsIgnoreCase("PREMIUM_ECONOMY") ? 1.5 : 1.0;
        
        // Basic exchange rates matching frontend
        double rate = 1.0;
        if (currency.equalsIgnoreCase("GHS")) rate = 14.5;
        else if (currency.equalsIgnoreCase("NGN")) rate = 1600.0;
        else if (currency.equalsIgnoreCase("KES")) rate = 128.0;
        else if (currency.equalsIgnoreCase("ZAR")) rate = 17.8;
        else if (currency.equalsIgnoreCase("EUR")) rate = 0.92;

        return (basePrice * multiplier) * rate;
    }

    public List<Booking> getUserBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user).stream()
                .filter(b -> !b.isArchivedByUser())
                .toList();
    }

    public List<Booking> getAllBookings() {
        // Dashboard view: exclude admin-archived bookings
        return bookingRepository.findAll().stream()
                .filter(b -> !b.isArchivedByAdmin())
                .toList();
    }

    public List<Booking> getHistoryBookings() {
        // History view: include ALL records (even admin-archived), unless hard-deleted
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

        if (!"ROLE_ADMIN".equals(user.getRole())) {
            if (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized cancellation attempt");
            }
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
        List<Payment> payments = paymentRepository.findByUser(booking.getUser());
        for(Payment p : payments) {
            if (p.getBooking() != null && p.getBooking().getId().equals(booking.getId())) {
                p.setStatus("REFUNDED");
                paymentRepository.save(p);
            }
        }
    }

    public void deleteBooking(String bookingId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"ROLE_ADMIN".equals(user.getRole())) {
            if (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized deletion attempt");
            }
        }

        if ("CONFIRMED".equals(booking.getStatus()) && booking.getFlight() != null) {
            Flight flight = booking.getFlight();
            flight.setAvailableSeats(flight.getAvailableSeats() + 1);
            String clazz = booking.getFlightClass() != null ? booking.getFlightClass().toUpperCase() : null;
            if (clazz != null && flight.getAvailableSeatsByClass() != null && flight.getAvailableSeatsByClass().containsKey(clazz)) {
                flight.getAvailableSeatsByClass().put(clazz, flight.getAvailableSeatsByClass().get(clazz) + 1);
            }
            flightRepository.save(flight);
        }

        List<Payment> payments = paymentRepository.findByUser(booking.getUser());
        for(Payment p : payments) {
            if (p.getBooking() != null && p.getBooking().getId().equals(booking.getId())) {
                paymentRepository.delete(p);
            }
        }

        bookingRepository.delete(booking);
    }

    public void cleanupUserBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> userBookings = bookingRepository.findByUser(user);
        List<Booking> toRemove = userBookings.stream()
                .filter(b -> "CANCELLED".equals(b.getStatus()) || b.getFlight() == null)
                .toList();

        bookingRepository.deleteAll(toRemove);
    }

    public void archiveBooking(String bookingId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getUser().getId().equals(user.getId()) && !"ROLE_ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized archive attempt");
        }
        
        booking.setArchivedByUser(true);
        bookingRepository.save(booking);
    }

    public void archiveUserBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> userBookings = bookingRepository.findByUser(user);
        for(Booking b : userBookings) {
            if ("CANCELLED".equals(b.getStatus()) || b.getFlight() == null) {
                b.setArchivedByUser(true);
                bookingRepository.save(b);
            }
        }
    }

    public void archiveByAdmin(String bookingId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"ROLE_ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized admin archive attempt");
        }

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setArchivedByAdmin(true);
        bookingRepository.save(booking);
    }

    public void hardDeleteBooking(String bookingId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"ROLE_ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized permanent deletion attempt");
        }

        deleteBooking(bookingId); // Already handles payment deletion and seat freeing
    }
}
