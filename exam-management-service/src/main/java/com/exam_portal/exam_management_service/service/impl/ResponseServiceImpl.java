package com.exam_portal.exam_management_service.service.impl;

import com.exam_portal.exam_management_service.model.Response;
import com.exam_portal.exam_management_service.repository.ResponseRepository;
import com.exam_portal.exam_management_service.service.ResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.exam_portal.exam_management_service.client.QuestionClient;
import com.examportal.common.dto.QuestionDTO;


import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResponseServiceImpl implements ResponseService {

    private final ResponseRepository responseRepository;
    private final QuestionClient questionClient;

    @Override
    public List<Response> getResponsesByExamAndUser(Long examId, Long userId) {
        return responseRepository.findByExamIdAndUserId(examId, userId);
    }

    @Override
    public Response saveResponse(Response response) {
        // If answer is an index, convert it to the actual string value using the question's options
        if (response.getAnswer() != null) {
            try {
                // Try to parse the answer as an integer index
                int answerIndex = Integer.parseInt(response.getAnswer());
                // Fetch the question to get options
                // (Assume you have access to a QuestionClient or repository here)
                // You may need to inject QuestionClient as a dependency
                // For now, let's assume you have a questionClient field
                if (questionClient != null && response.getQuestionId() != null) {
                    QuestionDTO question = questionClient.getQuestionById(response.getQuestionId());
                    if (question != null && question.getOptions() != null && answerIndex >= 0 && answerIndex < question.getOptions().size()) {
                        response.setAnswer(question.getOptions().get(answerIndex));
                    }
                }
            } catch (NumberFormatException e) {
                // If not an index, keep as is (already a string)
            }
        }
        return responseRepository.save(response);
    }

    @Override
    public Response updateResponse(Response response) {
        Optional<Response> existingResponseOpt = responseRepository.findById(response.getResponseId());
        if (existingResponseOpt.isPresent()) {
            Response existingResponse = existingResponseOpt.get();
            String answerToStore = response.getAnswer();
            if (answerToStore != null) {
                try {
                    int answerIndex = Integer.parseInt(answerToStore);
                    if (questionClient != null && response.getQuestionId() != null) {
                        QuestionDTO question = questionClient.getQuestionById(response.getQuestionId());
                        if (question != null && question.getOptions() != null && answerIndex >= 0 && answerIndex < question.getOptions().size()) {
                            answerToStore = question.getOptions().get(answerIndex);
                        }
                    }
                } catch (NumberFormatException e) {
                    // If not an index, keep as is
                }
            }
            existingResponse.setAnswer(answerToStore);
            existingResponse.setMarksObtained(response.getMarksObtained());
            existingResponse.setSubmitted(response.isSubmitted());
            // update other fields as needed
            return responseRepository.save(existingResponse);
        } else {
            throw new IllegalStateException("Response not found with id: " + response.getResponseId());
        }
    }

}