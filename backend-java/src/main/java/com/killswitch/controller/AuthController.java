package com.killswitch.controller;

import com.killswitch.model.dto.LoginRequest;
import com.killswitch.model.dto.SignupRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final Map<String, LocalUser> usersByEmail = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> sessionsByToken = new ConcurrentHashMap<>();

    @PostMapping({"/register", "/signup"})
    public Map<String, Object> register(@Valid @RequestBody SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (usersByEmail.containsKey(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        LocalUser user = new LocalUser(UUID.randomUUID().toString(), request.getName().trim(), email,
            request.getPassword(), request.getCompanyName());
        usersByEmail.put(email, user);
        return sessionFor(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        LocalUser user = usersByEmail.get(request.getEmail().trim().toLowerCase());
        if (user == null || !user.password().equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        return sessionFor(user);
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(HttpServletRequest request) {
        String token = bearerToken(request);
        if (token != null) {
            sessionsByToken.remove(token);
        }
        return Map.of("ok", true);
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword() {
        return Map.of("ok", true);
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword() {
        return Map.of("ok", true);
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) {
        String token = bearerToken(request);
        Map<String, Object> user = token == null ? null : sessionsByToken.get(token);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired.");
        }
        return user;
    }

    private Map<String, Object> sessionFor(LocalUser user) {
        String token = UUID.randomUUID().toString().replace("-", "");
        Map<String, Object> userPayload = userPayload(user);
        sessionsByToken.put(token, userPayload);
        return Map.of(
            "access_token", token,
            "refresh_token", token,
            "token_type", "bearer",
            "user", userPayload
        );
    }

    private Map<String, Object> userPayload(LocalUser user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", user.id());
        payload.put("name", user.name());
        payload.put("email", user.email());
        if (user.companyName() != null && !user.companyName().isBlank()) {
            payload.put("company_name", user.companyName());
        }
        return payload;
    }

    private String bearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        return header.substring("Bearer ".length());
    }

    private record LocalUser(String id, String name, String email, String password, String companyName) {
    }
}
