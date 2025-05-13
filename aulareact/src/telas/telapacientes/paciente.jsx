import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./paciente.css";

function Paciente() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/", { replace: true });
    }

    const fetchPacientes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/pacientes/geral"
        );
        if (response.data.success) {
          setPacientes(response.data.pacientes);
        } else {
          console.error("Erro ao carregar pacientes:", response.data.message);
        }
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
      }
    };

    fetchPacientes();
  }, [navigate]);

  const filtrarPacientes = () => {
    return pacientes
      .filter((paciente) => {
        const nomeFiltro = filtroNome.toLowerCase();
        return paciente.nome.toLowerCase().includes(nomeFiltro);
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  };

  const excluirPaciente = async (pacienteId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/pacientes/${pacienteId}`
      );
      if (response.data.success) {
        alert("Paciente excluído com sucesso!");
        setPacientes(
          pacientes.filter((paciente) => paciente.id !== pacienteId)
        );
      } else {
        alert("Erro ao excluir paciente: " + response.data.message);
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente!");
      console.error("Erro ao excluir paciente", error);
    }
  };

  const editarPaciente = (paciente) => {
    navigate("/editar-paciente", { state: { paciente } });
  };

  const cadastrarPaciente = () => {
    navigate("/cadastro");
  };

  return (
    <div className="paciente-container">
      <header className="pacienteheader">
        <nav className="pacientenav">
          <button
            className="nav-buttonpaciente"
            onClick={() => navigate("/home")}
          >
            Home
          </button>
          <button
            className="nav-buttonpaciente"
            onClick={() => navigate("/consultas")}
          >
            Consultas
          </button>
          <button
            className="nav-buttonpaciente"
            onClick={() => navigate("/pacientes")}
          >
            Pacientes
          </button>
          <button
            className="nav-buttonpaciente"
            onClick={() => navigate("/perfil")}
          >
            Perfil
          </button>
        </nav>
      </header>

      <div className="main-contentpaciente">
        <h2>Pacientes</h2>

        <div className="filterspaciente">
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="filter-inputpaciente"
            placeholder="Pesquisar por nome"
          />
            <button className="btncadastrarr" onClick={cadastrarPaciente}>
              Cadastrar Paciente
            </button>
        </div>

        <div className="paciente-list">
          {filtrarPacientes().map((paciente) => {
            return (
              <div key={paciente.id} className="paciente-item">
                <div className="paciente-info">
                  <p>
                    <strong>Nome:</strong> {paciente.nome}
                  </p>
                  <p>
                    <strong>Data de Nascimento:</strong>{" "}
                    {paciente.dataNascimento}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {paciente.telefone}
                  </p>
                </div>
                <div className="action-buttonspaciente">
                  <button
                    className="action-buttonpaciente excluir"
                    onClick={() => excluirPaciente(paciente.id)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                  <button
                    className="action-buttonpaciente editar"
                    onClick={() => editarPaciente(paciente)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Paciente;
