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

        // Seed flights if missing
        seedFlightIfMissing("SL101", "London",   "Accra",         1, 8,  550.0,  200);
        seedFlightIfMissing("SL102", "Casablanca","Lagos",         2, 12, 850.0,  250);
        seedFlightIfMissing("SL103", "Cairo",     "Nairobi",      3, 22, 1250.0, 300);
        seedFlightIfMissing("SL201", "New York", "Cape Town",     5, 17, 980.0,  220);
        seedFlightIfMissing("SL442", "Tokyo",    "Nairobi",       4, 15, 920.0,  250);
        seedFlightIfMissing("SL500", "Dubai",    "Accra",         1, 10, 820.0,  300);
        seedFlightIfMissing("SL001", "Cape Town", "Singapore",     2, 12, 700.0,  200);
        seedFlightIfMissing("SL088", "Casablanca", "Paris",        3, 4,  300.0,  180);
        seedFlightIfMissing("SL999", "Rome",      "Cairo",        4, 3,  450.0,  250);
        seedFlightIfMissing("SL777", "Lagos",     "Dubai",        2, 7,  650.0,  300);
        seedFlightIfMissing("SL111", "London",     "Lagos",       1, 6,  750.0,  120);
        seedFlightIfMissing("SL222", "Accra",      "Johannesburg", 2, 6,  580.0,  120);
        seedFlightIfMissing("SL333", "Nairobi",    "Addis Ababa",  3, 2,  220.0,  150);
        seedFlightIfMissing("SL444", "Dakar",      "Abidjan",     4, 1,  180.0,  100);
        seedFlightIfMissing("SL555", "Cape Town",  "Mauritius",    5, 4,  480.0,  200);
        seedFlightIfMissing("SL666", "Cairo",      "Istanbul",    1, 2,  250.0,  150);
        seedFlightIfMissing("SL888", "Delhi",      "Bangkok",     2, 4,  350.0,  200);
        seedFlightIfMissing("SL123", "Seoul",      "Singapore",   3, 6,  450.0,  200);
        seedFlightIfMissing("SL456", "Hong Kong",  "Sydney",      4, 9,  700.0,  250);
        seedFlightIfMissing("SL789", "Toronto",    "Vancover",    5, 5,  300.0,  180);
        seedFlightIfMissing("SL112", "London",     "Accra",       2, 6,  750.0,  250);
        seedFlightIfMissing("SL223", "Paris",      "Lagos",       3, 6,  720.0,  250);
        seedFlightIfMissing("SL334", "Dubai",      "Nairobi",     4, 5,  450.0,  200);

        // Seed some sample bookings if empty or missing
        User member = userRepository.findByEmail("member@skylux.com").orElse(null);
        Flight flight = flightRepository.findAll().stream().filter(f -> f.getFlightNumber().equals("SL101")).findFirst()
                .orElse(flightRepository.findAll().stream().findFirst().orElse(null));
        
        if (member != null && flight != null) {
            // Check if these specific seats are already booked on this flight by this user
            boolean exists1 = bookingRepository.findAll().stream()
                    .anyMatch(b -> b.getUser().getId().equals(member.getId()) && b.getFlight().getId().equals(flight.getId()) && "12A".equals(b.getSeatNumber()));
            if (!exists1) {
                bookingRepository.save(new Booking(null, member, flight, LocalDateTime.now().minusDays(1), "CONFIRMED", "12A", "BUSINESS", 850.0, "USD", "ONLINE"));
            }

            boolean exists2 = bookingRepository.findAll().stream()
                    .anyMatch(b -> b.getUser().getId().equals(member.getId()) && b.getFlight().getId().equals(flight.getId()) && "14C".equals(b.getSeatNumber()));
            if (!exists2) {
                bookingRepository.save(new Booking(null, member, flight, LocalDateTime.now().minusDays(2), "CONFIRMED", "14C", "ECONOMY", 450.0, "USD", "ONLINE"));
            }
        }
        
        System.out.println("SkyLux: Data Initialization Complete.");
    }

    private void seedFlightIfMissing(String number, String origin, String dest, int daysOut, int hoursDuration, double price, int totalSeats) {
        if (!flightRepository.existsByFlightNumber(number)) {
            flightRepository.save(createFlight(number, origin, dest, daysOut, hoursDuration, price, totalSeats));
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
