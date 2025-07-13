package com.exam_portal.user_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "spring.config.import=optional:configserver:http://localhost:8888"
})
class UserServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
