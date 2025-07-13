import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header */}
      <header className="navbar-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text">ExamPortal</h1>
            </div>
            <div className="space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Modern Online Exam
            <span className="gradient-text"> Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create, manage, and take exams with ease. Our comprehensive platform 
            provides everything you need for online assessments.
          </p>
          <div className="space-x-4">
            <Link to="/register">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16">
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Online Learning"
              className="w-full max-w-4xl mx-auto rounded-3xl shadow-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-3xl"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ExamPortal?
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features designed for modern online education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="floating" className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">Easy Exam Creation</h3>
              <p className="text-gray-600">
                Create comprehensive exams with our intuitive question builder 
                and flexible settings.
              </p>
            </Card>

            <Card variant="floating" className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">Real-time Analytics</h3>
              <p className="text-gray-600">
                Track performance with detailed analytics and insights 
                for better learning outcomes.
              </p>
            </Card>

            <Card variant="floating" className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">Secure & Reliable</h3>
              <p className="text-gray-600">
                Enterprise-grade security ensures your exams and data 
                are always protected.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-gray-300 mb-6">
            Join thousands of educators and students using ExamPortal
          </p>
          <Link to="/register">
            <Button size="lg">Create Account</Button>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;