package com.airline;

import com.airline.entity.Flight;
import com.airline.entity.User;
import com.airline.repository.FlightRepository;
import com.airline.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, FlightRepository flightRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.flightRepository = flightRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Force clean start to ensure class-specific maps are seeded
        flightRepository.deleteAll();

        if (userRepository.count() == 0) {
            userRepository.save(new User(null, "admin@antigravity.com", passwordEncoder.encode("admin123"), "ROLE_ADMIN"));
            userRepository.save(new User(null, "user@antigravity.com", passwordEncoder.encode("user123"), "ROLE_USER"));
        }

        if (true) {
            if (flightRepository.count() == 0) {
                flightRepository.save(createFlight("AA101", "London", "New York", 1, 8, 500.0, 100));
                flightRepository.save(createFlight("AA102", "Paris", "Tokyo", 2, 12, 800.0, 150));
                flightRepository.save(createFlight("AA103", "Berlin", "Sydney", 3, 22, 1200.0, 200));
            }

            // Add new available flights
            flightRepository.save(createFlight("DL201", "New York", "London", 5, 7, 450.0, 120));
            flightRepository.save(createFlight("UA442", "Tokyo", "San Francisco", 4, 9, 900.0, 150));
            flightRepository.save(createFlight("EK500", "Dubai", "Mumbai", 2, 3, 300.0, 200));
            flightRepository.save(createFlight("QF1", "Sydney", "London", 10, 24, 1500.0, 250));
            flightRepository.save(createFlight("AC88", "Toronto", "Paris", 7, 8, 650.0, 100));
            flightRepository.save(createFlight("JL43", "Tokyo", "London", 14, 14, 1100.0, 300));
            flightRepository.save(createFlight("AF340", "Paris", "New York", 1, 7, 350.0, 150));
        }
    }

    private Flight createFlight(String number, String origin, String dest, int daysOut, int hoursDuration, double price, int totalSeats) {
        int firstSeats = 12; // 2 rows of 6
        int businessSeats = 24; // 4 rows of 6
        int premiumSeats = 36; // 6 rows of 6
        int economySeats = totalSeats - (firstSeats + businessSeats + premiumSeats);
        if (economySeats < 0) economySeats = totalSeats; // fallback
        
        java.util.Map<String, Integer> capacity = new java.util.HashMap<>(4);
        capacity.put("FIRST", firstSeats);
        capacity.put("BUSINESS", businessSeats);
        capacity.put("PREMIUM_ECONOMY", premiumSeats);
        capacity.put("ECONOMY", economySeats);

        java.util.Map<String, Integer> available = new java.util.HashMap<>(capacity);

        return new Flight(null, number, origin, dest,
                LocalDateTime.now().plusDays(daysOut), LocalDateTime.now().plusDays(daysOut).plusHours(hoursDuration),
                price, totalSeats, totalSeats,
                capacity, available);
    }
}
