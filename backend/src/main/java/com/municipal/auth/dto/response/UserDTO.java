package com.municipal.auth.dto.response;

import com.municipal.auth.entity.User;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String nom;
    private String email;
    private String role;
    private String statut;
    private String municipaliteNom;

    public static UserDTO from(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setStatut(user.getStatut().name());
        if (user.getMunicipalite() != null) {
            dto.setMunicipaliteNom(user.getMunicipalite().getNom());
        }
        return dto;
    }
}
