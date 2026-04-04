package com.visnex.authservice;

import com.visnex.authservice.entity.Role;
import com.visnex.authservice.entity.User;
import com.visnex.authservice.repository.RoleRepository;
import com.visnex.authservice.service.UserService;
import com.visnex.authservice.service.implementation.LoadData;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import java.util.List;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.visnex.authservice.repository")
@EntityScan(basePackages = "com.visnex.authservice.entity")
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner start(UserService userService, RoleRepository roleRepository, LoadData loadData) {
        return args -> {
            List<Role> roleList = roleRepository.findAll();
            List<User> userList = userService.getAllUsers();
            if (roleList.isEmpty() && userList.isEmpty()) {
                Role adminRole = new Role(1L, "ADMIN");
                Role userRole = new Role(2L, "USER");
                List<Role> rolesSaved = roleRepository.saveAll(
                        List.of(adminRole, userRole)
                );
                User user = User.builder().enabled(true).username("admin").password("rh2023-boc").email("admin@rhiscom.com").roles(rolesSaved).id(1L).build();
                userService.save(user);
            }
            loadData.seedData();
        };
    }
}
