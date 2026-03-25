package com.airline.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String role; // ROLE_USER, ROLE_ADMIN

    private String profilePictureUrl;

    private String firstName;
    private String lastName;
    private String otherNames;

    @Indexed(unique = true)
    private String username;

    private boolean blocked = false; // admin can block/unblock

    private boolean bookingNotifications = true;
    private boolean flightStatusNotifications = true;

    public User() {}

    public User(String id, String email, String password, String role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public User(String id, String email, String password, String role, String profilePictureUrl) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.profilePictureUrl = profilePictureUrl;
    }

    public User(String id, String email, String password, String role, String firstName, String lastName, String otherNames, String username) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.otherNames = otherNames;
        this.username = username;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getOtherNames() { return otherNames; }
    public void setOtherNames(String otherNames) { this.otherNames = otherNames; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public boolean isBlocked() { return blocked; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }

    public boolean isBookingNotifications() { return bookingNotifications; }
    public void setBookingNotifications(boolean bookingNotifications) { this.bookingNotifications = bookingNotifications; }
    public boolean isFlightStatusNotifications() { return flightStatusNotifications; }
    public void setFlightStatusNotifications(boolean flightStatusNotifications) { this.flightStatusNotifications = flightStatusNotifications; }
}
