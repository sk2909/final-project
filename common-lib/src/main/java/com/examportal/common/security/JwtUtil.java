package com.examportal.common.security;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JwtUtil {

    // private final String SECRET_KEY = "your_secret_key"; Replace with a strong secret key
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    // Generate JWT Token
    public String generateToken(String email, String role, Long id) {
        return Jwts.builder()
                .setSubject(email)
                .claim("id", id) // Add userId to the token
                .claim("role", role) // Add role to the token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    // Validate JWT Token
    public boolean validateToken(String token, String email) {
        String tokenEmail = extractEmail(token);
        boolean valid = (tokenEmail.equals(email) && !isTokenExpired(token));
        System.out.println("JwtUtil: tokenEmail=" + tokenEmail + ", inputEmail=" + email + ", valid=" + valid);
        return valid;
    }

    // Extract Email from Token
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // Extract Role from Token
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    // Extract UserId from Token
    public Long extractUserId(String token) {
        Claims claims = extractClaims(token);
        return claims.get("id", Long.class); // Ensure "userId" is present in the token claims
    }

    // Check if Token is Expired
    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // Extract Claims
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }
}
