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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map(exam => {
                const examId = exam.examId || exam.id;
                const isAttempted = attempted[examId];
                return (
                  <tr key={examId}>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.duration} min</td>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.totalMarks}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAttempted ? (
                        <Button disabled className="bg-gray-300 text-gray-600 cursor-not-allowed">Attempted</Button>
                      ) : (
                        <Button onClick={() => navigate(`/exam/${examId}`)}>
                          Attempt
                        </Button>
                      )}
                    </td>
                  </tr>
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
