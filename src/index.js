import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import Home from './pages/Home';
import Curso from './Curso';
import Aluno from './Aluno';
import Matricula from './Matricula';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Router>
            <Header />
            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cursos" element={<Curso />} />
                    <Route path="/alunos" element={<Aluno />} />
                    <Route path="/matriculas" element={<Matricula />} />
                </Routes>
            </div>
        </Router>
    </React.StrictMode>
);
