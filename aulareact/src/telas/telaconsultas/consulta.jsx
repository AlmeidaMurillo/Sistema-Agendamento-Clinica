import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./consulta.css";

function Consulta() {
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroHora, setFiltroHora] = useState("");

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/", { replace: true });
    }

    const fetchConsultas = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("Token não encontrado");
          return;
        }
    
        const response = await axios.get("http://localhost:5000/consultas/geral", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (response.data.success) {
          setConsultas(response.data.consultas);
        } else {
          console.error("Erro ao carregar consultas:", response.data.message);
        }
      } catch (error) {
        console.error("Erro ao buscar consultas:", error);
      }
    };

    fetchConsultas();
  }, [navigate]);

  const formatarDataHora = (dataHora) => {
    const data = new Date(dataHora);
    const dia = data.toLocaleDateString("pt-BR");
    const hora = data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { dia, hora };
  };

  const filtrarConsultas = () => {
    return consultas
      .filter((consulta) => {
        const nomeFiltro = filtroNome.toLowerCase();
        const dataFiltro = filtroData.toLowerCase();
        const horaFiltro = filtroHora.toLowerCase();

        return (
          (consulta.paciente.toLowerCase().includes(nomeFiltro) ||
            consulta.doutor.toLowerCase().includes(nomeFiltro)) &&
          consulta.dataHora.toLowerCase().includes(dataFiltro) &&
          consulta.dataHora.toLowerCase().includes(horaFiltro)
        );
      })
      .sort((a, b) => {
        const dataA = new Date(a.dataHora);
        const dataB = new Date(b.dataHora);
        return dataA - dataB; 
      });
  };

  const excluirConsulta = async (consultaId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/consultas/${consultaId}`
      );
      if (response.data.success) {
        alert("Consulta excluída com sucesso!");
        setConsultas(
          consultas.filter((consulta) => consulta.id !== consultaId)
        );
      } else {
        alert("Erro ao excluir consulta: " + response.data.message);
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente!");
      console.error("Erro ao excluir consulta", error);
    }
  };

  const handleAgendarConsulta = () => {
    navigate("/agendamento");
  };

  const editarConsulta = (consulta) => {
    navigate("/editar-consulta", { state: { consulta } });
  };

  return (
    <div className="consulta-container">
      <header className="consultaheader">
        <nav className="consultanav">
          <button
            className="nav-buttonconsulta"
            onClick={() => navigate("/home")}
          >
            Home
          </button>
          <button
            className="nav-buttonconsulta"
            onClick={() => navigate("/consultas")}
          >
            Consultas
          </button>
          <button
            className="nav-buttonconsulta"
            onClick={() => navigate("/pacientes")}
          >
            Pacientes
          </button>
          <button
            className="nav-buttonconsulta"
            onClick={() => navigate("/perfil")}
          >
            Perfil
          </button>
        </nav>
      </header>

      <div className="main-contentconsulta">
        <h2>Consultas Gerais</h2>

        <div className="filtersconsulta">
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="filter-inputconsulta"
            placeholder="Pesquisar por nome"
          />
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="filter-inputconsulta"
            placeholder="Filtrar por data"
          />
          <input
            type="time"
            value={filtroHora}
            onChange={(e) => setFiltroHora(e.target.value)}
            className="filter-inputconsulta"
            placeholder="Filtrar por hora"
          />
          <button
            className="agendar-buttonconsulta"
            onClick={handleAgendarConsulta}
          >
            Agendar Consulta
          </button>
        </div>

        <div className="consulta-list">
          {filtrarConsultas().map((consulta) => {
            const { dia, hora } = formatarDataHora(consulta.dataHora);
            return (
              <div key={consulta.id} className="consulta-item">
                <div className="consulta-info">
                  <p>
                    <strong>Paciente:</strong> {consulta.paciente}
                  </p>
                  <p>
                    <strong>Doutor:</strong> {consulta.doutor}
                  </p>
                  <p>
                    <strong>Data:</strong> {dia}
                  </p>
                  <p>
                    <strong>Hora:</strong> {hora}
                  </p>
                </div>
                <div className="action-buttonsconsulta">
                  <button
                    className="action-buttonconsulta excluir"
                    onClick={() => excluirConsulta(consulta.id)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                  <button
                    className="action-buttonconsulta editar"
                    onClick={() => editarConsulta(consulta)}
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

export default Consulta;
