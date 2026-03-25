package com.airline.repository;

import com.airline.entity.Flight;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface FlightRepository extends MongoRepository<Flight, String> {
    List<Flight> findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeAfter(String origin, String destination, LocalDateTime departureTime);
    List<Flight> findByOriginIgnoreCaseAndDestinationIgnoreCase(String origin, String destination);
    boolean existsByFlightNumber(String flightNumber);
}
