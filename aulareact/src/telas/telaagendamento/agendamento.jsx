import React, { useState } from 'react';
import axios from 'axios';
import './agendamento.css';
import { useNavigate } from 'react-router-dom';

function Agendamento() {
  const navigate = useNavigate('');
  const [paciente, setPaciente] = useState('');
  const [doutor, setDoutor] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pacientesList, setPacientesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const gerarHorarios = () => {
    const horarios = [];
    let horaAtual = 6;

    while (horaAtual < 22) {
      horarios.push(`${horaAtual.toString().padStart(2, '0')}:00`);
      horarios.push(`${horaAtual.toString().padStart(2, '0')}:30`);
      horaAtual++;
    }
    return horarios;
  };

  const buscarPacientes = async (nome) => {
    if (nome.length >= 2) {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/pacientes/buscar', {
          params: { nome }
        });
        setPacientesList(response.data.success ? response.data.pacientes : []);
      } catch (error) {
        setErrorMessage('Erro ao buscar pacientes');
      } finally {
        setIsLoading(false);
      }
    } else {
      setPacientesList([]);
    }
  };

  const handlePacienteChange = (e) => {
    setPaciente(e.target.value);
    buscarPacientes(e.target.value);
    setSelectedIndex(-1);
  };

  const selecionarPaciente = (nome) => {
    setPaciente(nome);
    setPacientesList([]);
  };

  const handleKeyDown = (e) => {
    if (pacientesList.length === 0) return;

    if (e.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, pacientesList.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex !== -1) {
      selecionarPaciente(pacientesList[selectedIndex].nome);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataHora = `${data}T${hora}:00`;
    const consulta = { paciente, doutor, tipoConsulta, dataHora };

    try {
      const response = await axios.post('http://localhost:5000/agendar', consulta);
      if (response.data.success) {
        setMessage('Consulta agendada com sucesso!');
        setErrorMessage('');
        setPaciente('');
        setDoutor('');
        setTipoConsulta('');
        setData('');
        setHora('');
      } else {
        setErrorMessage(response.data.message);
        setMessage('');
      }
    } catch (error) {
      setErrorMessage('Erro de conexão. Tente novamente!');
      setMessage('');
    }
  };

  const handleVoltar = () => {
    navigate("/consultas")
  }

  return (
    <div className="agendamento-container">
      <i className="fas fa-arrow-left" onClick={handleVoltar}></i>
      <h1>Agendar Consulta</h1>
      <form className="agendamento-form" onSubmit={handleSubmit}>
        <div>
          <label>Paciente:</label>
          <input
            type="text"
            value={paciente}
            onChange={handlePacienteChange}
            onKeyDown={handleKeyDown}
            required
            placeholder="Digite o nome do paciente"
          />
          {pacientesList.length > 0 && (
            <div className="suggestions">
              {pacientesList.map((pacienteItem, index) => (
                <div
                  key={index}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => selecionarPaciente(pacienteItem.nome)}
                >
                  {pacienteItem.nome}
                </div>
              ))}
            </div>
          )}
          {isLoading && <div className="loading">Carregando...</div>}
        </div>
        <div>
          <label>Doutor:</label>
          <input
            type="text"
            value={doutor}
            onChange={(e) => setDoutor(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Tipo de Consulta:</label>
          <input
            type="text"
            value={tipoConsulta}
            onChange={(e) => setTipoConsulta(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Data:</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Hora:</label>
          <select
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="selectagendamento"
            required
          >
            <option value="" className="optionagendamento">Escolha um horário</option>
            {gerarHorarios().map((horario, index) => (
              <option key={index} value={horario}>{horario}</option>
            ))}
          </select>
        </div>
        <button type="submit">Agendar</button>
        {message && <div className="message">{message}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </form>
    </div>
  );
}

export default Agendamento;
