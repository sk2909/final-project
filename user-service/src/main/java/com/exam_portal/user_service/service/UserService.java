package com.exam_portal.user_service.service;

import com.examportal.common.dto.UserDTO;
import com.exam_portal.user_service.model.User;

import java.util.List;


public interface UserService {
    UserDTO registerUser(UserDTO userDTO);
    String loginUser(String email, String password, Long id);
    UserDTO getUserProfileFromToken(String token);
    UserDTO updateUserProfile(String token, UserDTO updatedUser);
    UserDTO getUserByEmail(String email);
    UserDTO getUserById(Long id);
    List<UserDTO> getAllUsers();
    UserDTO assignRole(Long id, String role);
    User findByEmail(String email);
    String getEmailFromToken(String token);
}

