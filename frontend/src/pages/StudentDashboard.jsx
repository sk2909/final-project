
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';


const StudentDashboard = () => {
  const { user } = useAuth();
  const [availableExams, setAvailableExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        // Fetch all exams
        const examsRes = await fetch('http://localhost:8090/api/admin/exams', {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });
        const examsData = await examsRes.json();

        // Fetch all results for this user
        let userResults = [];
        if (user && user.id) {
          const resultsRes = await fetch(`http://localhost:8090/api/responses/results/by-user?userId=${user.id}`, {
            headers: { 'Authorization': token }
          });
          if (resultsRes.ok) {
            userResults = await resultsRes.json();
            setRecentResults(userResults);
          } else {
            setRecentResults([]);
          }
        }

        // Exams not attempted by user (regardless of status)
        const attemptedExamIds = new Set(userResults.map(r => r.examId));
        const available = examsData.filter(exam => !attemptedExamIds.has(exam.examId || exam.id));
        setAvailableExams(available);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);


  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }


  // Unique completed exams (by examId)
  const uniqueCompleted = Array.from(
    new Map(recentResults.map(r => [r.examId, r])).values()
  );

  // Calculate average score (percentage) from unique completed exams
  let avgScore = 0;
  if (uniqueCompleted.length > 0) {
    const totalPercent = uniqueCompleted.reduce((sum, r) => sum + ((r.marksObtained / (r.totalMarks || 1)) * 100), 0);
    avgScore = Math.round(totalPercent / uniqueCompleted.length);
  }

  // Sort recent results by endTime descending (most recent first)
  const sortedRecentResults = [...uniqueCompleted].sort((a, b) => {
    if (!a.endTime) return 1;
    if (!b.endTime) return -1;
    return new Date(b.endTime) - new Date(a.endTime);
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Ready to take an exam?</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="floating" className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">{availableExams.length}</div>
          <div className="text-sm text-gray-600">Available Exams</div>
          <div className="w-full bg-blue-100 rounded-full h-2 mt-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </Card>
        
        <Card variant="floating" className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">{uniqueCompleted.length}</div>
          <div className="text-sm text-gray-600">Completed Exams</div>
          <div className="w-full bg-green-100 rounded-full h-2 mt-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </Card>
        
        <Card variant="floating" className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            {avgScore}%
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
          <div className="w-full bg-purple-100 rounded-full h-2 mt-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </Card>
      </div>

      {/* Available Exams */}
      <Card variant="floating">
        <h2 className="text-xl font-semibold mb-6 gradient-text">Available Exams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableExams.map((exam) => (
            <div key={exam.examId || exam.id} className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{exam.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                </div>
                <span className="px-3 py-1 text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full font-medium">
                  {exam.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <span className="mr-2">⏱️</span>
                  {exam.duration} minutes
                </div>
                <div className="flex items-center">
                  <span className="mr-2">❓</span>
                  {exam.totalQuestions} questions
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🏆</span>
                  {exam.totalMarks} marks
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📚</span>
                  {exam.category}
                </div>
              </div>
              <Link to={`/exam/${exam.examId || exam.id}`}>
                <Button className="w-full">Start Exam</Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card variant="floating">
          <h2 className="text-xl font-semibold mb-6 gradient-text">Recent Results</h2>
          <div className="space-y-4">
            {sortedRecentResults.map((result, idx) => (
              <div key={result.resultId || result.id || idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div>
                  <p className="font-medium text-gray-900">{result.examTitle}</p>
                  <p className="text-sm text-gray-600">
                    {result.endTime ? new Date(result.endTime).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {result.marksObtained && result.totalMarks ? Math.round((result.marksObtained / result.totalMarks) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">{result.marksObtained}/{result.totalMarks}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/dashboard/results">
            <Button variant="outline" className="w-full mt-6">View All Results</Button>
          </Link>
        </Card>

        <Card variant="floating">
          <h2 className="text-xl font-semibold mb-6 gradient-text">Study Tips</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <p className="font-medium text-blue-900 flex items-center">
                <span className="mr-2">📚</span>
                Prepare thoroughly
              </p>
              <p className="text-sm text-blue-700 mt-1">Review all materials before starting an exam</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <p className="font-medium text-green-900 flex items-center">
                <span className="mr-2">⏰</span>
                Manage your time
              </p>
              <p className="text-sm text-green-700 mt-1">Keep track of time during the exam</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
              <p className="font-medium text-yellow-900 flex items-center">
                <span className="mr-2">🎯</span>
                Stay focused
              </p>
              <p className="text-sm text-yellow-700 mt-1">Find a quiet environment for taking exams</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;