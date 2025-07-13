import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ExamQuestionsPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
    setLoading(true);
    fetch(`http://localhost:8090/api/user/exams/${examId}`, {
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load exam');
        return res.json();
      })
      .then(examData => {
        setExam(examData);
        // Fetch all questions, then filter by exam.questionIds
        fetch('http://localhost:8090/api/user/questions', {
          headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to load questions');
            return res.json();
          })
          .then(allQuestions => {
            const examQuestions = (examData.questionIds || []).map(qid => allQuestions.find(q => q.questionId === qid)).filter(Boolean);
            setQuestions(examQuestions);
            setLoading(false);
          })
          .catch(() => {
            setError('Failed to load questions');
            setLoading(false);
          });
      })
      .catch(() => {
        setError('Failed to load exam/questions');
        setLoading(false);
      });
  }, [examId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/my-exams')}>Back</Button>
        <h1 className="text-2xl font-bold text-indigo-700">Questions for Exam: {exam?.title}</h1>
      </div>
      <Card className="rounded-2xl shadow-2xl p-8 bg-white border border-gray-200">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Questions List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map(q => (
                <tr key={q.questionId}>
                  <td className="px-6 py-4 font-medium text-gray-900">{q.text}</td>
                  <td className="px-6 py-4">
                    {Array.isArray(q.options) ? (
                      <ul className="list-disc pl-4 text-sm text-gray-700">
                        {q.options.map((opt, idx) => <li key={idx}>{opt}</li>)}
                      </ul>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{q.correctAnswer || '-'}</td>
                  <td className="px-6 py-4">{q.marks || 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">No questions found for this exam.</div>
        )}
      </Card>
    </div>
  );
};

export default ExamQuestionsPage;
