package com.example.carbon_emission.dto;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class OtpService {

    private final SecureRandom random = new SecureRandom();

    private static final long OTP_EXPIRY = 5 * 60 * 1000L;
    private static final long RESET_EXPIRY = 5 * 60 * 1000L;
    private static final long RESEND_COOLDOWN = 60 * 1000L;
    private static final int MAX_ATTEMPTS = 5;

    private final Map<String, OtpData> otpStorage = new HashMap<>();

    private final Map<String, ResetData> resetStorage = new HashMap<>();

    private static class OtpData {

        String otp;
        long expiry;
        long createdAt;
        int attempts;

        OtpData(String otp, long expiry, long createdAt) {
            this.otp = otp;
            this.expiry = expiry;
            this.createdAt = createdAt;
            this.attempts = 0;
        }
    }

    private static class ResetData {

        String token;
        long expiry;

        ResetData(String token, long expiry) {
            this.token = token;
            this.expiry = expiry;
        }
    }

    public synchronized String generateOtp(String email) {

        long now = System.currentTimeMillis();

        otpStorage.entrySet().removeIf(
                entry -> entry.getValue().expiry <= now
        );

        resetStorage.entrySet().removeIf(
                entry -> entry.getValue().expiry <= now
        );

        OtpData existing = otpStorage.get(email);

        if (existing != null &&
                now - existing.createdAt < RESEND_COOLDOWN) {

            throw new RuntimeException(
                    "Please wait 60 seconds before requesting another OTP."
            );
        }

        String otp = String.format(
                "%06d", random.nextInt(1000000)
        );

        otpStorage.put(
                email,
                new OtpData(otp, now + OTP_EXPIRY, now)
        );

        resetStorage.remove(email);

        return otp;
    }

    public synchronized String verifyOtp(String email, String otp) {

        OtpData data = otpStorage.get(email);

        if (data == null) {
            throw new RuntimeException(
                    "Please request an OTP first."
            );
        }

        if (System.currentTimeMillis() >= data.expiry) {

            otpStorage.remove(email);

            throw new RuntimeException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (data.attempts >= MAX_ATTEMPTS) {

            throw new RuntimeException(
                    "Too many incorrect attempts. Please request a new OTP."
            );
        }

        if (!data.otp.equals(otp)) {

            data.attempts++;

            throw new RuntimeException(
                    "Incorrect OTP. Attempts remaining: "
                            + (MAX_ATTEMPTS - data.attempts)
            );
        }

        otpStorage.remove(email);

        String resetToken = UUID.randomUUID().toString();

        resetStorage.put(
                email,
                new ResetData(
                        resetToken,
                        System.currentTimeMillis() + RESET_EXPIRY
                )
        );

        return resetToken;
    }

    public synchronized boolean consumeResetToken(
            String email, String token) {

        ResetData data = resetStorage.get(email);

        if (data == null) {
            return false;
        }

        if (System.currentTimeMillis() >= data.expiry) {

            resetStorage.remove(email);
            return false;
        }

        if (!data.token.equals(token)) {
            return false;
        }

        resetStorage.remove(email);

        return true;
    }

    public synchronized void removeOtp(String email, String otp) {

        OtpData data = otpStorage.get(email);

        if (data != null && data.otp.equals(otp)) {
            otpStorage.remove(email);
        }
    }
}