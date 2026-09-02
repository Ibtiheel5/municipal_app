package com.municipal.auth.controller;

import com.municipal.auth.dto.response.UserDTO;
import com.municipal.auth.entity.Municipalite;
import com.municipal.auth.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users/en-attente")
    public ResponseEntity<List<UserDTO>> getUsersEnAttente() {
        return ResponseEntity.ok(adminService.getUsersEnAttente());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/accepter")
    public ResponseEntity<UserDTO> accepterEtAffecter(
            @PathVariable Long userId,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(adminService.accepterEtAffecter(userId, body.get("municipaliteId")));
    }

    @PutMapping("/users/{userId}/refuser")
    public ResponseEntity<UserDTO> refuserUtilisateur(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.refuserUtilisateur(userId));
    }

    @GetMapping("/municipalites")
    public ResponseEntity<List<Municipalite>> getMunicipalites() {
        return ResponseEntity.ok(adminService.getAllMunicipalites());
    }
}
