package com.visnex.exception;

/**
 * The {@code CountryNotFoundException} class is an exception that is thrown to
 * indicate
 * that a country entity could not be found. This exception is typically used
 * when attempting
 * to retrieve or operate on a country entity that does not exist in the system.
 * <p>
 * Instances of this exception are created with a specific detail message that
 * describes the
 * reason for the exception.
 * </p>
 * <p>
 * Example usage:
 * 
 * <pre>
 * {@code
 * try {
 *     // Code that may throw CountryNotFoundException
 * } catch (CountryNotFoundException e) {
 *     // Handle the exception, possibly providing user-friendly error messages
 *     // or taking appropriate actions to handle the absence of the country.
 * }
 * }
 * </pre>
 * </p>
 * 
 * @author Victor Espinoza de los Monteros
 * @see Exception
 */
public class CountryNotFoundException extends Exception {
    /**
     * Constructs a new exception with the specified detail message. The
     * cause is not initialized, and may subsequently be initialized by
     * a call to {@link #initCause}.
     *
     * @param message the detail message. The detail message is saved for
     *                later retrieval by the {@link #getMessage()} method.
     */
    public CountryNotFoundException(String message) {
        super(message);
    }
}
