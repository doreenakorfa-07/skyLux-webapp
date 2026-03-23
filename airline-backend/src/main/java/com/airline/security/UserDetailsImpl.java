package com.airline.security;

import com.airline.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {
    private String id;
    private String email;
    @JsonIgnore
    private String password;
    private String profilePictureUrl;
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(String id, String email, String password, String profilePictureUrl,
                            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.profilePictureUrl = profilePictureUrl;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(user.getRole()));
        return new UserDetailsImpl(user.getId(), user.getEmail(), user.getPassword(), user.getProfilePictureUrl(), authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public String getId() { return id; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    
    @Override
    public String getPassword() { return password; }
    
    @Override
    public String getUsername() { return email; } // Returns email as "username" for Spring Security
    
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}
