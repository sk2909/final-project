export const mockExams = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    duration: 60,
    totalQuestions: 20,
    totalMarks: 100,
    status: 'active',
    category: 'Programming',
    difficulty: 'Beginner',
    createdAt: '2024-01-15',
    questions: [
      {
        id: '1',
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var name;', 'variable name;', 'declare name;', 'v name;'],
        correctAnswer: 0,
        marks: 5
      },
      {
        id: '2',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['append()', 'push()', 'add()', 'insert()'],
        correctAnswer: 1,
        marks: 5
      }
    ]
  },
  {
    id: '2',
    title: 'React Concepts',
    description: 'Advanced React concepts and patterns',
    duration: 90,
    totalQuestions: 30,
    totalMarks: 150,
    status: 'active',
    category: 'Framework',
    difficulty: 'Advanced',
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    title: 'CSS Layouts',
    description: 'Modern CSS layout techniques',
    duration: 45,
    totalQuestions: 15,
    totalMarks: 75,
    status: 'draft',
    category: 'Styling',
    difficulty: 'Intermediate',
    createdAt: '2024-01-25'
  }
];

export const mockQuestions = [
  {
    id: '1',
    question: 'What is the correct way to declare a variable in JavaScript?',
    options: ['var name;', 'variable name;', 'declare name;', 'v name;'],
    correctAnswer: 0,
    category: 'Programming',
    difficulty: 'Beginner',
    marks: 5,
    explanation: 'Variables in JavaScript can be declared using var, let, or const keywords.'
  },
  {
    id: '2',
    question: 'Which method is used to add an element to the end of an array?',
    options: ['append()', 'push()', 'add()', 'insert()'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Beginner',
    marks: 5,
    explanation: 'The push() method adds one or more elements to the end of an array.'
  },
  {
    id: '3',
    question: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
    correctAnswer: 1,
    category: 'Styling',
    difficulty: 'Beginner',
    marks: 5,
    explanation: 'CSS stands for Cascading Style Sheets.'
  }
];

export const mockResults = [
  {
    id: '1',
    examId: '1',
    examTitle: 'JavaScript Fundamentals',
    studentId: '1',
    score: 85,
    totalMarks: 100,
    percentage: 85,
    status: 'completed',
    startTime: '2024-01-20T10:00:00Z',
    endTime: '2024-01-20T11:00:00Z',
    answers: [
      { questionId: '1', selectedAnswer: 0, isCorrect: true },
      { questionId: '2', selectedAnswer: 1, isCorrect: true }
    ]
  }
];

export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    status: 'active',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'student',
    status: 'active',
    createdAt: '2024-01-12'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01'
  }
];