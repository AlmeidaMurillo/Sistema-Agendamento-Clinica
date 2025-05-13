import { useNavigate } from "react-router-dom";
import "./perfil.css";

function Perfil() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear(); 
    localStorage.clear();
    


    setTimeout(() => {
      window.location.replace("http://localhost:3000/"); 
    }, 1000); 
  };

  return (
    <div className="containerperfil">
      <header className="headerperfil">
        <nav className="navperfil">
          <button className="nav-buttonperfil" onClick={() => navigate("/home")}>
            Home
          </button>
          <button className="nav-buttonperfil" onClick={() => navigate("/consultas")}>
            Consultas
          </button>
          <button className="nav-buttonperfil" onClick={() => navigate("/pacientes")}>
            Pacientes
          </button>
          <button className="nav-buttonperfil" onClick={() => navigate("/perfil")}>
            Perfil
          </button>
        </nav>
      </header>

      <div className="main-contentperfil">
        <h2>Perfil</h2>
      </div>

      <div className="caixainformacoesperfil">
        <div className="perfil-header">
          <img
            src="https://www.w3schools.com/w3images/avatar2.png"
            alt="img"
            className="perfil-imagem"
          />
          <div className="perfil-nome">
            <h2>Admin Master</h2>
          </div>
          <button className="buttondesconectar" onClick={handleLogout}>
            Desconectar
          </button>
        </div>
        <div className="perfil-detalhes">
          <h2>Informações</h2>
          <p>
            <strong>Nome:</strong> Murillo Almeida
          </p>
          <p>
            <strong>Função:</strong> Recepcionista
          </p>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
