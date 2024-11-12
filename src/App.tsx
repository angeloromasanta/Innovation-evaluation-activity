import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentView from './components/StudentView';
import TallyView from './components/TallyView';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentView />} />
        <Route path="/tally" element={<TallyView />} />
      </Routes>
    </Router>
  );
};

export default App;
