package com.visnex.authservice.utils;

import com.visnex.authservice.security.Params;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

@Component
public class utilities {

    private static Params params;
    // private static String claveHex =
    // "3a1f8a790c238b8df0d447b53d792134b5cc7f2c8f7f62f168e4d1c978e5f384";

    @Autowired
    public utilities(Params params) {
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
        byte[] datosDesencriptadosBytes = cipher.doFinal(datosEncriptadosBytes);

        return new String(datosDesencriptadosBytes, "utf-8");
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

}
