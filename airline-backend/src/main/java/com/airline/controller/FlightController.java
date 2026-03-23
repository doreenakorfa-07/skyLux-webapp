package com.airline.controller;

import com.airline.entity.Flight;
import com.airline.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FlightController {
    @Autowired
    FlightService flightService;

    @GetMapping
    public List<Flight> getAllFlights() {
        return flightService.getAllFlights();
    }

    @GetMapping("/search")
    public List<Flight> searchFlights(@RequestParam("origin") String origin, @RequestParam("destination") String destination, @RequestParam("date") String date) {
        return flightService.searchFlights(origin, destination, date);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Flight addFlight(@RequestBody Flight flight) {
        return flightService.addFlight(flight);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteFlight(@PathVariable("id") String id) {
        flightService.deleteFlight(id);
    }
}
