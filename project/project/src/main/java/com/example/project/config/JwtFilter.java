package com.example.project.config;

import com.example.project.service.AccountService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AccountService accountService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username = null;

        try {
            username = jwtUtil.extractUsername(token);
        } catch (IllegalArgumentException e) {
            logger.error("Unable to get JWT Token", e);
        } catch (ExpiredJwtException e) {
            logger.error("JWT Token has expired", e);
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature", e);
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token", e);
        } catch (UnsupportedJwtException e) {
            logger.error("Unsupported JWT token", e);
        } catch (Exception e) {
            logger.error("An error occurred during JWT token parsing", e);
        }


        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
<<<<<<< Updated upstream
            UserDetails userDetails = this.accountService.loadUserByUsername(username);
            if (jwtUtil.validateToken(token)) {
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                logger.info("Authenticated user: " + username + ", setting security context");
=======
            if (jwtUtil.validateToken(jwt)) {
                String role = jwtUtil.extractRole(jwt);
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                if (role != null) {
                    if (role.startsWith("ROLE_")) {
                        authorities.add(new SimpleGrantedAuthority(role));
                    } else {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    }
                }
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                System.out.println("Authentication set for username: " + username);
                System.out.println("Extracted role from token: " + role);
                System.out.println("Authorities set: " + authorities);
>>>>>>> Stashed changes
            } else {
                logger.warn("JWT token validation failed for user: " + username);
            }
        }
        filterChain.doFilter(request, response);
    }
}