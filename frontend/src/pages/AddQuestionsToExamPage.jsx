import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const AddQuestionsToExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: '',
    difficulty: 'Beginner',
    marks: 5,
    explanation: ''
  });
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState('');

  // Fetch exam and all questions
  useEffect(() => {
    const token = localStorage.getItem('token');
    const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:8090/api/admin/exams/${examId}`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
      }).then(res => res.json()),
      fetch('http://localhost:8090/api/admin/questions', {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
      }).then(res => res.json())
    ])
      .then(([examData, questionsData]) => {
        setExam(examData);
        setAllQuestions(questionsData);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, [examId]);

  // Get unique categories for filter
  const categoryOptions = Array.from(new Set(allQuestions.map(q => q.category).filter(Boolean)));

  // Filtering logic
  const filteredQuestions = allQuestions.filter(q => {
    const matchesText = filters.search === '' || (q.text || '').toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || q.category === filters.category;
    return matchesText && matchesCategory;
  });

  // Sort: added questions first, then unadded
  const sortedQuestions = [
    ...filteredQuestions.filter(q => (exam.questionIds || []).includes(q.questionId)),
    ...filteredQuestions.filter(q => !(exam.questionIds || []).includes(q.questionId))
  ];

  // Add question to exam
  const handleAdd = async (questionId) => {
    setWarning('');
    const questionToAdd = allQuestions.find(q => q.questionId === questionId);
    const addedQuestions = allQuestions.filter(q => (exam.questionIds || []).includes(q.questionId));
    const currentTotal = addedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const examTotal = exam.totalMarks || 0;
    const remaining = examTotal - currentTotal;
    if ((questionToAdd?.marks || 1) > remaining) {
      setWarning(`Only ${remaining} marks remaining, can't add this question.`);
      return;
    }
    const token = localStorage.getItem('token');
    const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const updatedQuestionIds = [...(exam.questionIds || []), questionId];
    const res = await fetch(`http://localhost:8090/api/admin/exams/${examId}/questions`, {
      method: 'PUT',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedQuestionIds),
    });
    if (res.ok) {
      // Refetch exam
      const examRes = await fetch(`http://localhost:8090/api/admin/exams/${examId}`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
      });
      setExam(await examRes.json());
    } else {
      setError('Failed to add question');
    }
  };

  // Remove question from exam
  const handleDelete = async (questionId) => {
    const token = localStorage.getItem('token');
    const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const updatedQuestionIds = (exam.questionIds || []).filter(id => id !== questionId);
    const res = await fetch(`http://localhost:8090/api/admin/exams/${examId}/questions`, {
      method: 'PUT',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedQuestionIds),
    });
    if (res.ok) {
      // Refetch exam
      const examRes = await fetch(`http://localhost:8090/api/admin/exams/${examId}`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
      });
      setExam(await examRes.json());
    } else {
      setError('Failed to remove question');
    }
  };

  // Add new question logic
  const handleSaveQuestion = async () => {
    // Validation: all fields must be filled
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
    setSaving(true);
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
    setSaving(false);
    if (response.ok) {
      const newQuestion = await response.json();
      const newQ = {
        ...newQuestion,
        text: newQuestion.text,
        questionId: newQuestion.questionId || Date.now().toString()
      };
      setAllQuestions([...allQuestions, newQ]);
      // Automatically add the new question to the exam
      const updatedQuestionIds = [...(exam.questionIds || []), newQ.questionId];
      const addRes = await fetch(`http://localhost:8090/api/admin/exams/${examId}/questions`, {
        method: 'PUT',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuestionIds),
      });
      if (addRes.ok) {
        const examRes = await fetch(`http://localhost:8090/api/admin/exams/${examId}`, {
          headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
        });
        setExam(await examRes.json());
      }
      setIsModalOpen(false);
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-700">Add Questions to Exam: {exam?.title}</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create New Question</Button>
      </div>
      <Card className="rounded-2xl shadow-2xl p-8 bg-white border border-gray-200">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Select Existing Questions</h2>
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
          {/* Marks Added/Total with color */}
          {(() => {
            const addedQuestions = allQuestions.filter(q => (exam.questionIds || []).includes(q.questionId));
            const addedMarks = addedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
            const isFull = addedMarks === (exam?.totalMarks || 0);
            return (
              <span className={`font-bold px-3 py-1 rounded-full ${isFull ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Marks Added: {addedMarks}/{exam?.totalMarks || 0}
              </span>
            );
          })()}
          <span className="font-medium text-blue-700">
            Remaining Marks: {
              (() => {
                const addedQuestions = allQuestions.filter(q => (exam.questionIds || []).includes(q.questionId));
                const currentTotal = addedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
                return Math.max((exam?.totalMarks || 0) - currentTotal, 0);
              })()
            }
          </span>
          {warning && <span className="text-red-600 ml-4">{warning}</span>}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search questions..."
            className="border rounded px-3 py-2 text-sm w-full md:w-1/3"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
          <select
            className="border rounded px-3 py-2 text-sm w-full md:w-1/4"
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedQuestions.map(q => {
                const isInExam = (exam.questionIds || []).includes(q.questionId);
                return (
                  <tr key={q.questionId}>
                    <td className="px-6 py-4 font-medium text-gray-900">{q.text}</td>
                    <td className="px-6 py-4">{q.category}</td>
                    <td className="px-6 py-4">{q.difficulty}</td>
                    <td className="px-6 py-4">{q.marks || 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                      {isInExam ? (
                        <>
                          <Button size="sm" variant="outline" disabled className="cursor-not-allowed opacity-60">Added</Button>
                          <Button size="sm" onClick={() => handleDelete(q.questionId)} className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1 rounded shadow hover:from-red-600 hover:to-pink-600">Remove</Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => handleAdd(q.questionId)} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded shadow hover:from-blue-600 hover:to-indigo-600">Add</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-8 space-x-3">
          <Button variant="outline" onClick={() => navigate('/admin/exams')}>Cancel</Button>
        </div>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveQuestion} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition" disabled={saving}>
              Add Question
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddQuestionsToExamPage;
