package com.visnex.authservice.utils;

import com.visnex.authservice.security.Params;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

@Component
public class securityUtil {

    private static Params params;

    @Autowired
    public securityUtil(Params params) {
        this.params = params;
    }

    public static String decrypt(String encrypted) throws Exception {

        String dataEncrypt = encrypted.split("\\.")[0];
        String ivHex = encrypted.split("\\.")[1];
        byte[] claveBytes = hexStringToByteArray(params.getSecretConnexion());
        byte[] ivBytes = hexStringToByteArray(ivHex);

        SecretKeySpec secretKey = new SecretKeySpec(claveBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(ivBytes));

        byte[] datosEncriptadosBytes = hexStringToByteArray(dataEncrypt);
        try {
            byte[] datosDesencriptadosBytes = cipher.doFinal(datosEncriptadosBytes);

            return new String(datosDesencriptadosBytes, "utf-8");
        } catch (Exception err) {
            return "error in decrypt";
        }
    }

    private static byte[] hexStringToByteArray(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }

    public static String encrypt(String data) throws Exception {
        String password = params.getSecretConnexion();
        byte[] keyBytes = hexStringToByteArray(password);

        // Generar IV aleatorio
        byte[] ivBytes = new byte[16];
        new SecureRandom().nextBytes(ivBytes);
        IvParameterSpec ivParameterSpec = new IvParameterSpec(ivBytes);

        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivParameterSpec);

        // Encriptar datos
        byte[] encryptedBytes = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));

        // Combinar datos encriptados y IV en una cadena
        String encryptedData = byteArrayToHexString(encryptedBytes);
        String ivHex = byteArrayToHexString(ivBytes);
        return encryptedData + "." + ivHex;
    }

    // Método para convertir un array de bytes a una cadenahexadecimal
    private static String byteArrayToHexString(byte[] array) {
        StringBuilder result = new StringBuilder();
        for (byte b : array) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}