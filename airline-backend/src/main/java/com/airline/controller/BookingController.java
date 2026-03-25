package com.airline.controller;

import com.airline.entity.Booking;
import com.airline.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    BookingService bookingService;

    @PostMapping
    public List<Booking> bookTicket(@RequestBody Map<String, Object> bookingRequest) {
        String flightId = (String) bookingRequest.get("flightId");
        Integer numSeats = (Integer) bookingRequest.getOrDefault("numSeats", 1);
        String flightClass = (String) bookingRequest.get("flightClass");
        String paymentMethod = (String) bookingRequest.getOrDefault("paymentMethod", "ONLINE");
        String currency = (String) bookingRequest.getOrDefault("currency", "USD");
        return bookingService.bookTickets(flightId, numSeats, flightClass, paymentMethod, currency);
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

    @GetMapping("/history")
    public List<Booking> getHistoryBookings() {
        return bookingService.getHistoryBookings();
    }

    @PutMapping("/{bookingId}/cancel")
    public void cancelBooking(@PathVariable("bookingId") String bookingId) {
        bookingService.cancelBooking(bookingId);
    }

    @DeleteMapping("/{bookingId}")
    public void deleteBooking(@PathVariable("bookingId") String bookingId) {
        bookingService.deleteBooking(bookingId);
    }

    @DeleteMapping("/cleanup")
    public void cleanupBookings() {
        bookingService.cleanupUserBookings();
    }

    @PutMapping("/{bookingId}/archive")
    public void archiveBooking(@PathVariable("bookingId") String bookingId) {
        bookingService.archiveBooking(bookingId);
    }

    @PutMapping("/cleanup/archive")
    public void archiveCleanupBookings() {
        bookingService.archiveUserBookings();
    }

    @PutMapping("/{bookingId}/archive-admin")
    public void archiveByAdmin(@PathVariable("bookingId") String bookingId) {
        bookingService.archiveByAdmin(bookingId);
    }

    @DeleteMapping("/{bookingId}/permanent")
    public void hardDeleteBooking(@PathVariable("bookingId") String bookingId) {
        bookingService.hardDeleteBooking(bookingId);
    }
}
