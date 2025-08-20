import React, { useState, useRef } from 'react';
import { ClipboardCopy, XCircle, FileText, PlusCircle, CheckCircle, BrainCircuit } from 'lucide-react';

// Define the syllabus with topics as objects, including name and difficulty
const syllabus = {
  'UNIT-I': [
    { name: 'Diagrammatic representation Logistic Regression and Perceptron', difficulty: 'Easy' },
    { name: 'Multi-Layered Perceptron (MLP) Notation', difficulty: 'Medium' },
    { name: 'Training a single-neuron model', difficulty: 'Easy' },
    { name: 'Training an MLP Chain Rule', difficulty: 'Hard' },
    { name: 'Training an MLP Memorization', difficulty: 'Medium' },
    { name: 'Backpropagation', difficulty: 'Hard' },
    { name: 'Activation functions', difficulty: 'Easy' },
    { name: 'Vanishing gradient problem', difficulty: 'Medium' },
    { name: 'Bias variance trade-off', difficulty: 'Medium' },
    { name: 'Decision surfaces playground', difficulty: 'Easy' },
  ],
  'UNIT-II': [
    { name: 'Deep Multi-layer perceptrons 1980s to 2010s', difficulty: 'Easy' },
    { name: 'Dropout layers & Regularization', difficulty: 'Medium' },
    { name: 'Rectified Linear Units (ReLU)', difficulty: 'Easy' },
    { name: 'Weight initialization', difficulty: 'Medium' },
    { name: 'Batch Normalization', difficulty: 'Medium' },
    { name: 'Optimizers Hill-descent analogy in 2D', difficulty: 'Easy' },
    { name: 'Optimizers Hill descent in 3D and contours', difficulty: 'Medium' },
    { name: 'SGD Recap', difficulty: 'Easy' },
    { name: 'Batch SGD with momentum', difficulty: 'Hard' },
    { name: 'Nesterov Accelerated Gradient (NAG)', difficulty: 'Hard' },
  ],
};

// Simple question bank for demonstration purposes
const questionBank = {
  'Diagrammatic representation Logistic Regression and Perceptron': 'Draw and explain the diagrammatic representation of Logistic Regression and Perceptron models.',
  'Multi-Layered Perceptron (MLP) Notation': 'Explain the notation used for a Multi-Layered Perceptron (MLP) with a suitable diagram.',
  'Training a single-neuron model': 'Describe the process of training a single-neuron model. What are the key components involved?',
  'Training an MLP Chain Rule': 'How is the chain rule applied during the training of an MLP? Explain its significance.',
  'Training an MLP Memorization': 'What does "memorization" refer to in the context of training an MLP? How can it be prevented?',
  'Backpropagation': 'Explain the backpropagation algorithm. Why is it essential for training deep neural networks?',
  'Activation functions': 'Discuss the role of activation functions in neural networks. Compare and contrast Sigmoid and ReLU.',
  'Vanishing gradient problem': 'What is the vanishing gradient problem? How does it affect the training of deep networks and how can it be mitigated?',
  'Bias variance trade-off': 'Explain the concept of bias-variance trade-off in machine learning. How does it relate to model complexity?',
  'Decision surfaces playground': 'Explain what is a decision boundary and how to draw it for a given data.',
  'Deep Multi-layer perceptrons 1980s to 2010s': 'Summarize the evolution of deep multi-layer perceptrons from the 1980s to the 2010s.',
  'Dropout layers & Regularization': 'Define dropout and explain its role as a regularization technique. How does it prevent overfitting?',
  'Rectified Linear Units (ReLU)': 'Why is the Rectified Linear Unit (ReLU) a popular activation function? What are its advantages over other functions?',
  'Weight initialization': 'Explain the importance of proper weight initialization in training a neural network. Discuss a common method like Xavier or He initialization.',
  'Batch Normalization': 'Describe the process of batch normalization. What are its benefits and where is it typically applied in a network?',
  'Optimizers Hill-descent analogy in 2D': 'Explain the concept of an optimizer using a 2D hill-descent analogy.',
  'Optimizers Hill descent in 3D and contours': 'Extend the hill-descent analogy to 3D and explain how contour plots can visualize the optimization process.',
  'SGD Recap': 'Recap the Stochastic Gradient Descent (SGD) algorithm. What are its key characteristics?',
  'Batch SGD with momentum': 'Explain how momentum is used to improve Batch SGD. Why is it useful?',
  'Nesterov Accelerated Gradient (NAG)': 'Describe the Nesterov Accelerated Gradient (NAG) method. How does it differ from and improve upon standard momentum?',
};

// Component for the printable question paper
const PrintablePaper = React.forwardRef(({ questions, totalMarks, paperTitle, paperSubtitle }, ref) => (
  <div ref={ref} className="p-8 font-sans leading-relaxed text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
    <header className="text-center mb-10">
      <h1 className="text-4xl font-bold mb-2">{paperTitle}</h1>
      <p className="text-lg text-gray-600">{paperSubtitle}</p>
      <div className="mt-4 flex justify-between items-center text-gray-600 print:hidden">
        <span>Max. Marks: {totalMarks}</span>
        <span>Duration: 3 Hours</span>
      </div>
    </header>
    <section>
      {questions.map((q, index) => (
        <div key={index} className="mb-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{`${index + 1}. ${q.text}`}</h3>
            {q.marks && <span className="text-sm text-gray-500">[{q.marks} Marks]</span>}
          </div>
          <p className="mt-2 text-sm text-gray-500 italic print:hidden">Topic: {q.topic} (Difficulty: {q.difficulty})</p>
          <div className="mt-4 border-b border-dashed border-gray-300 h-16"></div>
        </div>
      ))}
    </section>
  </div>
));

const App = () => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState('selection');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paperTitle, setPaperTitle] = useState('Question Paper');
  const [paperSubtitle, setPaperSubtitle] = useState('Machine Learning (Advanced Deep Learning)');
  const componentRef = useRef();

  // Function to handle API call for question generation
  const generateQuestionWithAI = async (topic) => {
    setLoading(true);
    const prompt = `Generate a university-level question about the following machine learning topic: "${topic.name}". The difficulty should be "${topic.difficulty}". The question should be clear, concise, and suitable for a question paper. Do not include any introductory or concluding phrases, just the question itself.`;
    
    // The Gemini API call
    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = "AIzaSyAVqgzeRomhbrTKu4NQSZIETyqwl3nP1YI" 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    let response = null;
    try {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('API call failed with status:', response.status);
            throw new Error('API call failed');
        }

        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          return text.trim();
        } else {
          throw new Error('No text generated from API');
        }
    } catch (error) {
        console.error('Error generating question:', error);
        return `Could not generate a question for "${topic.name}". Please write your own.`;
    } finally {
        setLoading(false);
    }
  };

  // Function to toggle selected topics
  const handleTopicToggle = (topic) => {
    if (selectedTopics.find(t => t.name === topic.name)) {
      setSelectedTopics(selectedTopics.filter(t => t.name !== topic.name));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Generate questions from selected topics
  const handleGenerateQuestions = () => {
    const newQuestions = selectedTopics.map(topic => ({
      id: Math.random(),
      text: questionBank[topic.name] || `Write a question about: ${topic.name}`,
      topic: topic.name,
      difficulty: topic.difficulty,
      marks: 5, // Default marks for each question
    }));
    setQuestions(newQuestions);
    setPage('questions');
  };

  // Add a new blank question
  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Math.random(), text: 'New Question', marks: 5, difficulty: 'N/A' }]);
  };

  // Add a new question from AI
  const handleAddAIQuestion = async () => {
    const topic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)];
    if (!topic) {
        alert("Please select at least one topic to generate an AI question.");
        return;
    }
    const newQuestionText = await generateQuestionWithAI(topic);
    setQuestions([...questions, { id: Math.random(), text: newQuestionText, marks: 5, difficulty: topic.difficulty, topic: topic.name }]);
  };

  // Update a question's text
  const handleUpdateQuestionText = (id, newText) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, text: newText } : q)));
  };

  // Update a question's marks
  const handleUpdateMarks = (id, newMarks) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, marks: parseInt(newMarks, 10) || 0 } : q)));
  };

  // Delete a question
  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Finalize the paper and view for print/copy
  const handleFinalizePaper = () => {
    setPage('paper');
  };
  
  // Custom print function
  const handlePrint = () => {
    const content = componentRef.current;
    if (content) {
      const originalTitle = document.title;
      document.title = paperTitle;
      
      const newWin = window.open('', '_blank');
      newWin.document.write('<html><head><title>Question Paper</title>');
      newWin.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
      newWin.document.write('<style>');
      newWin.document.write('@media print { body { -webkit-print-color-adjust: exact; } .print\\:hidden { display: none !important; } }');
      newWin.document.write('</style>');
      newWin.document.write('</head><body>');
      newWin.document.write(content.innerHTML);
      newWin.document.write('</body></html>');
      newWin.document.close();
      newWin.print();
      newWin.onafterprint = () => {
        newWin.close();
        document.title = originalTitle;
      };
    }
  };

  // Calculate total marks
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  // Copy paper to clipboard using a custom modal
  const copyToClipboard = () => {
    const paperText = `Title: ${paperTitle}\nSubtitle: ${paperSubtitle}\nMax. Marks: ${totalMarks}\n\n` +
      questions.map((q, index) => `${index + 1}. ${q.text} [${q.marks} Marks]`).join('\n\n');
    
    try {
        navigator.clipboard.writeText(paperText);
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2000);
    } catch (err) {
        // Fallback for environments without clipboard API
        const tempElement = document.createElement('textarea');
        tempElement.value = paperText;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2000);
    }
  };

  const renderSelectionPage = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Select Syllabus Topics</h2>
      {Object.keys(syllabus).map(unit => (
        <div key={unit} className="mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">{unit}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {syllabus[unit].map(topic => (
              <div
                key={topic.name}
                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ease-in-out ${selectedTopics.find(t => t.name === topic.name) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => handleTopicToggle(topic)}
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.find(t => t.name === topic.name)}
                  onChange={() => handleTopicToggle(topic)}
                  className="mr-3 h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <label className="text-sm font-medium">{topic.name}</label>
                  <span className={`block text-xs font-light mt-1 ${selectedTopics.find(t => t.name === topic.name) ? 'text-indigo-200' : 'text-gray-500'}`}>
                    Difficulty: {topic.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleGenerateQuestions}
          disabled={selectedTopics.length === 0}
          className="flex items-center px-8 py-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle className="mr-2" />
          Generate Questions
        </button>
      </div>
    </div>
  );

  const renderQuestionsPage = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Review & Edit Questions</h2>
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="relative p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="absolute top-2 left-4 text-sm font-semibold text-indigo-600">Q{index + 1}.</div>
            <button
              onClick={() => handleDeleteQuestion(q.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              aria-label="Delete question"
            >
              <XCircle size={24} />
            </button>
            <textarea
              className="mt-6 w-full p-4 text-gray-800 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              rows="4"
              value={q.text}
              onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500 font-medium">Topic: {q.topic} (Difficulty: {q.difficulty})</span>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Marks:</label>
                <input
                  type="number"
                  min="1"
                  className="w-20 p-2 text-center text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={q.marks}
                  onChange={(e) => handleUpdateMarks(q.id, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center flex-wrap gap-4">
        <button
          onClick={handleAddQuestion}
          className="flex items-center px-6 py-2 bg-gray-200 text-gray-800 rounded-full shadow-md hover:bg-gray-300 transition-colors duration-200"
        >
          <PlusCircle className="mr-2" />
          Add Blank Question
        </button>
        <button
          onClick={handleAddAIQuestion}
          disabled={loading || selectedTopics.length === 0}
          className={`flex items-center px-6 py-2 rounded-full shadow-md transition-colors duration-200 ${
            loading ? 'bg-indigo-300 text-gray-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <BrainCircuit className="mr-2" />
          )}
          {loading ? 'Generating...' : 'Generate with AI'}
        </button>
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold text-gray-700">Total Marks: {totalMarks}</span>
          <button
            onClick={handleFinalizePaper}
            className="flex items-center px-8 py-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors duration-200"
          >
            <FileText className="mr-2" />
            Finalize Paper
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaperPage = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Final Question Paper</h2>
      <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-y-auto max-h-screen">
        <div className="print-area">
          <PrintablePaper questions={questions} totalMarks={totalMarks} paperTitle={paperTitle} paperSubtitle={paperSubtitle} ref={componentRef} />
        </div>
      </div>
      <div className="mt-8 flex justify-center space-x-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center px-8 py-3 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors duration-200"
        >
          <FileText className="mr-2" />
          Print / Save as PDF
        </button>
        <button
          onClick={copyToClipboard}
          className="flex items-center px-8 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200"
        >
          <ClipboardCopy className="mr-2" />
          Copy to Clipboard
        </button>
        <button
          onClick={() => setPage('selection')}
          className="flex items-center px-8 py-3 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600 transition-colors duration-200"
        >
          <FileText className="mr-2" />
          Start New Paper
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 p-4">
      <div className="container mx-auto max-w-4xl bg-gray-50 rounded-2xl shadow-xl overflow-hidden">
        {page === 'selection' && renderSelectionPage()}
        {page === 'questions' && renderQuestionsPage()}
        {page === 'paper' && renderPaperPage()}
      </div>
      {/* Custom Modal for Copy Confirmation */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-3">
            <CheckCircle className="text-green-500" size={32} />
            <p className="text-lg font-medium text-gray-800">Copied to clipboard!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
