import './App.css';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Modal, ModalBody, ModalFooter, ModalHeader, Alert } from 'reactstrap';

function Curso() {
  const baseUrl = "https://localhost:7152/api/v1/curso";
  const matriculaUrl = "https://localhost:7152/api/v1/matricula";

  const [data, setData] = useState([]);
  const [updateData, setUpdateData] = useState(true);
  const [modalIncluir, setModalIncluir] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [modalAlunos, setModalAlunos] = useState(false);

  const [cursoSelecionado, setCursoSelecionado] = useState({
    cursoId: '',
    nomeCurso: '',
    descricao: ''
  });

  const [alunosDoCurso, setAlunosDoCurso] = useState([]);

  const [mensagem, setMensagem] = useState({
    tipo: '',
    texto: ''
  });

  const selecionarCurso = (curso, opcao) => {
    setCursoSelecionado(curso);
    if (opcao === "Editar") {
      abrirFecharModalEditar();
    } else if (opcao === "Excluir") {
      abrirFecharModalExcluir();
    } else if (opcao === "VerAlunos") {
      abrirFecharModalAlunos();
      carregarAlunosDoCurso(curso.cursoId);
    }
  };

  const abrirFecharModalIncluir = () => {
    setModalIncluir(!modalIncluir);
    setCursoSelecionado({ cursoId: '', nomeCurso: '', descricao: '' });
  };

  const abrirFecharModalEditar = () => {
    setModalEditar(!modalEditar);
  };

  const abrirFecharModalExcluir = () => {
    setModalExcluir(!modalExcluir);
  };

  const abrirFecharModalAlunos = () => {
    setModalAlunos(!modalAlunos);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setCursoSelecionado(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const pedidosGet = async () => {
    try {
      const response = await axios.get(baseUrl);
      setData(response.data);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
    }
  };

  const carregarAlunosDoCurso = async (cursoId) => {
    try {
      setAlunosDoCurso([]);

      const response = await axios.get(`${matriculaUrl}/${cursoId}/curso`);
      setAlunosDoCurso(response.data);
      setUpdateData(true);
    } catch (error) {
      console.error("Erro ao buscar alunos do curso:", error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar alunos do curso.' });
      esconderMensagemDepoisDeTempo();
    }
  };

  const pedidoPost = async () => {
    try {
      const { nomeCurso, descricao } = cursoSelecionado;

      if (!nomeCurso || !descricao) {
        setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos!' });
        esconderMensagemDepoisDeTempo();
        return;
      }

      delete cursoSelecionado.cursoId;
      const response = await axios.post(baseUrl, cursoSelecionado);
      setData(data.concat(response.data));
      setUpdateData(true);

      setMensagem({ tipo: 'sucesso', texto: 'Curso adicionado com sucesso!' });
      abrirFecharModalIncluir();
      setCursoSelecionado({ cursoId: '', nomeCurso: '', descricao: '' });

      esconderMensagemDepoisDeTempo();
    } catch (error) {
      const mensagemErro = error.response?.data || "Erro ao adicionar curso.";
      setMensagem({ tipo: 'erro', texto: mensagemErro });
      esconderMensagemDepoisDeTempo();
    }
  };

  const pedidoPut = async () => {
    try {
      const { cursoId, nomeCurso, descricao } = cursoSelecionado;

      if (!nomeCurso || !descricao) {
        setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos!' });
        esconderMensagemDepoisDeTempo();
        return;
      }

      const url = `${baseUrl}/${cursoId}?nomeCurso=${encodeURIComponent(nomeCurso)}&descricao=${encodeURIComponent(descricao)}`;
      const response = await axios.put(url);

      const cursoAtualizado = response.data;

      setData(prevData =>
        prevData.map(curso =>
          curso.cursoId === cursoId ? { ...curso, nomeCurso: cursoAtualizado.nomeCurso, descricao: cursoAtualizado.descricao } : curso
        )
      );
      setUpdateData(true);

      setMensagem({ tipo: 'sucesso', texto: 'Curso atualizado com sucesso!' });
      abrirFecharModalEditar();
      setCursoSelecionado({ cursoId: '', nomeCurso: '', descricao: '' });

      esconderMensagemDepoisDeTempo();
    } catch (error) {
      const mensagemErro = error.response?.data || "Erro ao editar curso.";
      setMensagem({ tipo: 'erro', texto: mensagemErro });
      esconderMensagemDepoisDeTempo();
    }
  };

  const pedidoDelete = async () => {
    try {
      await axios.delete(baseUrl + "/" + cursoSelecionado.cursoId)
        .then(response => {
          setData(data.filter(curso => curso.cursoId !== response.data));
          setUpdateData(true);

          setMensagem({ tipo: 'sucesso', texto: 'Curso excluído com sucesso!' });
          abrirFecharModalExcluir();
          setCursoSelecionado({ cursoId: '', nomeCurso: '', descricao: '' });

          esconderMensagemDepoisDeTempo();
        });
    } catch (error) {
      const mensagemErro = error.response?.data || "Erro ao excluir o curso.";
      setMensagem({ tipo: 'erro', texto: mensagemErro });
      esconderMensagemDepoisDeTempo();
    }
  };

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

      <h3>Centro de Cursos</h3>
      <header>
        <button className='btn btn-success' onClick={abrirFecharModalIncluir}>Novo Curso</button>
      </header>
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map(curso => (
            <tr key={curso.cursoId}>
              <td>{curso.nomeCurso}</td>
              <td>{curso.descricao}</td>
              <td>
                <button className='btn btn-primary' onClick={() => selecionarCurso(curso, "Editar")}>Editar</button>
                <button className='btn btn-danger' onClick={() => selecionarCurso(curso, "Excluir")}>Excluir</button>
                <button className='btn btn-dark' onClick={() => selecionarCurso(curso, "VerAlunos")}>Ver Alunos</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={modalIncluir}>
        <ModalHeader> Adicionar Curso </ModalHeader>
        <ModalBody>
          {mensagem.texto && (
            <Alert color={mensagem.tipo === 'sucesso' ? 'success' : 'danger'}>
              {mensagem.texto}
            </Alert>
          )}
          <div className='form-group'>
            <label>Nome: </label>
            <br />
            <input type='text' className='form-control' name='nomeCurso' onChange={handleChange} />
            <br />
            <label>Descrição: </label>
            <input type='text' className='form-control' name='descricao' onChange={handleChange} />
            <br />
          </div>
        </ModalBody>
        <ModalFooter>
          <button className='btn btn-primary' onClick={pedidoPost}> Adicionar</button>
          <button className='btn btn-danger' onClick={abrirFecharModalIncluir}> Cancelar</button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modalEditar}>
        <ModalHeader>Editar Curso</ModalHeader>
        <ModalBody>
          {mensagem.texto && (
            <Alert color={mensagem.tipo === 'sucesso' ? 'success' : 'danger'}>
              {mensagem.texto}
            </Alert>
          )}
          <div className='form-group'>
            <label>Nome: </label><br />
            <input type='text' className='form-control' name="nomeCurso" onChange={handleChange}
              value={cursoSelecionado && cursoSelecionado.nomeCurso}></input><br />

            <label>Descrição: </label>
            <input type='text' className='form-control' name='descricao' onChange={handleChange}
              value={cursoSelecionado && cursoSelecionado.descricao}></input><br />
          </div>
        </ModalBody>
        <ModalFooter>
          <button className='btn btn-primary' onClick={pedidoPut}> Editar</button>
          <button className='btn btn-danger' onClick={abrirFecharModalEditar}> Cancelar</button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modalExcluir}>
        <ModalBody>
          Confirma a exclusão do Curso: {cursoSelecionado && cursoSelecionado.nomeCurso}?
        </ModalBody>

        <ModalFooter>
          <button className='btn btn-danger' onClick={pedidoDelete}>Sim</button>
          <button className='btn btn-secondary' onClick={abrirFecharModalExcluir}>Não</button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modalAlunos}>
        <ModalHeader>Alunos do Curso: {cursoSelecionado && cursoSelecionado.nomeCurso}</ModalHeader>
        <ModalBody>
          <table className='table table-bordered'>
            <thead>
              <tr>
                <th>Nome do Aluno</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {alunosDoCurso.map(matricula => (
                <tr key={matricula.aluno.alunoId}>
                  <td>{matricula.aluno.nomeAluno}</td>
                  <td>{matricula.aluno.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <button className='btn btn-secondary' onClick={abrirFecharModalAlunos}>Fechar</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default Curso;