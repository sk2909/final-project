package com.exam_portal.exam_management_service.service;

import com.exam_portal.exam_management_service.model.Response;

import java.util.List;

public interface ResponseService {
    List<Response> getResponsesByExamAndUser(Long examId, Long userId);
    Response saveResponse(Response response);
    Response updateResponse(Response response);

}