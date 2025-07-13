import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AnalyticsPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userResults, setUserResults] = useState([]); // Raw results from backend
    const [examsData, setExamsData] = useState({}); // Map of examId to exam details (title, totalMarks)

    // Function to determine grade based on percentage
    const getGrade = (percentage) => {
        if (percentage >= 90) return 'O'; // Outstanding
        if (percentage >= 80) return 'A'; // Excellent
        if (percentage >= 70) return 'B'; // Good
        if (percentage >= 60) return 'C'; // Average (Pass)
        return 'F'; // Fail
    };

    // Fetch user results and corresponding exam details
    useEffect(() => {
        const fetchAnalyticsData = async () => {
            if (!user || !user.id) {
                setError("User not authenticated or user ID not available.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            try {
                // 1. Fetch all results for the current user
                const resultsRes = await fetch(`http://localhost:8090/api/responses/results/by-user?userId=${user.id}`, {
                    headers: { 'Authorization': token }
                });

                if (!resultsRes.ok) {
                    throw new Error(`Failed to fetch user results: ${resultsRes.statusText}`);
                }
                const resultsData = await resultsRes.json();
                setUserResults(resultsData);

                // 2. Extract unique exam IDs from the results
                const uniqueExamIds = [...new Set(resultsData.map(result => result.examId))];

                // 3. Fetch details for each unique exam
                const examDetailsPromises = uniqueExamIds.map(async (examId) => {
                    const examRes = await fetch(`http://localhost:8090/api/responses/exams/${examId}`, {
                        headers: { 'Authorization': token }
                    });
                    if (examRes.ok) {
                        return examRes.json();
                    } else {
                        console.warn(`Failed to fetch details for exam ID ${examId}: ${examRes.statusText}`);
                        return null; // Return null for failed fetches
                    }
                });

                const fetchedExams = await Promise.all(examDetailsPromises);
                const newExamsData = {};
                fetchedExams.forEach(exam => {
                    if (exam) {
                        newExamsData[exam.examId || exam.id] = exam; // Use examId or id for consistency
                    }
                });
                setExamsData(newExamsData);

            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError(err.message || "Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [user]); // Re-run when user changes

    // Memoize calculated analytics data to prevent unnecessary re-renders
    const { analytics, examPerformance, scoreDistributionData } = useMemo(() => {
        let totalAttempts = userResults.length;
        let totalScoreSum = 0;
        const uniqueExamsAttempted = new Set();

        // Group results by exam for exam performance table
        const examsGroupedById = userResults.reduce((acc, result) => {
            const examId = result.examId;
            if (!acc[examId]) {
                acc[examId] = [];
            }
            acc[examId].push(result);
            uniqueExamsAttempted.add(examId);
            return acc;
        }, {});

        // Calculate overall average score and individual exam performance
        const calculatedExamPerformance = Object.keys(examsGroupedById).map(examId => {
            const resultsForThisExam = examsGroupedById[examId];
            const examDetail = examsData[examId];

            if (!examDetail) {
                // If exam details are not loaded yet, skip or return placeholder
                return {
                    name: `Exam ${examId} (Loading...)`,
                    attempts: resultsForThisExam.length,
                    averageScore: 0,
                    passRate: 0,
                    grade: 'N/A'
                };
            }

            const totalMarksForExam = examDetail.totalMarks;
            let examScoreSum = 0;
            let passedAttempts = 0;

            resultsForThisExam.forEach(result => {
                const percentage = totalMarksForExam > 0 ? (result.marksObtained / totalMarksForExam) * 100 : 0;
                examScoreSum += percentage;
                if (percentage >= 60) { // Assuming 60% is passing
                    passedAttempts++;
                }
            });

            const averageScore = resultsForThisExam.length > 0 ? Math.round(examScoreSum / resultsForThisExam.length) : 0;
            const passRate = resultsForThisExam.length > 0 ? Math.round((passedAttempts / resultsForThisExam.length) * 100) : 0;

            totalScoreSum += examScoreSum; // Accumulate for overall average

            return {
                name: examDetail.title,
                attempts: resultsForThisExam.length,
                averageScore: averageScore,
                passRate: passRate,
                grade: getGrade(averageScore) // Grade based on average score for the exam
            };
        });

        // Calculate overall analytics
        const overallAverageScore = totalAttempts > 0 ? Math.round(totalScoreSum / totalAttempts) : 0;

        const calculatedAnalytics = {
            totalExams: uniqueExamsAttempted.size,
            totalAttempts: totalAttempts,
            // averageScore: overallAverageScore, // Removed as per request
        };

        // Prepare data for Score Distribution Chart
        const scoreBins = {
            '90-100%': 0,
            '80-89%': 0,
            '70-79%': 0,
            '60-69%': 0,
            'Below 60%': 0
        };

        userResults.forEach(result => {
            const examDetail = examsData[result.examId];
            if (examDetail && examDetail.totalMarks > 0) {
                const percentage = (result.marksObtained / examDetail.totalMarks) * 100;
                if (percentage >= 90) scoreBins['90-100%']++;
                else if (percentage >= 80) scoreBins['80-89%']++;
                else if (percentage >= 70) scoreBins['70-79%']++;
                else if (percentage >= 60) scoreBins['60-69%']++;
                else scoreBins['Below 60%']++;
            }
        });

        const calculatedScoreDistributionData = Object.keys(scoreBins).map(range => ({
            range: range,
            count: scoreBins[range]
        }));

        return {
            analytics: calculatedAnalytics,
            examPerformance: calculatedExamPerformance,
            scoreDistributionData: calculatedScoreDistributionData
        };
    }, [userResults, examsData]); // Re-calculate when userResults or examsData change


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <p>Loading analytics data...</p>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="text-red-600">
                    <p>Error: {error}</p>
                    <p className="text-gray-600 mt-2">Please try again later or contact support.</p>
                </Card>
            </div>
        );
    }

    if (userResults.length === 0 && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <p>No exam results found for this user.</p>
                    <p className="text-gray-600 mt-2">Attempt some exams to see your analytics here!</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Your Analytics & Reports</h1>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"> {/* Adjusted to 2 columns */}
                <Card className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">{analytics.totalExams}</div>
                    <div className="text-sm text-gray-600">Unique Exams Attempted</div>
                    <div className="text-xs text-green-600 mt-1">↑ 12% from last month (Mock)</div>
                </Card>

                <Card className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.totalAttempts}</div>
                    <div className="text-sm text-gray-600">Total Attempts</div>
                    <div className="text-xs text-green-600 mt-1">↑ 15% from last month (Mock)</div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6"> {/* Changed to 1 column */}
                {/* Score Distribution Chart (Real Data) */}
                <Card>
                    <h2 className="text-lg font-semibold mb-4">Score Distribution (All Attempts)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={scoreDistributionData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Number of Attempts" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Exam Performance Table */}
            <Card>
                <h2 className="text-lg font-semibold mb-4">Exam Performance Breakdown</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Exam Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Attempts
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Average Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pass Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {examPerformance.length > 0 ? (
                                examPerformance.map((exam, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {exam.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {exam.attempts}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {exam.averageScore}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {exam.passRate}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                            {exam.grade}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                exam.passRate >= 80 ? 'bg-green-100 text-green-800' :
                                                exam.passRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {exam.passRate >= 80 ? 'Excellent' : exam.passRate >= 60 ? 'Good' : 'Needs Improvement'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No exam performance data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
