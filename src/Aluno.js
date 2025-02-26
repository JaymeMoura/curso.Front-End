import './App.css';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Modal, ModalBody, ModalFooter, ModalHeader, Alert } from 'reactstrap';

function Aluno() {
    const baseUrl = "https://localhost:7152/api/v1/aluno";

    const [data, setData] = useState([]);
    const [updateData, setUpdateData] = useState(true);
    const [modalIncluir, setModalIncluir] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalExcluir, setModalExcluir] = useState(false);

    const [alunoSelecionado, setAlunoSelecionado] = useState({
        alunoId: '',
        nomeAluno: '',
        email: '',
        dataNascimento: ''
    });

    const [mensagem, setMensagem] = useState({
        tipo: '',
        texto: ''
    });

    const selecionarAluno = (aluno, opcao) => {
        setAlunoSelecionado(aluno);
        (opcao === "Editar") ?
            abrirFecharModalEditar() : abrirFecharModalExcluir();
    };

    const abrirFecharModalIncluir = () => {
        setModalIncluir(!modalIncluir);
    };

    const abrirFecharModalEditar = () => {
        setModalEditar(!modalEditar);
    };

    const abrirFecharModalExcluir = () => {
        setModalExcluir(!modalExcluir);
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setAlunoSelecionado(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const pedidosGet = async () => {
        try {
            const response = await axios.get(baseUrl);
            setData(response.data);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
        }
    };

    const pedidoPost = async () => {
        try {
            delete alunoSelecionado.alunoId;
            const response = await axios.post(baseUrl, alunoSelecionado);
            setData(data.concat(response.data));
            setUpdateData(true);

            setMensagem({ tipo: 'sucesso', texto: 'Aluno criado com sucesso!' });

            abrirFecharModalIncluir();
            setAlunoSelecionado({ alunoId: '', nomeAluno: '', email: '', dataNascimento: '' });
        } catch (error) {
            const mensagemErro = error.response?.data || "Erro ao adicionar aluno.";
            setMensagem({ tipo: 'erro', texto: mensagemErro });
            esconderMensagemDepoisDeTempo();
        }
    };

    const pedidoPut = async () => {
        try {
            const { alunoId, nomeAluno, email } = alunoSelecionado;
            const url = `${baseUrl}/${alunoId}?nomeAluno=${encodeURIComponent(nomeAluno)}&email=${encodeURIComponent(email)}`;
            const response = await axios.put(url);

            const alunoAtualizado = response.data;

            setData(prevData =>
                prevData.map(aluno =>
                    aluno.alunoId === alunoId ? { ...aluno, nomeAluno: alunoAtualizado.nomeAluno, email: alunoAtualizado.email } : aluno
                )
            );
            setUpdateData(true);
            setMensagem({ tipo: 'sucesso', texto: 'Aluno atualizado com sucesso!' });

            abrirFecharModalEditar();
            setAlunoSelecionado({ alunoId: '', nomeAluno: '', email: '', dataNascimento: '' });

            esconderMensagemDepoisDeTempo();
        } catch (error) {
            const mensagemErro = error.response?.data || "Erro ao editar aluno.";
            setMensagem({ tipo: 'erro', texto: mensagemErro });
            esconderMensagemDepoisDeTempo();
        }
    };

    const pedidoDelete = async () => {
        try {
            await axios.delete(baseUrl + "/" + alunoSelecionado.alunoId)
                .then(response => {
                    setData(data.filter(aluno => aluno.alunoId !== response.data));
                    setMensagem({ tipo: 'sucesso', texto: 'Aluno excluído com sucesso!' });
                    setUpdateData(true);
                    abrirFecharModalExcluir();
                    setAlunoSelecionado({ alunoId: '', nomeAluno: '', email: '', dataNascimento: '' });

                    setTimeout(() => {
                        setMensagem({ tipo: '', texto: '' });
                    }, 5000);
                })
        } catch (error) {
            const mensagemErro = error.response?.data || "Erro ao excluir o aluno.";
            setMensagem({ tipo: 'erro', texto: mensagemErro });

            setTimeout(() => {
                setMensagem({ tipo: '', texto: '' });
            }, 5000);
        }
    }

    const esconderMensagemDepoisDeTempo = () => {
        setTimeout(() => {
            setMensagem({ tipo: '', texto: '' });
        }, 5000);
    };

    useEffect(() => {
        if (updateData) {
            pedidosGet();
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
            <h3>Centro de Alunos</h3>
            <header>
                <button className='btn btn-success' onClick={abrirFecharModalIncluir}>Novo Aluno</button>
            </header>
            <table className='table table-bordered'>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Data de Nascimento</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(aluno => (
                        <tr key={aluno.alunoId}>
                            <td>{aluno.nomeAluno}</td>
                            <td>{aluno.email}</td>
                            <td>{new Date(aluno.dataNascimento).toLocaleDateString()}</td>
                            <td>
                                <button className='btn btn-primary' onClick={() => selecionarAluno(aluno, "Editar")}>Editar</button>
                                <button className='btn btn-danger' onClick={() => selecionarAluno(aluno, "Excluir")}>Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal isOpen={modalIncluir}>
                <ModalHeader> Adicionar Aluno </ModalHeader>
                <ModalBody>
                    {mensagem.texto && (
                        <Alert color={mensagem.tipo === 'sucesso' ? 'success' : 'danger'}>
                            {mensagem.texto}
                        </Alert>
                    )}
                    <div className='form-group'>
                        <label>Nome: </label>
                        <br />
                        <input type='text' className='form-control' name='nomeAluno' onChange={handleChange} />
                        <br />
                        <label>Email: </label>
                        <input type='text' className='form-control' name='email' onChange={handleChange} />
                        <br />
                        <label>Data de Nascimento: </label>
                        <input type='date' className='form-control' name='dataNascimento' onChange={handleChange} />
                        <br />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-primary' onClick={pedidoPost}> Adicionar</button>
                    <button className='btn btn-danger' onClick={abrirFecharModalIncluir}> Cancelar</button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={modalEditar}>
                <ModalHeader>Editar Aluno</ModalHeader>
                <ModalBody>
                    {mensagem.texto && (
                        <Alert color={mensagem.tipo === 'sucesso' ? 'success' : 'danger'}>
                            {mensagem.texto}
                        </Alert>
                    )}
                    <div className='form-group'>
                        <label>Nome: </label><br />
                        <input type='text' className='form-control' name="nomeAluno" onChange={handleChange}
                            value={alunoSelecionado && alunoSelecionado.nomeAluno}></input><br />

                        <label>Email: </label>
                        <input type='email' className='form-control' name='email' onChange={handleChange}
                            value={alunoSelecionado && alunoSelecionado.email}></input><br />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-primary' onClick={pedidoPut}> Editar</button>
                    <button className='btn btn-danger' onClick={abrirFecharModalEditar}> Cancelar</button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={modalExcluir}>
                <ModalBody>
                    Confirma a exclusão do Aluno: {alunoSelecionado && alunoSelecionado.nomeAluno}?
                </ModalBody>

                <ModalFooter>
                    <button className='btn btn-danger' onClick={pedidoDelete}>Sim</button>
                    <button className='btn btn-secondary' onClick={abrirFecharModalExcluir}>Não</button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default Aluno;