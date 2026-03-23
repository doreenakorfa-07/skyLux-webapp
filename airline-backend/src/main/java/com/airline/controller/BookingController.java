package com.airline.controller;

import com.airline.entity.Booking;
import com.airline.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {
    @Autowired
    BookingService bookingService;

    @PostMapping
    public List<Booking> bookTicket(@RequestBody Map<String, Object> bookingRequest) {
        String flightId = (String) bookingRequest.get("flightId");
        Integer numSeats = (Integer) bookingRequest.getOrDefault("numSeats", 1);
        String flightClass = (String) bookingRequest.get("flightClass");
        String paymentMethod = (String) bookingRequest.getOrDefault("paymentMethod", "ONLINE");
        return bookingService.bookTickets(flightId, numSeats, flightClass, paymentMethod);
    }

    @GetMapping("/user")
    public List<Booking> getUserBookings() {
        return bookingService.getUserBookings();
    }

    @GetMapping("/flight/{flightId}/seats")
    public List<String> getOccupiedSeats(@PathVariable("flightId") String flightId) {
        return bookingService.getOccupiedSeats(flightId);
    }

    @GetMapping("/all")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{bookingId}/cancel")
    public void cancelBooking(@PathVariable("bookingId") String bookingId) {
        bookingService.cancelBooking(bookingId);
    }
}
