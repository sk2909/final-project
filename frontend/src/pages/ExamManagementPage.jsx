import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

const ExamManagementPage = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [filters, setFilters] = useState({
    search: ''
  });

  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    duration: 60,
    totalMarks: 100,
    questionIds: [],
  });

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: '',
    difficulty: 'Beginner',
    marks: 5,
    explanation: ''
  });
  const [savingQuestion, setSavingQuestion] = useState(false);

  const navigate = useNavigate();

  // Fetch exams from backend on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8090/api/admin/exams', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        // Filter/map the data to only the fields you need
        const filtered = data.map(exam => ({
          examId: exam.examId,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          questionIds: exam.questionIds || []
        }));
        setExams(filtered);
        setFilteredExams(filtered);
      });
  }, []);

  // Fetch questions from backend (if needed)
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8090/api/admin/questions', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, []);

  // Filter exams by search
  useEffect(() => {
    let filtered = exams;
    if (filters.search) {
      filtered = exams.filter(exam =>
        (exam.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (exam.description || '').toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    setFilteredExams(filtered);
  }, [filters, exams]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      questionIds: exam.questionIds || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (examId) => {
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
        const newExams = exams.filter(exam => exam.examId !== examId);
        setExams(newExams);
        setFilteredExams(newExams);
      } catch (err) {
        alert('An error occurred while deleting the exam.');
      }
    }
  };

  const handleSave = async () => {
    // Validation: all fields must be filled
    if (
      !examForm.title.trim() ||
      !examForm.description.trim() ||
      !examForm.duration ||
      isNaN(examForm.duration) ||
      !examForm.totalMarks ||
      isNaN(examForm.totalMarks)
    ) {
      alert('Please fill all fields for the exam.');
      return;
    }
    const payload = {
      title: examForm.title,
      description: examForm.description,
      duration: examForm.duration,
      totalMarks: examForm.totalMarks,
      questionIds: examForm.questionIds,
    };

    const token = localStorage.getItem('token');
    let response, newExam;

    if (editingExam) {
      // Update existing exam
      response = await fetch(`http://localhost:8090/api/admin/exams/${editingExam.examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        alert('Failed to update exam: ' + errorText);
        return;
      }
      newExam = await response.json();
      const updatedExams = exams.map(exam =>
        exam.examId === editingExam.examId ? newExam : exam
      );
      setExams(updatedExams);
      setFilteredExams(updatedExams);
    } else {
      // Create new exam
      response = await fetch('http://localhost:8090/api/admin/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        alert('Failed to create exam: ' + errorText);
        return;
      }
      newExam = await response.json();
      setExams([...exams, newExam]);
      setFilteredExams([...exams, newExam]);
    }

    setIsModalOpen(false);
    setExamForm({
      title: '',
      description: '',
      duration: 60,
      totalMarks: 100,
      questionIds: [],
    });
    setEditingExam(null);
  };

  const openAddModal = () => {
    setEditingExam(null);
    setExamForm({
      title: '',
      description: '',
      duration: 60,
      totalMarks: 100,
      questionIds: [],
    });
    setIsModalOpen(true);
  };

  // Add new question logic for exam modal
  const handleSaveQuestionToExam = async () => {
    if (
      !questionForm.question.trim() ||
      questionForm.options.some(opt => !opt.trim()) ||
      questionForm.category === '' ||
      questionForm.difficulty === '' ||
      !questionForm.marks ||
      isNaN(questionForm.marks)
    ) {
      alert('Please fill all fields and provide all options.');
      return;
    }
    setSavingQuestion(true);
    const token = localStorage.getItem('token');
    const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const payload = {
      text: questionForm.question,
      options: questionForm.options,
      correctAnswer: questionForm.options[questionForm.correctAnswer],
      category: questionForm.category,
      difficulty: questionForm.difficulty,
      marks: questionForm.marks,
      explanation: questionForm.explanation
    };
    const response = await fetch('http://localhost:8090/api/admin/questions', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    setSavingQuestion(false);
    if (response.ok) {
      const newQuestion = await response.json();
      const newQ = {
        ...newQuestion,
        text: newQuestion.text,
        questionId: newQuestion.questionId || Date.now().toString()
      };
      setQuestions([...questions, newQ]);
      setExamForm(prev => ({
        ...prev,
        questionIds: [...(prev.questionIds || []), newQ.questionId]
      }));
      setIsQuestionModalOpen(false);
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        category: '',
        difficulty: 'Beginner',
        marks: 5,
        explanation: ''
      });
    } else {
      alert('Failed to create question');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Exam Management</h1>
          <p className="text-gray-600 mt-2">Create, edit, and manage all exams</p>
        </div>
        <Button onClick={openAddModal}>Create New Exam</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="floating" className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {exams.length}
          </div>
          <div className="text-sm text-gray-600">Total Exams</div>
        </Card>
        <Card variant="floating" className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            {Math.round(exams.reduce((sum, exam) => sum + (exam.duration || 0), 0) / (exams.length || 1))}
          </div>
          <div className="text-sm text-gray-600">Avg Duration (min)</div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="floating">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search exams..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <Button variant="outline" onClick={() => setFilters({ search: '' })}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Exams Table */}
      <Card variant="floating">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.map((exam) => {
                const addedMarks = questions.filter(q => (exam.questionIds || []).includes(q.questionId)).reduce((sum, q) => sum + (q.marks || 1), 0);
                const isFull = addedMarks === exam.totalMarks;
                return (
                  <tr key={exam.examId}>
                    <td className="px-6 py-4">{exam.title}</td>
                    <td className="px-6 py-4">{exam.description}</td>
                    <td className="px-6 py-4">{exam.duration} min</td>
                    <td className="px-6 py-4">{exam.totalMarks}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold px-3 py-1 rounded-full ${isFull ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{addedMarks}/{exam.totalMarks}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                      <button
                        onClick={() => handleEdit(exam)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full text-xl flex items-center justify-center"
                        title="Edit Exam"
                        style={{ fontSize: '1.35rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213l-4 1 1-4 13.362-13.726z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => navigate(`/admin/exams/${exam.examId}/add-questions`)}
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
                        onClick={() => handleDelete(exam.examId)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full text-xl flex items-center justify-center"
                        title="Delete Exam"
                        style={{ fontSize: '1.35rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredExams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No exams found matching your criteria.
          </div>
        )}
      </Card>

      {/* Add/Edit Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
        style={{}}
      >
        <div className="space-y-6 bg-white rounded-2xl shadow-2xl pt-4 pb-16 px-8 w-full max-w-xl mx-auto border border-gray-200 relative animate-fade-in max-h-[90vh] overflow-y-auto">
          {/* Stylish Title and Close Button inside the form */}
          <div className="flex items-center justify-between mb-6 rounded-t-2xl bg-gradient-to-r from-blue-50 to-indigo-100 px-4 py-3 -mx-8 -mt-4">
            <h2 className="text-3xl font-extrabold text-indigo-700 tracking-tight drop-shadow-sm">{editingExam ? 'Edit Exam' : 'Create New Exam'}</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-indigo-400 hover:text-white hover:bg-indigo-400 transition-colors duration-200 text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center focus:outline-none ml-4"
              aria-label="Close"
              style={{ zIndex: 10 }}
            >
              &times;
            </button>
          </div>
          <div className="border-b border-gray-200 -mx-8 mb-4"></div>
          <Input
            label="Exam Title"
            value={examForm.title}
            onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
            placeholder="Enter exam title..."
            className="w-full"
          />
          <Input
            label="Description"
            value={examForm.description}
            onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
            placeholder="Enter exam description..."
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              value={examForm.duration}
              onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) })}
              min="1"
              className="w-full"
            />
            <Input
              label="Total Marks"
              type="number"
              value={examForm.totalMarks}
              onChange={(e) => setExamForm({ ...examForm, totalMarks: parseInt(e.target.value) })}
              min="1"
              className="w-full"
            />
          </div>
          {/* Questions Section - Improved UI */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
          <div className="flex items-center mb-2">
            <Button
              type="button"
              className="mr-3"
              onClick={() => setIsQuestionModalOpen(true)}
              variant="outline"
              disabled={!examForm.title.trim()}
              title={examForm.title.trim() ? '' : 'Please enter exam title first'}
            >
              ➕ Add New Question
            </Button>
          </div>
          {/* Display selected questions as a styled list */}
          {examForm.questionIds.length > 0 ? (
            <div className="mb-2">
              <div className="font-semibold text-sm mb-1">Questions Added:</div>
              <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-gray-50">
                {examForm.questionIds.map(qid => {
                  const q = questions.find(q => (q.id || q.questionId) === qid);
                  return (
                    <li key={qid} className="px-4 py-2 flex items-center">
                      <span className="flex-1">{q ? (q.text || q.title) : `Question ID: ${qid}`}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="text-gray-500 text-sm mb-2">No questions added yet.</div>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingExam ? 'Update Exam' : 'Create Exam'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Question Modal (inline, matches QuestionBankPage style) */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title="Add New Question"
        size="lg"
      >
        <div className="w-full max-w-lg rounded-2xl p-6 bg-white mx-auto max-h-[80vh] overflow-y-auto">
          <Input
            label="Question"
            value={questionForm.question}
            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
            placeholder="Enter the question..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            {questionForm.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options];
                    newOptions[index] = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOptions });
                    if (questionForm.correctAnswer === index && e.target.value.trim() === '') {
                      setQuestionForm((prev) => ({ ...prev, correctAnswer: 0 }));
                    }
                  }}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
            <select
              value={questionForm.correctAnswer}
              onChange={e => setQuestionForm({ ...questionForm, correctAnswer: parseInt(e.target.value) })}
              className="input-field"
            >
              {questionForm.options.map((opt, idx) =>
                opt.trim() !== '' ? (
                  <option key={idx} value={idx}>{opt}</option>
                ) : null
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={questionForm.category}
                onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                className="input-field"
              >
                <option value="">Select Category</option>
                <option value="Programming">Programming</option>
                <option value="Framework">Framework</option>
                <option value="Styling">Styling</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={questionForm.difficulty}
                onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                className="input-field"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <Input
            label="Marks"
            type="number"
            value={questionForm.marks}
            onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
            min="1"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation (Optional)
            </label>
            <textarea
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Provide an explanation for the correct answer..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsQuestionModalOpen(false)} disabled={savingQuestion}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveQuestionToExam} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition" disabled={savingQuestion}>
              Add Question
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamManagementPage;