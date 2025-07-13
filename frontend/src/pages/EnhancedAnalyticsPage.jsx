import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { mockExams, mockResults, mockUsers } from '../utils/mockData';

const EnhancedAnalyticsPage = () => {
  // Enhanced analytics data
  const analytics = {
    totalExams: mockExams.length,
    totalUsers: mockUsers.length,
    totalAttempts: mockResults.length * 15, // Simulated more attempts
    averageScore: mockResults.length > 0 ? 
      Math.round(mockResults.reduce((sum, result) => sum + result.percentage, 0) / mockResults.length) : 0,
    passRate: 78,
    completionRate: 92
  };

  // Pie chart data simulation
  const scoreDistribution = [
    { range: '90-100%', count: 25, color: 'from-green-400 to-green-600' },
    { range: '80-89%', count: 35, color: 'from-blue-400 to-blue-600' },
    { range: '70-79%', count: 25, color: 'from-yellow-400 to-yellow-600' },
    { range: '60-69%', count: 10, color: 'from-orange-400 to-orange-600' },
    { range: 'Below 60%', count: 5, color: 'from-red-400 to-red-600' }
  ];

  const categoryPerformance = [
    { category: 'Programming', avgScore: 85, attempts: 120, color: 'from-blue-400 to-blue-600' },
    { category: 'Framework', avgScore: 78, attempts: 95, color: 'from-purple-400 to-purple-600' },
    { category: 'Styling', avgScore: 82, attempts: 80, color: 'from-pink-400 to-pink-600' },
    { category: 'Database', avgScore: 75, attempts: 65, color: 'from-green-400 to-green-600' }
  ];

  const monthlyTrends = [
    { month: 'Jan', exams: 12, users: 45, avgScore: 75 },
    { month: 'Feb', exams: 19, users: 52, avgScore: 78 },
    { month: 'Mar', exams: 15, users: 48, avgScore: 82 },
    { month: 'Apr', exams: 22, users: 61, avgScore: 79 },
    { month: 'May', exams: 18, users: 55, avgScore: 85 },
    { month: 'Jun', exams: 25, users: 68, avgScore: 83 }
  ];

  const topPerformers = [
    { name: 'Alice Johnson', avgScore: 95, examsCompleted: 8 },
    { name: 'Bob Smith', avgScore: 92, examsCompleted: 6 },
    { name: 'Carol Davis', avgScore: 90, examsCompleted: 7 },
    { name: 'David Wilson', avgScore: 88, examsCompleted: 5 },
    { name: 'Eva Brown', avgScore: 87, examsCompleted: 9 }
  ];

  // Simple pie chart component
  const PieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;

    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4 gradient-text">{title}</h3>
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100;
              const angle = (percentage / 100) * 360;
              const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  className={`fill-current bg-gradient-to-r ${item.color}`}
                  style={{
                    background: `linear-gradient(45deg, var(--tw-gradient-stops))`,
                    fill: index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : index === 2 ? '#f59e0b' : index === 3 ? '#f97316' : '#ef4444'
                  }}
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : index === 2 ? '#f59e0b' : index === 3 ? '#f97316' : '#ef4444'
                  }}
                />
                <span className="text-gray-600">{item.range}</span>
              </div>
              <span className="font-medium">{item.count}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics & Performance</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
        </div>
        <div className="space-x-3">
          <Button variant="outline">Export Report</Button>
          <Button>Generate PDF</Button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card variant="floating" className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">{analytics.totalExams}</div>
          <div className="text-sm text-gray-600">Total Exams</div>
          <div className="text-xs text-green-600 mt-1 flex items-center justify-center">
            <span className="mr-1">↗</span> 12% from last month
          </div>
        </Card>
        
        <Card variant="floating" className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">{analytics.totalUsers}</div>
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-xs text-green-600 mt-1 flex items-center justify-center">
            <span className="mr-1">↗</span> 8% from last month
          </div>
        </Card>
        
        <Card variant="floating" className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">{analytics.totalAttempts}</div>
          <div className="text-sm text-gray-600">Total Attempts</div>
          <div className="text-xs text-green-600 mt-1 flex items-center justify-center">
            <span className="mr-1">↗</span> 15% from last month
          </div>
        </Card>
        
        <Card variant="floating" className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">{analytics.averageScore}%</div>
          <div className="text-sm text-gray-600">Average Score</div>
          <div className="text-xs text-red-600 mt-1 flex items-center justify-center">
            <span className="mr-1">↘</span> 2% from last month
          </div>
        </Card>

        <Card variant="floating" className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">{analytics.passRate}%</div>
          <div className="text-sm text-gray-600">Pass Rate</div>
          <div className="text-xs text-green-600 mt-1 flex items-center justify-center">
            <span className="mr-1">↗</span> 5% from last month
          </div>
        </Card>

        <Card variant="floating" className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-2">{analytics.completionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
          <div className="text-xs text-green-600 mt-1 flex items-center justify-center">
            <span className="mr-1">↗</span> 3% from last month
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution Pie Chart */}
        <Card variant="floating">
          <PieChart data={scoreDistribution} title="Score Distribution" />
        </Card>

        {/* Monthly Trends */}
        <Card variant="floating">
          <h2 className="text-xl font-semibold mb-6 gradient-text">Monthly Performance Trends</h2>
          <div className="space-y-4">
            {monthlyTrends.map((stat, index) => (
              <div key={stat.month} className="flex items-center">
                <div className="w-12 text-sm text-gray-600 font-medium">{stat.month}</div>
                <div className="flex-1 ml-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Exams: {stat.exams}</span>
                    <span>Users: {stat.users}</span>
                    <span className="font-semibold text-blue-600">{stat.avgScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stat.avgScore / 100) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Category Performance */}
      <Card variant="floating">
        <h2 className="text-xl font-semibold mb-6 gradient-text">Performance by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryPerformance.map((category, index) => (
            <div key={category.category} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : index === 2 ? '#ec4899' : '#10b981'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(category.avgScore / 100) * 251.2} 251.2`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{category.avgScore}%</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{category.category}</h3>
              <p className="text-sm text-gray-600">{category.attempts} attempts</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Performers and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card variant="floating">
          <h2 className="text-xl font-semibold mb-6 gradient-text">Top Performers</h2>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                    'bg-gradient-to-r from-blue-400 to-blue-500'
                  }`}>
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-600">{performer.examsCompleted} exams completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {performer.avgScore}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="floating">
          <h2 className="text-xl font-semibold mb-6 gradient-text">Exam Performance Breakdown</h2>
          <div className="space-y-4">
            {mockExams.map((exam, index) => {
              const attempts = Math.floor(Math.random() * 50) + 10;
              const avgScore = Math.floor(Math.random() * 40) + 60;
              const passRate = Math.floor(Math.random() * 30) + 70;
              
              return (
                <div key={exam.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                      <p className="text-sm text-gray-600">{attempts} attempts</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      passRate >= 80 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                      passRate >= 60 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' :
                      'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                    }`}>
                      {passRate}% pass rate
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Average Score</span>
                    <span className="font-semibold text-blue-600">{avgScore}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${avgScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Export Section */}
      <Card variant="floating">
        <h2 className="text-xl font-semibold mb-6 gradient-text">Export Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="p-6 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 group">
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
              <p className="font-medium text-gray-900">Performance Report</p>
              <p className="text-sm text-gray-600 mt-1">Detailed performance analytics</p>
            </div>
          </button>
          
          <button className="p-6 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 transition-all duration-300 group">
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">👥</div>
              <p className="font-medium text-gray-900">User Analytics</p>
              <p className="text-sm text-gray-600 mt-1">User engagement and activity</p>
            </div>
          </button>
          
          <button className="p-6 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 transition-all duration-300 group">
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📈</div>
              <p className="font-medium text-gray-900">Trends Analysis</p>
              <p className="text-sm text-gray-600 mt-1">Historical trends and forecasts</p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedAnalyticsPage;