package com.airline.service;

import com.airline.entity.Flight;
import com.airline.repository.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class FlightService {
    @Autowired
    FlightRepository flightRepository;

    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    public List<Flight> searchFlights(String origin, String destination, String date) {
        // Date parsing logic
        LocalDateTime dateTime = LocalDateTime.parse(date + "T00:00:00");
        return flightRepository.findByOriginAndDestinationAndDepartureTimeAfter(origin, destination, dateTime);
    }

    public Flight addFlight(Flight flight) {
        return flightRepository.save(flight);
    }

    public void deleteFlight(String id) {
        flightRepository.deleteById(id);
    }

    public Flight getFlightById(String id) {
        return flightRepository.findById(id).orElse(null);
    }
}
