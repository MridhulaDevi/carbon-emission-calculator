package com.example.carbon_emission.service;

import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.ActivityLogRepository;
import com.example.carbon_emission.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
            UserRepository userRepository,
            ActivityLogRepository activityLogRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // GET ALL USERS
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }


    // CREATE USER
    public User createUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        if (user.getRole() == null ||
                user.getRole().isBlank()) {

            user.setRole("USER");
        }

        return userRepository.save(user);
    }


    // UPDATE USER
    public User updateUser(
            Long id,
            User updatedUser) {

        User existingUser =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found with id: "
                                                + id
                                ));

        existingUser.setName(
                updatedUser.getName()
        );

        existingUser.setEmail(
                updatedUser.getEmail()
        );

        existingUser.setGender(
                updatedUser.getGender()
        );

        existingUser.setAge(
                updatedUser.getAge()
        );

        existingUser.setRole(
                updatedUser.getRole()
        );

        existingUser.setPreferredTransport(
                updatedUser.getPreferredTransport()
        );

        existingUser.setDietPreference(
                updatedUser.getDietPreference()
        );

        existingUser.setEnergySource(
                updatedUser.getEnergySource()
        );

        existingUser.setSustainabilityGoal(
                updatedUser.getSustainabilityGoal()
        );


        // Only change password if admin entered one
        if (updatedUser.getPassword() != null &&
                !updatedUser.getPassword()
                        .trim()
                        .isEmpty()) {

            existingUser.setPassword(
                    passwordEncoder.encode(
                            updatedUser.getPassword()
                    )
            );
        }

        return userRepository.save(existingUser);
    }


    // DELETE USER
    public void deleteUser(Long id) {

        User user =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found with id: "
                                                + id
                                ));

        // Delete user's activities first
        activityLogRepository.deleteByUser(user);

        // Then delete user
        userRepository.delete(user);
    }
}