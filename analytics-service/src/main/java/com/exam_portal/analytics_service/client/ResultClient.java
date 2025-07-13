package com.exam_portal.analytics_service.client;

import com.examportal.common.dto.ResultDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

@FeignClient(name = "exam-management-service")
public interface ResultClient {
    @GetMapping("/api/results")
    List<ResultDTO> getResults(@RequestParam(required = false) Long examId,
                               @RequestParam(required = false) Long userId);
}
