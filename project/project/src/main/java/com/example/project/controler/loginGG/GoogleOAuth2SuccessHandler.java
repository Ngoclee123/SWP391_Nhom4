<<<<<<< HEAD
package com.example.project.controler.loginGG;

import com.example.project.config.JwtUtil;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.model.Role;
import com.example.project.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class GoogleOAuth2SuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    @Autowired
    private AccountService accountService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String fullName = oauth2User.getAttribute("name");

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Không thể lấy email từ Google");
            return;
        }

        // Xử lý tài khoản
        Account account = accountService.processGoogleAccount(email, fullName != null ? fullName : "Unknown");
        if (account.getRole() == null) {
            Role userRole = new Role();
            userRole.setRolename("USER");
            account.setRole(userRole);
            account.setCreatedAt(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
            account.setUpdatedAt(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
            accountService.saveAccount(account);
        }
        String role = account.getRole().getRolename();
        String jwtToken = jwtUtil.generateToken(account.getUsername(), account.getId(), role);

        // Cập nhật thông tin Parent nếu có
        Parent parent = accountService.findParentByAccountId(account.getId());
        if (parent != null) {
            String phoneNumber = oauth2User.getAttribute("phoneNumber") != null ? oauth2User.getAttribute("phoneNumber").toString() : "";
            if (!phoneNumber.isEmpty()) {
                parent.setPhoneNumber(phoneNumber);
                accountService.saveParent(parent);
            }
        }

        // Redirect đến frontend với token trong query parameter
        String redirectUrl = "http://localhost:3000/home?token=" + jwtToken + "&role=" + role +
                "&username=" + account.getUsername() +
                "&fullName=" + account.getFullName() +
                "&accountId=" + account.getId();
        response.sendRedirect(redirectUrl);
    }
=======
package com.example.project.controler.loginGG;

import com.example.project.config.JwtUtil;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.model.Role;
import com.example.project.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class GoogleOAuth2SuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    @Autowired
    private AccountService accountService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String fullName = oauth2User.getAttribute("name");

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Không thể lấy email từ Google");
            return;
        }

        // Xử lý tài khoản
        Account account = accountService.processGoogleAccount(email, fullName != null ? fullName : "Unknown");
        if (account.getRole() == null) {
            Role userRole = new Role();
            userRole.setRolename("USER");
            account.setRole(userRole);
            account.setCreatedAt(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
            account.setUpdatedAt(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
            accountService.saveAccount(account);
        }
        String role = account.getRole().getRolename();
        String jwtToken = jwtUtil.generateToken(account.getUsername(), account.getId(), role);

        // Cập nhật thông tin Parent nếu có
        Parent parent = accountService.findParentByAccountId(account.getId());
        if (parent != null) {
            String phoneNumber = oauth2User.getAttribute("phoneNumber") != null ? oauth2User.getAttribute("phoneNumber").toString() : "";
            if (!phoneNumber.isEmpty()) {
                parent.setPhoneNumber(phoneNumber);
                accountService.saveParent(parent);
            }
        }

        // Redirect đến frontend với token trong query parameter
        String redirectUrl = "http://localhost:3000/home?token=" + jwtToken + "&role=" + role +
                "&username=" + account.getUsername() +
                "&fullName=" + account.getFullName() +
                "&accountId=" + account.getId();
        response.sendRedirect(redirectUrl);
    }
>>>>>>> ngocle_new
}