package com.visnex.auditservice.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
public class JWTAuthorizationFilter extends OncePerRequestFilter {

    private static final String BEARER = "Bearer ";
    private static final String ROLES = "roles";
    private static final String AUTHORIZATION = "Authorization";
    private final SecParams secParams;

    public JWTAuthorizationFilter(SecParams secParams) {
        this.secParams = secParams;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String jwt = request.getHeader(AUTHORIZATION);
        if (jwt == null || !jwt.startsWith(BEARER)) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secParams.getSecret())).build();
            jwt = jwt.substring(7);
            DecodedJWT decodedJWT = verifier.verify(jwt);

            String username = decodedJWT.getSubject();
            List<String> roles = decodedJWT.getClaims().get(ROLES).asList(String.class);
            Collection<GrantedAuthority> authorities = new ArrayList<>();

            for (String r : roles) {
                authorities.add(new SimpleGrantedAuthority(r));
            }

            UsernamePasswordAuthenticationToken user = new UsernamePasswordAuthenticationToken(username, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(user);
        } catch (Exception e) {
            // Token invalido o expirado: se continua sin autenticacion y Spring Security responde 403.
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }
}
