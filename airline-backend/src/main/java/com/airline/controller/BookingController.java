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
    public Booking bookTicket(@RequestBody Map<String, String> bookingRequest) {
        String flightId = bookingRequest.get("flightId");
        String seatNumber = bookingRequest.get("seatNumber");
        String flightClass = bookingRequest.get("flightClass");
        String paymentMethod = bookingRequest.getOrDefault("paymentMethod", "ONLINE");
        return bookingService.bookTicket(flightId, seatNumber, flightClass, paymentMethod);
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
