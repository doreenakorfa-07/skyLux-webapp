package com.airline.repository;

import com.airline.entity.Flight;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface FlightRepository extends MongoRepository<Flight, String> {
    List<Flight> findByOriginAndDestinationAndDepartureTimeAfter(String origin, String destination, LocalDateTime departureTime);
}
