package com.municipal.auth.service;

import com.municipal.auth.dto.response.UserDTO;
import com.municipal.auth.entity.*;
import com.municipal.auth.repository.MunicipaliteRepository;
import com.municipal.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final MunicipaliteRepository municipaliteRepository;

    public List<UserDTO> getUsersEnAttente() {
        return userRepository.findByStatut(UserStatut.EN_ATTENTE)
                .stream().map(UserDTO::from).toList();
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER)
                .map(UserDTO::from)
                .toList();
    }

    @Transactional
    public UserDTO accepterEtAffecter(Long userId, Long municipaliteId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Municipalite municipalite = municipaliteRepository.findById(municipaliteId)
                .orElseThrow(() -> new RuntimeException("Municipalité non trouvée"));
        user.setStatut(UserStatut.ACTIF);
        user.setMunicipalite(municipalite);
        return UserDTO.from(userRepository.save(user));
    }

    @Transactional
    public UserDTO refuserUtilisateur(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setStatut(UserStatut.REFUSE);
        return UserDTO.from(userRepository.save(user));
    }

    public List<Municipalite> getAllMunicipalites() {
        return municipaliteRepository.findAll();
    }
}
