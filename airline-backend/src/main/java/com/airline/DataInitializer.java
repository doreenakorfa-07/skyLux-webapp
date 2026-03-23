package com.airline;

import com.airline.entity.Booking;
import com.airline.entity.Flight;
import com.airline.entity.User;
import com.airline.repository.BookingRepository;
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
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, FlightRepository flightRepository, BookingRepository bookingRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.flightRepository = flightRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        System.out.println("SkyLux: Starting Data Initialization...");

        // Seed default accounts
        if (!userRepository.existsByEmail("dakorfa1212@gmail.com")) {
            userRepository.save(new User(null, "dakorfa1212@gmail.com", passwordEncoder.encode("Ada3356768"), "ROLE_ADMIN", "Doreen", "Akorfa", "dakorfa", "Doreen Akorfa"));
        }
        if (!userRepository.existsByEmail("member@skylux.com")) {
            userRepository.save(new User(null, "member@skylux.com", passwordEncoder.encode("member123"), "ROLE_USER", "Test", "Member", "testmember", "testmember"));
        }
        if (!userRepository.existsByEmail("traveler@skylux.com")) {
            userRepository.save(new User(null, "traveler@skylux.com", passwordEncoder.encode("traveler123"), "ROLE_USER", "Frequent", "Traveler", "traveler_pro", "traveler_pro"));
        }

        // Seed flights if empty or very low
        if (flightRepository.count() < 25) {
            System.out.println("SkyLux: Flights missing or low. Seeding diverse flight set...");
            flightRepository.deleteAll(); // Clean reset for fresh seed
            flightRepository.save(createFlight("SL101", "London",   "New York",      1, 8,  550.0,  200));
            flightRepository.save(createFlight("SL102", "Paris",    "Tokyo",         2, 12, 850.0,  250));
            flightRepository.save(createFlight("SL103", "Berlin",   "Sydney",        3, 22, 1250.0, 300));
            flightRepository.save(createFlight("SL201", "New York", "London",         5, 7,  480.0,  220));
            flightRepository.save(createFlight("SL442", "Tokyo",    "San Francisco", 4, 9,  920.0,  250));
            flightRepository.save(createFlight("SL500", "Dubai",    "Mumbai",        1, 3,  320.0,  300));
            flightRepository.save(createFlight("SL001", "Sydney",   "Singapore",     2, 8,  600.0,  200));
            flightRepository.save(createFlight("SL088", "Singapore", "Tokyo",        3, 7,  700.0,  180));
            flightRepository.save(createFlight("SL999", "Rome",      "New York",     4, 9,  750.0,  250));
            flightRepository.save(createFlight("SL777", "Los Angeles","Tokyo",       2, 11, 950.0,  300));
            flightRepository.save(createFlight("SL111", "London",     "Paris",       1, 1,  150.0,  120));
            flightRepository.save(createFlight("SL222", "Frankfurt",  "Milan",       2, 1,  180.0,  120));
            flightRepository.save(createFlight("SL333", "Amsterdam",  "Madrid",      3, 2,  220.0,  150));
            flightRepository.save(createFlight("SL444", "Barcelona",  "Lisbon",      4, 1,  120.0,  100));
            flightRepository.save(createFlight("SL555", "Cape Town",  "Dubai",       5, 9,  880.0,  200));
            flightRepository.save(createFlight("SL666", "Cairo",      "Istanbul",    1, 2,  250.0,  150));
            flightRepository.save(createFlight("SL888", "Delhi",      "Bangkok",     2, 4,  350.0,  200));
            flightRepository.save(createFlight("SL123", "Seoul",      "Singapore",   3, 6,  450.0,  200));
            flightRepository.save(createFlight("SL456", "Hong Kong",  "Sydney",      4, 9,  700.0,  250));
            flightRepository.save(createFlight("SL789", "Toronto",    "Vancover",    5, 5,  300.0,  180));
        }

        // Seed some sample bookings if empty
        if (bookingRepository.count() == 0) {
            System.out.println("SkyLux: Bookings empty. Seeding samples...");
            User member = userRepository.findByEmail("member@skylux.com").orElse(null);
            Flight flight = flightRepository.findAll().stream().findFirst().orElse(null);
            if (member != null && flight != null) {
                bookingRepository.save(new Booking(null, member, flight, LocalDateTime.now().minusDays(1), "CONFIRMED", "12A", "BUSINESS", 850.0));
                bookingRepository.save(new Booking(null, member, flight, LocalDateTime.now().minusDays(2), "CONFIRMED", "14C", "ECONOMY", 450.0));
            }
        }
        
        System.out.println("SkyLux: Data Initialization Complete.");
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

        // Pre-decrement for sample bookings
        if (number.equals("AA101")) { 
            available.put("BUSINESS", businessSeats - 1);
            available.put("ECONOMY", economySeats - 1);
        }

        return new Flight(null, number, origin, dest,
                LocalDateTime.now().plusDays(daysOut), LocalDateTime.now().plusDays(daysOut).plusHours(hoursDuration),
                price, totalSeats, totalSeats - (number.equals("AA101") ? 2 : 0),
                capacity, available);
    }
}
