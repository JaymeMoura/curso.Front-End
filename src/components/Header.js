import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-dark text-white p-3">
            <div className="container">
                <h1 className="mb-0">Sistema de Gestão</h1>
                <nav>
                    <ul className="nav">
                        <li className="nav-item">
                            <Link to="/" className="nav-link text-white">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/cursos" className="nav-link text-white">Cursos</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/alunos" className="nav-link text-white">Alunos</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/matriculas" className="nav-link text-white">Matrículas</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
