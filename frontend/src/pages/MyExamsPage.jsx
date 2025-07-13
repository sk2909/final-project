// ...existing code...
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const MyExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState({}); // {examId: resultObj}
  const [attempted, setAttempted] = useState({}); // {examId: true/false}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedExam, setExpandedExam] = useState(null); // examId of expanded row
  const [questionsByExam, setQuestionsByExam] = useState({}); // {examId: [questions]}
  const [questionsLoading, setQuestionsLoading] = useState({}); // {examId: true/false}
  // Helper to fetch questions for an exam
  const fetchQuestionsForExam = async (examId, questionIds = []) => {
    if (!examId || questionsByExam[examId] || questionsLoading[examId]) return;
    setQuestionsLoading(prev => ({ ...prev, [examId]: true }));
    try {
      // If questionIds are available, fetch each question by id
      const token = localStorage.getItem('token');
      let questions = [];
      if (questionIds && questionIds.length > 0) {
        // Fetch all questions in parallel
        questions = await Promise.all(
          questionIds.map(async (qid) => {
            const res = await fetch(`http://localhost:8090/api/admin/questions/${qid}`, {
              headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            });
            if (res.ok) return res.json();
            return null;
          })
        );
        questions = questions.filter(Boolean);
      } else {
        // fallback: fetch all questions for this exam (if endpoint exists)
        const res = await fetch(`http://localhost:8090/api/admin/exams/${examId}/questions`, {
          headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          questions = await res.json();
        }
      }
      setQuestionsByExam(prev => ({ ...prev, [examId]: questions }));
    } catch (e) {
      setQuestionsByExam(prev => ({ ...prev, [examId]: [] }));
    } finally {
      setQuestionsLoading(prev => ({ ...prev, [examId]: false }));
    }
  };
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamsAndAttempts = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const examsRes = await fetch('http://localhost:8090/api/admin/exams', {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });
        const examsData = await examsRes.json();
        setExams(examsData);
        if (user && user.id) {
          // Fetch result for each exam for this user using the correct endpoint
          const resultsObj = {};
          const attemptedObj = {};
          await Promise.all(examsData.map(async (exam) => {
            const resultRes = await fetch(`http://localhost:8090/api/responses/result/by-exam-user?examId=${exam.examId || exam.id}&userId=${user.id}`, {
              headers: { 'Authorization': token }
            });
            if (resultRes.ok) {
              const resultData = await resultRes.json();
              if (resultData && resultData.resultId) {
                attemptedObj[exam.examId || exam.id] = true;
                resultsObj[exam.examId || exam.id] = resultData;
              } else {
                attemptedObj[exam.examId || exam.id] = false;
              }
            } else {
              attemptedObj[exam.examId || exam.id] = false;
            }
          }));
          setAttempted(attemptedObj);
          setResults(resultsObj);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load exams');
        setLoading(false);
      }
    };
    fetchExamsAndAttempts();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  // Role helpers
  const isAdmin = user?.role === 'ADMIN';
  const isExaminer = user?.role === 'EXAMINER';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold gradient-text">My Exams</h1>
      <Card variant="floating">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isAdmin ? 'Actions' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map(exam => {
                const examId = exam.examId || exam.id;
                const isAttempted = attempted[examId];
                const isExpanded = expandedExam === examId;
                // For smooth expand/collapse, use a row below
                return (
                  <React.Fragment key={examId}>
                    <tr
                      className="cursor-pointer hover:bg-blue-50 transition"
                      onClick={() => {
                        if (isAdmin || isExaminer) {
                          setExpandedExam(isExpanded ? null : examId);
                          if (!questionsByExam[examId] && !questionsLoading[examId]) {
                            fetchQuestionsForExam(examId, exam.questionIds);
                          }
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{exam.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{exam.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{exam.duration} min</td>
                      <td className="px-6 py-4 whitespace-nowrap">{exam.totalMarks}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isAdmin ? (
                          <div className="flex gap-2">
                            <button
                              onClick={e => {e.stopPropagation(); navigate(`/admin/exams/${examId}/edit`);}}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full text-xl flex items-center justify-center"
                              title="Edit Exam"
                              style={{ fontSize: '1.35rem' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213l-4 1 1-4 13.362-13.726z" />
                              </svg>
                            </button>
                            <button
                              onClick={e => {e.stopPropagation(); navigate(`/admin/exams/${examId}/add-questions`);}}
                              className="bg-green-500 hover:bg-green-600 text-white transition-colors p-2 rounded-full text-xl flex items-center justify-center shadow"
                              title="Add Questions"
                              style={{ fontSize: '1.35rem' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                                <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.2" />
                                <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </button>
                            <button
                              onClick={async e => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this exam?')) {
                                  const token = localStorage.getItem('token');
                                  try {
                                    const response = await fetch(`http://localhost:8090/api/admin/exams/${examId}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Authorization': token,
                                        'Content-Type': 'application/json'
                                      }
                                    });
                                    if (!response.ok) {
                                      const errorText = await response.text();
                                      alert('Failed to delete exam: ' + errorText);
                                      return;
                                    }
                                    setExams(prev => prev.filter(ex => (ex.examId || ex.id) !== examId));
                                  } catch (err) {
                                    alert('An error occurred while deleting the exam.');
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full text-xl flex items-center justify-center"
                              title="Delete Exam"
                              style={{ fontSize: '1.35rem' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" />
                              </svg>
                            </button>
                          </div>
                        ) : isExaminer ? (
                          <span className="text-gray-400 italic">-</span>
                        ) : (
                          isAttempted ? (
                            <Button disabled className="bg-gray-300 text-gray-600 cursor-not-allowed">Attempted</Button>
                          ) : (
                            <Button onClick={() => navigate(`/exam/${examId}`)}>
                              Attempt
                            </Button>
                          )
                        )}
                      </td>
                    </tr>
                    {(isAdmin || isExaminer) && isExpanded && (
                      <tr>
                        <td colSpan={5} className="bg-blue-50 px-8 py-4 animate-fade-in border-t border-blue-100">
                          {questionsLoading[examId] ? (
                            <div className="text-blue-500">Loading questions...</div>
                          ) : (
                            <>
                              <div className="font-semibold mb-2">Questions in this exam:</div>
                              {questionsByExam[examId] && questionsByExam[examId].length > 0 ? (
                                <ul className="space-y-2">
                                  {questionsByExam[examId].map((q, idx) => (
                                    <li key={q.questionId || q.id} className="p-3 rounded bg-white border border-gray-200 shadow-sm">
                                      <div className="font-medium">Q{idx + 1}: {q.text || q.question}</div>
                                      {q.options && Array.isArray(q.options) && (
                                        <ul className="ml-4 list-disc text-sm text-gray-700">
                                          {q.options.map((opt, i) => (
                                            <li key={i}>{opt}</li>
                                          ))}
                                        </ul>
                                      )}
                                      {q.correctAnswer && (
                                        <div className="text-green-600 text-xs mt-1">Correct: {q.correctAnswer}</div>
                                      )}
                                      {q.explanation && (
                                        <div className="text-gray-500 text-xs mt-1">{q.explanation}</div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-gray-500">No questions found for this exam.</div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {exams.length === 0 && (
          <div className="text-center py-8 text-gray-500">No exams found.</div>
        )}
      </Card>
    </div>
  );
};

export default MyExamsPage;
