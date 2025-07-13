import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { mockQuestions } from '../utils/mockData';

const QuestionBankPage = () => {
  const [questions, setQuestions] = useState(mockQuestions);
  const [filteredQuestions, setFilteredQuestions] = useState(mockQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: '',
    difficulty: 'Beginner',
    marks: 5,
    explanation: ''
  });

  // Apply filters
  const applyFilters = () => {
    let filtered = questions;

    if (filters.category) {
      filtered = filtered.filter(q => q.category === filters.category);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty);
    }

    if (filters.search) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      category: question.category,
      difficulty: question.difficulty,
      marks: question.marks,
      explanation: question.explanation || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const newQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(newQuestions);
      setFilteredQuestions(newQuestions);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (editingQuestion) {
      // Update existing question (not implemented here, but you can add PUT logic if needed)
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id 
          ? { ...q, ...questionForm }
          : q
      );
      setQuestions(updatedQuestions);
      setFilteredQuestions(updatedQuestions);
    } else {
      // Add new question via backend
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
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions([...questions, {
          ...newQuestion,
          question: newQuestion.text, // for UI compatibility
          id: newQuestion.questionId || Date.now().toString()
        }]);
        setFilteredQuestions([...questions, {
          ...newQuestion,
          question: newQuestion.text,
          id: newQuestion.questionId || Date.now().toString()
        }]);
      } else {
        alert('Failed to create question');
      }
    }

    setIsModalOpen(false);
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      category: '',
      difficulty: 'Beginner',
      marks: 5,
      explanation: ''
    });
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      category: '',
      difficulty: 'Beginner',
      marks: 5,
      explanation: ''
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, questions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
        <Button onClick={openAddModal}>Add New Question</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search questions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Framework">Framework</option>
            <option value="Styling">Styling</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="input-field"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <Button variant="outline" onClick={() => setFilters({ category: '', difficulty: '', search: '' })}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Questions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">
                      {question.question}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {question.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      question.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {question.marks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No questions found matching your criteria.
          </div>
        )}
      </Card>

      {/* Add/Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
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
                    // If the correct answer is now empty, reset correctAnswer
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionBankPage;