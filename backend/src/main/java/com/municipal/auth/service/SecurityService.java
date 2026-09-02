// SecurityService.java
package com.municipal.auth.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SecurityService {

    /**
     * Récupère l'email de l'utilisateur courant
     * @return l'email ou null si non authentifié
     */
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        return principal != null ? principal.toString() : null;
    }

    /**
     * Vérifie si un utilisateur est authentifié
     * @return true si authentifié
     */
    public boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null
                && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal());
    }

    /**
     * Récupère les rôles de l'utilisateur courant
     * @return les rôles ou une liste vide
     */
    public List<String> getCurrentUserRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return Collections.emptyList();
        }

        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList());
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     * @param role le rôle à vérifier (ex: "ADMIN", "USER")
     * @return true si l'utilisateur a le rôle
     */
    public boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role)
                        || a.getAuthority().equals(role));
    }

    /**
     * Vérifie si l'utilisateur est un administrateur
     */
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Vérifie si l'utilisateur est un utilisateur standard
     */
    public boolean isUser() {
        return hasRole("USER");
    }

    /**
     * Récupère l'objet Authentication courant
     */
    public Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}