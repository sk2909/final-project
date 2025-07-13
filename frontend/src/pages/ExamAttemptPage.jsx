// ExamAttemptPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const ExamAttemptPage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({}); // Stores user's selected option index {questionId: selectedOptionIndex}
    const [responses, setResponses] = useState({}); // {questionId: responseObj from backend}
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3600);
    const [resumeAvailable, setResumeAvailable] = useState(false);
    const [result, setResult] = useState(null); // This state variable is not used after resultObj is created in handleSubmit

    // Fetch exam, questions, and previous responses
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch exam details
            const examRes = await fetch(`http://localhost:8090/api/admin/exams/${examId}`, {
                headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            });
            if (!examRes.ok) {
                console.error("Failed to fetch exam:", examRes.status, examRes.statusText);
                setExam(null);
                setLoading(false);
                return;
            }
            const examData = await examRes.json();
            setExam(examData);
            setTimeLeft((examData.duration || 60) * 60);

            // Fetch all questions (assuming admin/questions returns all, and we filter)
            const qRes = await fetch('http://localhost:8090/api/admin/questions', {
                headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            });
            if (!qRes.ok) {
                console.error("Failed to fetch questions:", qRes.status, qRes.statusText);
                setQuestions([]);
                setLoading(false);
                return;
            }
            const allQs = await qRes.json();
            // Filter questions relevant to the current exam
            const examQuestions = allQs.filter(q => (examData.questionIds || []).includes(q.questionId || q.id));
            setQuestions(examQuestions);

            // Fetch previous responses for this user and exam
            if (user && user.id) {
                const respRes = await fetch(`http://localhost:8090/api/responses/by-exam-user?examId=${examId}&userId=${user.id}`, {
                    headers: { 'Authorization': token }
                });
                if (respRes.ok) {
                    const respData = await respRes.json();
                    const respMap = {};
                    const ansMap = {};
                    respData.forEach(r => {
                        respMap[r.questionId] = r;
                        ansMap[r.questionId] = r.answer; // Populate answers from saved responses
                    });
                    setResponses(respMap);
                    setAnswers(ansMap); // Initialize answers state with saved responses
                } else {
                    console.warn("No previous responses found or failed to fetch:", respRes.status, respRes.statusText);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [examId, user]);

    // Timer and resume logic
    useEffect(() => {
        // Load saved state (answers, currentQuestion, timeLeft) if available and user is present
        // This check ensures we only attempt to resume if a user is logged in
        if (user && user.id) {
            const saved = localStorage.getItem(`exam_${examId}_state_${user.id}`); // Use user.id for unique storage
            if (saved) {
                try {
                    const state = JSON.parse(saved);
                    setTimeLeft(state.timeLeft);
                    setAnswers(prev => ({ ...prev, ...state.answers })); // Merge or overwrite based on strategy
                    setCurrentQuestion(state.currentQuestion);
                    setResumeAvailable(true); // Indicate resume data is present
                } catch (e) {
                    console.error("Failed to parse saved exam state:", e);
                    localStorage.removeItem(`exam_${examId}_state_${user.id}`); // Clear corrupt data
                }
            }
        }

        // Timer setup
        if (!loading && exam) { // Only start timer if exam data is loaded
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto-submit when time runs out
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer); // Cleanup timer on unmount
        }
    }, [loading, exam, user]); // Depend on exam and user to ensure timer starts after data loads

    // Save state for resume on exit
    useEffect(() => {
        if (user && user.id) { // Only save if user is logged in
            localStorage.setItem(`exam_${examId}_state_${user.id}`, JSON.stringify({ // Use user.id for unique storage
                timeLeft, answers, currentQuestion
            }));
        }
    }, [timeLeft, answers, currentQuestion, examId, user]); // Add examId and user to dependencies

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionId, answerIndex) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    };

    // Save or update response for current question
    const handleSaveResponse = async () => {
        if (!user || !user.id || !questions.length) return; // Ensure user ID is available
        const q = questions[currentQuestion];
        const selected = answers[q.questionId || q.id];

        // Only save if an answer is selected for the current question
        if (selected === undefined) return;

        const token = localStorage.getItem('token');
        const questionIdToUse = q.questionId || q.id;

        // Determine correctness and marks here
        const isCorrect = selected === q.correctAnswer;
        const marksObtained = isCorrect ? q.marks : 0;

        const responsePayload = {
            responseId: responses[questionIdToUse]?.responseId, // for PUT
            examId: Number(examId),
            userId: user.id,
            questionId: questionIdToUse,
            answer: selected,
            marksObtained, // This will be saved to the backend
            submitted: false // Not yet final submission
        };

        let resp;
        try {
            if (responses[questionIdToUse]) {
                // Update existing response
                resp = await fetch('http://localhost:8090/api/responses/save-response', {
                    method: 'PUT',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(responsePayload)
                });
            } else {
                // Create new response
                resp = await fetch('http://localhost:8090/api/responses/save-response', {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(responsePayload)
                });
            }

            if (resp.ok) {
                const data = await resp.json();
                setResponses(prev => ({ ...prev, [questionIdToUse]: data }));
            } else {
                console.error(`Failed to save response for Q ${questionIdToUse}:`, resp.status, resp.statusText);
            }
        } catch (error) {
            console.error("Error saving response:", error);
        }
    };

    // Save or update all responses before submit
    const handleSaveAllResponses = async () => {
        if (!user || !user.id || !questions.length) return;
        const token = localStorage.getItem('token');
        const updatedResponses = { ...responses }; // To accumulate all updated responses

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const questionIdToUse = q.questionId || q.id;
            const selected = answers[questionIdToUse]; // User's selected answer from local state

            // Only process if an answer was selected for this question
            if (selected === undefined) continue;

            const isCorrect = selected === q.correctAnswer;
            const marksObtained = isCorrect ? q.marks : 0;

            const responsePayload = {
                responseId: responses[questionIdToUse]?.responseId,
                examId: Number(examId),
                userId: user.id,
                questionId: questionIdToUse,
                answer: selected,
                marksObtained,
                submitted: true // Mark as submitted when saving all
            };

            let resp;
            try {
                if (responses[questionIdToUse]) {
                    resp = await fetch('http://localhost:8090/api/responses/save-response', {
                        method: 'PUT',
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(responsePayload)
                    });
                } else {
                    resp = await fetch('http://localhost:8090/api/responses/save-response', {
                        method: 'POST',
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(responsePayload)
                    });
                }

                if (resp.ok) {
                    const data = await resp.json();
                    updatedResponses[questionIdToUse] = data; // Update accumulated responses
                } else {
                    console.error(`Failed to save response for Q ${questionIdToUse} during bulk save:`, resp.status, resp.statusText);
                }
            } catch (error) {
                console.error("Error saving all responses:", error);
            }
        }
        setResponses(updatedResponses); // Update the state with all saved/updated responses
    };

    const handleNext = async () => {
        await handleSaveResponse(); // Save current question's response
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        // No need to save on previous as handleAnswerSelect already updates local state
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    // Submit exam and reroute to ResultPage
    const handleSubmit = async () => {
        setSubmitting(true);
        // Ensure all answers are saved to the backend and marked as submitted
        await handleSaveAllResponses();

        if (!user || !user.id) {
            console.error("User ID is not available for submission.");
            setSubmitting(false);
            return;
        }
        const token = localStorage.getItem('token');

        // Submit exam (update result DB and potentially get final overall result)
        const submitRes = await fetch(`http://localhost:8090/api/responses/submit-exam/${examId}`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        let marksObtained = 0;
        let totalMarks = exam?.totalMarks || 0;
        let finalAnswersForDisplay = {}; // This will hold questionId: userAnswerIndex
        let correctCount = 0;
        let wrongCount = 0;
        let attemptedCount = 0;

        if (submitRes.ok) {
            // Re-fetch responses to get the most up-to-date and submitted states
            const respRes = await fetch(`http://localhost:8090/api/responses/by-exam-user?examId=${examId}&userId=${user.id}`, {
                headers: { 'Authorization': token }
            });

            if (respRes.ok) {
                const submittedRespData = await respRes.json();
                
                // Calculate scores and counts from the submitted responses
                submittedRespData.forEach(r => {
                    const correspondingQuestion = questions.find(q => (q.questionId || q.id) === r.questionId);
                    if (correspondingQuestion) {
                        marksObtained += (r.marksObtained || 0); // Sum up marks
                        finalAnswersForDisplay[r.questionId] = r.answer; // User's chosen answer
                        
                        attemptedCount++;
                        if (r.answer === correspondingQuestion.correctAnswer) {
                            correctCount++;
                        } else {
                            wrongCount++;
                        }
                    }
                });
            } else {
                console.error("Failed to fetch submitted responses:", respRes.status, respRes.statusText);
            }

            // Get result object from submitRes (backend might return an overall result JSON)
            let resultObj = null;
            try {
                resultObj = await submitRes.json();
            } catch (e) {
                console.warn("Submit exam response did not return a valid JSON result:", e);
                resultObj = null;
            }

            // Prepare exam object for ResultPage (with all questions and their correct answers)
            const examForResult = { ...exam, questions }; // Ensure `questions` array is included with correct answers

            setShowSubmitModal(false);
            setSubmitting(false);

            // Navigate to ResultPage with calculated data
            try {
                navigate('/result', {
                    state: {
                        exam: examForResult, // Contains `questions` with `correctAnswer`
                        answers: finalAnswersForDisplay, // Contains user's selected answers
                        score: marksObtained,
                        totalMarks: totalMarks,
                        correctCount: correctCount, // Pass correct count
                        wrongCount: wrongCount,     // Pass wrong count
                        attemptedCount: attemptedCount, // Pass attempted count
                        result: resultObj // Backend's overall result if available
                    }
                });
            } catch (e) {
                console.error("Navigation to result page failed:", e);
                // Fallback if navigate fails
                window.location.href = '/result';
            }
            // Clear local storage for this exam after successful submission
            localStorage.removeItem(`exam_${examId}_state_${user.id}`);
        } else {
            console.error("Failed to submit exam:", submitRes.status, submitRes.statusText);
            setSubmitting(false);
        }
    };

    // Resume exam handler (resets resumeAvailable flag, state is loaded in useEffect)
    const handleResume = () => {
        setResumeAvailable(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <p>Loading exam and questions...</p>
                </Card>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <p>Exam not found or failed to load.</p>
                    <Link to="/dashboard">
                        <Button className="mt-4">Back to Dashboard</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <p>No questions found for this exam.</p>
                    <Link to="/dashboard">
                        <Button className="mt-4">Back to Dashboard</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div>
                            <h1 className="text-lg font-semibold">{exam.title}</h1>
                            <p className="text-sm text-gray-600">
                                Question {currentQuestion + 1} of {questions.length}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                                ⏰ {formatTime(timeLeft)}
                            </div>
                            <Button variant="danger" onClick={() => setShowSubmitModal(true)} disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Exam'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Resume Modal */}
                {resumeAvailable && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="max-w-sm w-full mx-4 text-center">
                            <h3 className="text-lg font-semibold mb-4">Resume Exam?</h3>
                            <p className="text-gray-600 mb-6">
                                It looks like you have an unfinished attempt for this exam. Would you like to resume?
                            </p>
                            <Button onClick={handleResume}>Resume Exam</Button>
                        </Card>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <Card className="mb-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2">
                            Question {currentQuestion + 1}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">{currentQ?.question || currentQ?.text}</p>
                        <div className="mt-2 text-sm text-gray-500">
                            Marks: {currentQ?.marks}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {currentQ?.options.map((option, index) => (
                            <label
                                key={index}
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                    answers[currentQ.questionId || currentQ.id] === index
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQ.questionId || currentQ.id}`}
                                    value={index}
                                    checked={answers[currentQ.questionId || currentQ.id] === index}
                                    onChange={() => handleAnswerSelect(currentQ.questionId || currentQ.id, index)}
                                    className="sr-only" // Hide native radio button
                                />
                                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                    answers[currentQ.questionId || currentQ.id] === index
                                        ? 'border-primary-500 bg-primary-500'
                                        : 'border-gray-300'
                                }`}>
                                    {answers[currentQ.questionId || currentQ.id] === index && (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                </div>
                                <span className="text-gray-900">{option}</span>
                            </label>
                        ))}
                    </div>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0 || submitting}
                    >
                        ← Previous
                    </Button>

                    <div className="text-sm text-gray-600">
                        {Object.keys(answers).length} of {questions.length} answered
                    </div>

                    {currentQuestion === questions.length - 1 ? (
                        <Button onClick={() => setShowSubmitModal(true)} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Exam'}
                        </Button>
                    ) : (
                        <Button onClick={handleNext} disabled={submitting}>
                            Save & Next →
                        </Button>
                    )}
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Submit Exam?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to submit the exam? You have answered{' '}
                            <span className="font-semibold">{Object.keys(answers).length}</span> out of{' '}
                            <span className="font-semibold">{questions.length}</span> questions.
                        </p>
                        <div className="flex space-x-3 justify-end">
                            <Button variant="outline" onClick={() => setShowSubmitModal(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Exam'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ExamAttemptPage;