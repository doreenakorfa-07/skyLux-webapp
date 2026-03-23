package com.airline.repository;

import com.airline.entity.Booking;
import com.airline.entity.User;
import com.airline.entity.Flight;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUser(User user);
    boolean existsByFlightAndSeatNumberAndStatusNot(Flight flight, String seatNumber, String status);
    List<Booking> findByFlightAndStatusNot(Flight flight, String status);
}
