import "./login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import fundoImage from "../../imagens-logos/fundo.jpg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post("http://localhost:5000/login", {
        usuario,
        senha,
      });
  
      if (response.data.success) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("token", response.data.token);   
        console.log("Login bem-sucedido!");
        navigate("/home", { replace: true });
      } else {
        console.log("Usuário ou Senha inválidos!");
      }
    } catch (error) {
      console.log("Erro Ao Tentar Realizar O Login!");
    }
  
    setLoading(false);
  };

  return (
    <div className="Container">
      <img src={fundoImage} alt="Imagem de fundo" className="imagefundologin" />
      <h1 className="titulo">CLÍNICA MUPI</h1>
      <div className="InputContainer">
        <p className="pUsuario">Usuário</p>
        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="input1"
          required
        />
        <p className="pSenha">Senha</p>
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input2"
          required
        />
        <button
          className="buttonacessar"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Carregando..." : "Acessar"}
        </button>
      </div>
    </div>
  );
}

export default Login;
