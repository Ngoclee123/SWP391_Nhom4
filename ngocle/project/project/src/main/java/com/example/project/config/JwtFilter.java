package com.example.project.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        logger.debug("Processing request for path: {}", path);

        if (path.startsWith("/api/login") || path.startsWith("/api/register") ||
                path.startsWith("/oauth2/authorization/google") || path.startsWith("/login/oauth2/code/") ||
                path.equals("/login") || path.equals("/oauth2/redirect")) {
            logger.debug("Skipping authentication for public path: {}", path);
            chain.doFilter(request, response);  
            return;
        }

        String authorizationHeader = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", authorizationHeader);

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.debug("Extracted username from token: {}", username);
            } catch (Exception e) {
                logger.error("Failed to extract username from token: {}, error: {}", jwt, e.getMessage());
            }
        } else {
            logger.warn("No Authorization header or not a Bearer token, request URI: {}", request.getRequestURI());
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            logger.debug("SecurityContext is null, attempting to set authentication for username: {}", username);
            if (jwtUtil.validateToken(jwt)) {
                try {
                    String role = jwtUtil.extractRole(jwt);
                    logger.debug("Extracted role from token: {}", role);
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    logger.info("Authentication set for username: {} with role: {}", username, role);
                } catch (Exception e) {
                    logger.error("Failed to set authentication: {}", e.getMessage());
                }
            } else {
                logger.error("Token validation failed for username: {}, jwt: {}", username, jwt);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired JWT token");
                return;
            }
        } else if (username != null) {
            logger.debug("Authentication already set or username null, skipping re-authentication");
        } else {
            logger.warn("No username extracted, proceeding without authentication");
        }

        chain.doFilter(request, response);
    }
}