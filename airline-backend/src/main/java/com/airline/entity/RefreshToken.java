package com.airline.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "refreshtoken")
public class RefreshToken {
    @Id
    private String id;
    private String userEmail;
    private String token;
    private Instant expiryDate;

    public RefreshToken() {}

    public RefreshToken(String id, String userEmail, String token, Instant expiryDate) {
        this.id = id;
        this.userEmail = userEmail;
        this.token = token;
        this.expiryDate = expiryDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Instant getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Instant expiryDate) { this.expiryDate = expiryDate; }
}
