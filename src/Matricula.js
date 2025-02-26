import './App.css';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Modal, ModalBody, ModalFooter, ModalHeader, Alert } from 'reactstrap';

function Matricula() {
    const baseUrl = "https://localhost:7152/api/v1/matricula";
    const alunosUrl = "https://localhost:7152/api/v1/aluno";
    const cursosUrl = "https://localhost:7152/api/v1/curso";

    const [data, setData] = useState([]); // Lista de matrículas
    const [alunos, setAlunos] = useState([]); // Lista de alunos
    const [cursos, setCursos] = useState([]); // Lista de cursos
    const [alunosPorCurso, setAlunosPorCurso] = useState({}); // Alunos por curso (cursoId como chave)
    const [modalMatricular, setModalMatricular] = useState(false);
    const [modalDesmatricular, setModalDesmatricular] = useState(false);
    const [modalDetalhes, setModalDetalhes] = useState(false);
    const [updateData, setUpdateData] = useState(true);

    const [matriculaSelecionada, setMatriculaSelecionada] = useState({
        matriculaId: '',
        alunoId: '',
        cursoId: ''
    });

    const [mensagem, setMensagem] = useState({
        tipo: '',
        texto: ''
    });

    // Função para selecionar uma matrícula e abrir o modal correspondente
    const selecionarMatricula = (matricula, opcao) => {
        setMatriculaSelecionada(matricula);
        (opcao === "Detalhes") ?
            abrirFecharModalDetalhes() : abrirFecharModalDesmatricular();
    };

    // Funções para abrir/fechar modais
    const abrirFecharModalMatricular = () => {
        setModalMatricular(!modalMatricular);
        setMatriculaSelecionada({ matriculaId: '', alunoId: '', cursoId: '' }); // Limpa o estado ao abrir/fechar o modal
    };

    const abrirFecharModalDesmatricular = () => {
        setModalDesmatricular(!modalDesmatricular);
    };

    const abrirFecharModalDetalhes = () => {
        setModalDetalhes(!modalDetalhes);
    };

    // Função para manipular mudanças nos inputs dos modais
    const handleChange = e => {
        const { name, value } = e.target;
        setMatriculaSelecionada(prevState => ({
            ...prevState,
            [name]: value ? Number(value) : ''
        }));
    };

    // Função para buscar matrículas de um curso específico
    const pedidosGet = async (cursoId) => {
        try {
            const response = await axios.get(`${baseUrl}/${cursoId}/curso`);
            setData(response.data);
        } catch (error) {
            console.error("Erro ao buscar matrículas:", error);
        }
    };

    // Função para carregar todos os alunos
    const carregarAlunos = async () => {
        try {
            const response = await axios.get(alunosUrl);
            setAlunos(response.data);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
        }
    };

    // Função para carregar todos os cursos
    const carregarCursos = async () => {
        try {
            const response = await axios.get(cursosUrl);
            setCursos(response.data);
        } catch (error) {
            console.error("Erro ao buscar cursos:", error);
        }
    };

    // Função para carregar os alunos de um curso específico
    const carregarAlunosDoCurso = async (cursoId) => {
        try {
            const response = await axios.get(`${baseUrl}/${cursoId}/curso`);
            setAlunosPorCurso(prevState => ({
                ...prevState,
                [cursoId]: response.data // Armazena os alunos no estado, usando o cursoId como chave
            }));
        } catch (error) {
            console.error("Erro ao buscar alunos do curso:", error);
        }
    };

    // Função para matricular um aluno
    const pedidoPost = async () => {
        try {
            const { alunoId, cursoId } = matriculaSelecionada;

            if (!alunoId || !cursoId) {
                setMensagem({ tipo: 'erro', texto: 'Selecione um aluno e um curso!' });
                esconderMensagemDepoisDeTempo();
                return;
            }

            const response = await axios.post(`${baseUrl}?alunoId=${alunoId}&cursoId=${cursoId}`);

            setData([...data, response.data]);
            setUpdateData(true);

            setMensagem({ tipo: 'sucesso', texto: 'Aluno matriculado com sucesso!' });
            abrirFecharModalMatricular();
            setMatriculaSelecionada({ matriculaId: '', alunoId: '', cursoId: '' });

            esconderMensagemDepoisDeTempo();
        } catch (error) {
            const mensagemErro = error.response?.data || "Erro ao matricular aluno.";
            setMensagem({ tipo: 'erro', texto: mensagemErro });
            esconderMensagemDepoisDeTempo();
        }
    };

    // Função para desmatricular um aluno
    const pedidoDelete = async () => {
        try {
            const { alunoId, cursoId } = matriculaSelecionada;
            await axios.delete(`${baseUrl}?alunoId=${alunoId}&cursoId=${cursoId}`);
    
            // Remover aluno da lista de alunos do curso
            setAlunosPorCurso(prevState => ({
                ...prevState,
                [cursoId]: prevState[cursoId].filter(matricula => matricula.aluno.alunoId !== alunoId)
            }));
    
            setMensagem({ tipo: 'sucesso', texto: 'Aluno desmatriculado com sucesso!' });
            abrirFecharModalDesmatricular();
            setMatriculaSelecionada({ matriculaId: '', alunoId: '', cursoId: '' });
    
            setUpdateData(true); // Dispara atualização geral dos dados
            esconderMensagemDepoisDeTempo();
        } catch (error) {
            const mensagemErro = error.response?.data || "Erro ao desmatricular o aluno.";
            setMensagem({ tipo: 'erro', texto: mensagemErro });
            esconderMensagemDepoisDeTempo();
        }
    };
    

    // Função para esconder a mensagem após 5 segundos
    const esconderMensagemDepoisDeTempo = () => {
        setTimeout(() => {
            setMensagem({ tipo: '', texto: '' });
        }, 5000);
    };

    // Efeito para carregar os dados ao iniciar ou quando updateData é alterado
    useEffect(() => {
        if (updateData) {
            const carregarDados = async () => {
                await carregarAlunos();
                await carregarCursos();

                // Após carregar os cursos, carregar os alunos de cada curso
                const cursosResponse = await axios.get(cursosUrl);
                const cursosData = cursosResponse.data;

                for (const curso of cursosData) {
                    await carregarAlunosDoCurso(curso.cursoId);
                }
            };

            carregarDados();
            setUpdateData(false);
        }
    }, [updateData]);

    return (
        <div className="App">
            {mensagem.texto && mensagem.tipo === 'sucesso' && (
                <Alert color="success" className="mt-3">
                    {mensagem.texto}
                </Alert>
            )}

            <h3>Gerenciamento de Matrículas</h3>
            <header>
                <button className='btn btn-success' onClick={abrirFecharModalMatricular}>Matricular Aluno</button>
            </header>

            {/* Lista de cursos e alunos */}
            <div className="mt-4">
                {cursos.map(curso => (
                    <div key={curso.cursoId} className="card mb-4">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">{curso.nomeCurso.toUpperCase()}</h5>
                        </div>
                        <div className="card-body">
                            {alunosPorCurso[curso.cursoId] ? (
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Nome do Aluno</th>
                                            <th>Email</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alunosPorCurso[curso.cursoId].map(matricula => (
                                            <tr key={matricula.aluno.alunoId}>
                                                <td>{matricula.aluno.nomeAluno}</td>
                                                <td>{matricula.aluno.email}</td>
                                                <td>
                                                    <button className='btn btn-primary' onClick={() => selecionarMatricula(matricula, "Detalhes")}>Detalhes</button>
                                                    <button className='btn btn-danger' onClick={() => selecionarMatricula(matricula, "Desmatricular")}>Desmatricular</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>Nenhum aluno matriculado neste curso.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal para matricular aluno */}
            <Modal isOpen={modalMatricular}>
                <ModalHeader> Matricular Aluno </ModalHeader>
                <ModalBody>
                    {mensagem.texto && (
                        <Alert color={mensagem.tipo === 'sucesso' ? 'success' : 'danger'}>
                            {mensagem.texto}
                        </Alert>
                    )}
                    <div className='form-group'>
                        <label>Aluno: </label>
                        <br />
                        <select className='form-control' name='alunoId' onChange={handleChange}>
                            <option value="">Selecione um aluno</option>
                            {alunos.map(aluno => (
                                <option key={aluno.alunoId} value={aluno.alunoId}>
                                    {aluno.nomeAluno} 
                                </option>
                            ))}
                        </select>
                        <br />
                        <label>Curso: </label>
                        <select className='form-control' name='cursoId' onChange={handleChange}>
                            <option value="">Selecione um curso</option>
                            {cursos.map(curso => (
                                <option key={curso.cursoId} value={curso.cursoId}>
                                    {curso.nomeCurso}
                                </option>
                            ))}
                        </select>
                        <br />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-primary' onClick={pedidoPost}> Matricular</button>
                    <button className='btn btn-danger' onClick={abrirFecharModalMatricular}> Cancelar</button>
                </ModalFooter>
            </Modal>

            {/* Modal para desmatricular aluno */}
            <Modal isOpen={modalDesmatricular}>
                <ModalBody>
                    Confirma a desmatrícula do Aluno ID: {matriculaSelecionada && matriculaSelecionada.alunoId} do Curso ID: {matriculaSelecionada && matriculaSelecionada.cursoId}?
                </ModalBody>

                <ModalFooter>
                    <button className='btn btn-danger' onClick={pedidoDelete}>Sim</button>
                    <button className='btn btn-secondary' onClick={abrirFecharModalDesmatricular}>Não</button>
                </ModalFooter>
            </Modal>

            {/* Modal para detalhes da matrícula */}
            <Modal isOpen={modalDetalhes}>
                <ModalHeader>Detalhes da Matrícula</ModalHeader>
                <ModalBody>
                    <div className='form-group'>
                        <label>Matrícula ID: </label><br />
                        <input type='text' className='form-control' readOnly value={matriculaSelecionada && matriculaSelecionada.matriculaId}></input><br />

                        <label>Aluno ID: </label>
                        <input type='text' className='form-control' readOnly value={matriculaSelecionada && matriculaSelecionada.alunoId}></input><br />

                        <label>Curso ID: </label>
                        <input type='text' className='form-control' readOnly value={matriculaSelecionada && matriculaSelecionada.cursoId}></input><br />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-secondary' onClick={abrirFecharModalDetalhes}>Fechar</button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default Matricula;