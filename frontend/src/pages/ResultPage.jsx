// ResultPage.jsx


import { useLocation, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';



const ResultPage = () => {
    const location = useLocation();
    const { exam, answers, score, totalMarks, correctCount, wrongCount, attemptedCount } = location.state || {};
    const { user } = useAuth();
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Accept both ADMIN and EXAMINER for completeness
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'EXAMINER');

    useEffect(() => {
        if (isAdmin) {
            setLoading(true);
            const token = localStorage.getItem('token');
            fetch('http://localhost:8090/api/responses/results/all', {
                headers: {
                    'Authorization': token && !token.startsWith('Bearer ') ? `Bearer ${token}` : token || '',
                    'Content-Type': 'application/json',
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch all results');
                    return res.json();
                })
                .then(data => setAllResults(data))
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [isAdmin]);

    // Always show all results table for admin/examiner, regardless of location.state
    if (isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">All User Results</h1>
                    </div>
                    {/* Debug output for development - remove in production */}
                    <pre style={{ background: '#f3f4f6', color: '#333', padding: '8px', borderRadius: '4px', marginBottom: '16px', maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(allResults, null, 2)}</pre>
                    {loading ? (
                        <div className="text-center">Loading all results...</div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : (
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                        <tr>
                                            <th className="px-4 py-2">Result ID</th>
                                            <th className="px-4 py-2">User ID</th>
                                            <th className="px-4 py-2">Exam ID</th>
                                            <th className="px-4 py-2">Marks Obtained</th>
                                            <th className="px-4 py-2">Total Marks</th>
                                            <th className="px-4 py-2">Feedback</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allResults.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4 text-gray-500">No results found.</td>
                                            </tr>
                                        ) : (
                                            allResults.map(result => (
                                                <tr key={result.resultId}>
                                                    <td className="px-4 py-2">{result.resultId}</td>
                                                    <td className="px-4 py-2">{result.userId}</td>
                                                    <td className="px-4 py-2">{result.examId}</td>
                                                    <td className="px-4 py-2">{result.marksObtained}</td>
                                                    <td className="px-4 py-2">{result.totalMarks}</td>
                                                    <td className="px-4 py-2">{result.feedback || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                    <div className="mt-8 flex justify-center space-x-4">
                        <Link to="/admin">
                            <Button variant="outline">Back to Admin Dashboard</Button>
                        </Link>
                        <Button onClick={() => window.print()}>
                            Print Results
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Student/normal user result view (original)
    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <p>No exam results found. Please complete an exam first.</p>
                    <Link to="/dashboard">
                        <Button className="mt-4">Back to Dashboard</Button>
                    </Link>
                </Card>
            </div>
        );
    }


    const questions = exam?.questions || [];
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };
    const getScoreBg = (percentage) => {
        if (percentage >= 80) return 'bg-green-50 border-green-200';
        if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Results</h1>
                    <p className="text-gray-600">{exam?.title}</p>
                </div>

                {/* Score Card */}
                <Card className={`text-center mb-8 ${getScoreBg(percentage)}`}>
                    <div className="mb-4">
                        <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-2`}>
                            {percentage}%
                        </div>
                        <p className="text-lg text-gray-700">
                            You scored {score} out of {totalMarks} marks
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                            <div className="text-2xl font-semibold text-gray-900">
                                {attemptedCount !== undefined ? attemptedCount : (answers ? Object.keys(answers).length : 0)}
                            </div>
                            <div className="text-sm text-gray-600">Questions Attempted</div>
                        </div>
                        <div>
                            <div className="text-2xl font-semibold text-green-600">
                                {correctCount !== undefined ? correctCount : 0}
                            </div>
                            <div className="text-sm text-gray-600">Correct Answers</div>
                        </div>
                        <div>
                            <div className="text-2xl font-semibold text-red-600">
                                {wrongCount !== undefined ? wrongCount : 0}
                            </div>
                            <div className="text-sm text-gray-600">Wrong Answers</div>
                        </div>
                    </div>
                </Card>

                {/* Performance Message */}
                <Card className="mb-8 text-center">
                    {percentage >= 80 ? (
                        <div>
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="text-lg font-semibold text-green-600 mb-2">Excellent Performance!</h3>
                            <p className="text-gray-600">You have demonstrated excellent understanding of the subject.</p>
                        </div>
                    ) : percentage >= 60 ? (
                        <div>
                            <div className="text-4xl mb-2">👍</div>
                            <h3 className="text-lg font-semibold text-yellow-600 mb-2">Good Job!</h3>
                            <p className="text-gray-600">You passed the exam. Keep practicing to improve further.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="text-4xl mb-2">📚</div>
                            <h3 className="text-lg font-semibold text-red-600 mb-2">Keep Learning!</h3>
                            <p className="text-gray-600">Don't give up! Review the topics and try again.</p>
                        </div>
                    )}
                </Card>
                {/* Actions */}
                <div className="mt-8 flex justify-center space-x-4">
                    <Link to="/dashboard">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                    <Button onClick={() => window.print()}>
                        Print Results
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;