import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css";

function Home() {
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState([]);
  const [filtroHora, setFiltroHora] = useState("");
  const [filtroNome, setFiltroNome] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    }

    const fetchConsultas = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("Token não encontrado");
          return;
        }
    
        const response = await axios.get("http://localhost:5000/consultas", {
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

  const filtrarConsultas = () => {
    return consultas
      .filter((consulta) => {
        const nomeFiltro = filtroNome.toLowerCase();
        const horaFiltro = filtroHora.toLowerCase();

        const horaConsulta = new Date(consulta.dataHora).toLocaleTimeString(
          "pt-BR",
          { hour: "2-digit", minute: "2-digit" }
        );

        return (
          (consulta.paciente.toLowerCase().includes(nomeFiltro) ||
            consulta.doutor.toLowerCase().includes(nomeFiltro)) &&
          horaConsulta.includes(horaFiltro)
        );
      })
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
  };

  const formatarDataHora = (dataHora) => {
    const data = new Date(dataHora);
    const dia = data.toLocaleDateString("pt-BR");
    const hora = data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { dia, hora };
  };

  const excluirConsulta = async (consultaId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta consulta?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/consultas/${consultaId}`
      );

      if (response.data.success) {
        alert("Consulta excluída com sucesso!");
        setConsultas((prevConsultas) =>
          prevConsultas.filter((consulta) => consulta.id !== consultaId)
        );
      } else {
        alert("Erro ao excluir consulta: " + response.data.message);
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente!");
      console.error("Erro ao excluir consulta", error);
    }
  };

  const editarConsulta = (consulta) => {
    navigate("/editar-consulta", { state: { consulta } });
  };

  return (
    <div className="containerhome">
      <header className="headerhome">
        <nav className="navhome">
          <button className="nav-buttonhome" onClick={() => navigate("/home")}>
            Home
          </button>
          <button
            className="nav-buttonhome"
            onClick={() => navigate("/consultas")}
          >
            Consultas
          </button>
          <button
            className="nav-buttonhome"
            onClick={() => navigate("/pacientes")}
          >
            Pacientes
          </button>
          <button
            className="nav-buttonhome"
            onClick={() => navigate("/perfil")}
          >
            Perfil
          </button>
        </nav>
      </header>

      <div className="main-contenthome">
        <h2>Consultas do Dia</h2>

        <div className="filtershome">
          <input
            type="time"
            value={filtroHora}
            onChange={(e) => setFiltroHora(e.target.value)}
            className="filter-inputhome"
            placeholder="Filtrar por horário"
          />
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="filter-inputhome"
            placeholder="Pesquisar por nome"
          />
        </div>

        <div className="consulta-listhome">
          {filtrarConsultas().map((consulta) => {
            const { dia, hora } = formatarDataHora(consulta.dataHora);
            return (
              <div key={consulta.id} className="consulta-itemhome">
                <div className="consulta-infohome">
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
                <div className="action-buttonshome">
                  <button
                    className="action-buttonhome excluir"
                    onClick={() => excluirConsulta(consulta.id)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                  <button
                    className="action-buttonhome editar"
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

export default Home;
