<<<<<<< HEAD
package com.example.project.controler.loginGG;

import com.example.project.config.JwtUtil;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api/auth")
public class GoogleAuthController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/google/success")
    public String handleOAuth2Success(OAuth2AuthenticationToken token) {
        if (token == null) {
            return "redirect:/login?error";
        }
        return "redirect:/api/auth/google/callback?token=" + token.getName(); // Truyền token tạm thời
    }

    @GetMapping("/google/callback")
    @ResponseBody
    public String googleCallback(OAuth2AuthenticationToken token) {
        if (token == null) {
            throw new RuntimeException("Không thể lấy thông tin xác thực từ Google");
        }

        OAuth2User principal = token.getPrincipal();
        String email = principal.getAttribute("email");
        String fullName = principal.getAttribute("name");

        if (email == null) {
            throw new RuntimeException("Không thể lấy email từ Google");
        }

        // Xử lý tài khoản và parent thông qua AccountService
        Account account = accountService.processGoogleAccount(email, fullName != null ? fullName : "Unknown");
        String role = account.getRole().getRolename();
        String jwtToken = jwtUtil.generateToken(account.getUsername(), account.getId(), role);

        // Cập nhật thông tin Parent nếu có
        Parent parent = accountService.findParentByAccountId(account.getId());
        if (parent != null) {
            String phoneNumber = principal.getAttribute("phoneNumber") != null ? principal.getAttribute("phoneNumber").toString() : "";
            if (!phoneNumber.isEmpty()) {
                parent.setPhoneNumber(phoneNumber);
                accountService.saveParent(parent);
            }
        }

        return "{ \"token\": \"" + jwtToken + "\", \"role\": \"" + role + "\" }"; // Trả về token và role
    }
=======
package com.example.project.controler.loginGG;

import com.example.project.config.JwtUtil;
import com.example.project.model.Account;
import com.example.project.model.Parent;
import com.example.project.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api/auth")
public class GoogleAuthController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/google/success")
    public String handleOAuth2Success(OAuth2AuthenticationToken token) {
        if (token == null) {
            return "redirect:/login?error";
        }
        return "redirect:/api/auth/google/callback?token=" + token.getName(); // Truyền token tạm thời
    }

    @GetMapping("/google/callback")
    @ResponseBody
    public String googleCallback(OAuth2AuthenticationToken token) {
        if (token == null) {
            throw new RuntimeException("Không thể lấy thông tin xác thực từ Google");
        }

        OAuth2User principal = token.getPrincipal();
        String email = principal.getAttribute("email");
        String fullName = principal.getAttribute("name");

        if (email == null) {
            throw new RuntimeException("Không thể lấy email từ Google");
        }

        // Xử lý tài khoản và parent thông qua AccountService
        Account account = accountService.processGoogleAccount(email, fullName != null ? fullName : "Unknown");
        String role = account.getRole().getRolename();
        String jwtToken = jwtUtil.generateToken(account.getUsername(), account.getId(), role);

        // Cập nhật thông tin Parent nếu có
        Parent parent = accountService.findParentByAccountId(account.getId());
        if (parent != null) {
            String phoneNumber = principal.getAttribute("phoneNumber") != null ? principal.getAttribute("phoneNumber").toString() : "";
            if (!phoneNumber.isEmpty()) {
                parent.setPhoneNumber(phoneNumber);
                accountService.saveParent(parent);
            }
        }

        return "{ \"token\": \"" + jwtToken + "\", \"role\": \"" + role + "\" }"; // Trả về token và role
    }
>>>>>>> ngocle_new
}