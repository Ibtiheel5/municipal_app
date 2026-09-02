// AuthService.java
package com.municipal.auth.service;

import com.municipal.auth.dto.request.LoginRequest;
import com.municipal.auth.dto.request.RegisterRequest;
import com.municipal.auth.dto.response.AuthResponse;
import com.municipal.auth.entity.Role;
import com.municipal.auth.entity.User;
import com.municipal.auth.entity.UserStatut;
import com.municipal.auth.exception.EmailAlreadyExistsException;
import com.municipal.auth.repository.UserRepository;
import com.municipal.auth.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Cet email est déjà utilisé : " + request.getEmail());
        }

        // ✅ Création manuelle de l'utilisateur
        User user = new User();
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setStatut(UserStatut.EN_ATTENTE);

        userRepository.save(user);

        return AuthResponse.builder()
                .email(user.getEmail())
                .nom(user.getNom())
                .role(user.getRole().name())
                .statut(user.getStatut().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .nom(user.getNom())
                .role(user.getRole().name())
                .statut(user.getStatut().name())
                .build();
    }
}