const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./db.sqlite");

db.run(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    usuario TEXT UNIQUE,
    senha TEXT,
    isAdmin INTEGER
  )
`,
  (err) => {
    if (err) {
      console.error("Erro ao criar tabela de usuários:", err);
      return;
    }
    console.log("Tabela users criada ou já existe.");

    db.get("SELECT * FROM users WHERE usuario = ?", ["admin"], (err, row) => {
      if (err) {
        console.error("Erro ao verificar usuário existente", err);
        return;
      }
      if (row) {
        console.log("Nome de usuário já existe.");
      } else {
        const nome = "Admin Master";
        const usuario = "admin";
        const senha = "admin123";
        bcrypt.hash(senha, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Erro ao criptografar senha", err);
            return;
          }

          db.run(
            "INSERT INTO users (nome, usuario, senha, isAdmin) VALUES (?, ?, ?, ?)",
            [nome, usuario, hashedPassword, 1],
            function (err) {
              if (err) {
                console.error("Erro ao criar usuário admin", err);
              } else {
                console.log("Usuário admin criado com sucesso");
              }
              db.close();
            }
          );
        });
      }
    });
  }
);

db.run(`
  CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente TEXT,
    doutor TEXT,
    tipoConsulta TEXT,
    dataHora TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    dataNascimento TEXT,
    telefone TEXT
  )
`);

app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  db.get("SELECT * FROM users WHERE usuario = ?", [usuario], (err, row) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro no banco de dados" });
    }
    if (!row) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não encontrado" });
    }

    bcrypt.compare(senha, row.senha, (err, result) => {
      if (err || !result) {
        return res
          .status(401)
          .json({ success: false, message: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: row.id, usuario: row.usuario, isAdmin: row.isAdmin },
        "seu-segredo",
        { expiresIn: "1h" }
      );

      res.json({ success: true, message: "Login bem-sucedido", token });
    });
  });
});

app.post("/create-account", (req, res) => {
  const { nome, usuario, senha, isAdmin } = req.body;

  if (isAdmin !== true) {
    return res.status(403).json({
      success: false,
      message: "Apenas administradores podem criar contas",
    });
  }

  bcrypt.hash(senha, 10, (err, hashedPassword) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao criar senha" });
    }

    db.run(
      "INSERT INTO users (nome, usuario, senha, isAdmin) VALUES (?, ?, ?, ?)",
      [nome, usuario, hashedPassword, isAdmin ? 1 : 0],
      function (err) {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Erro ao criar conta" });
        }
        res
          .status(201)
          .json({ success: true, message: "Conta criada com sucesso" });
      }
    );
  });
});

app.post("/agendar", (req, res) => {
  const { paciente, doutor, tipoConsulta, dataHora } = req.body;

  if (!paciente || !doutor || !tipoConsulta || !dataHora) {
    return res
      .status(400)
      .json({ success: false, message: "Todos os campos são obrigatórios" });
  }
  const sqlCheck = "SELECT * FROM consultas WHERE doutor = ? AND dataHora = ?";
  db.get(sqlCheck, [doutor, dataHora], (err, row) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao verificar horário" });
    }

    if (row) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Esse doutor já tem uma consulta marcada nesse horário.",
        });
    }

    const sql =
      "INSERT INTO consultas (paciente, doutor, tipoConsulta, dataHora) VALUES (?, ?, ?, ?)";
    db.run(sql, [paciente, doutor, tipoConsulta, dataHora], function (err) {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ success: false, message: "Erro ao agendar consulta" });
      }

      res.status(201).json({
        success: true,
        message: "Consulta agendada com sucesso!",
        consultaId: this.lastID,
      });
    });
  });
});

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "Token necessário" });
  }

  jwt.verify(token, "seu-segredo", (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Token inválido" });
    }

    req.user = decoded;
    next();
  });
};

app.get("/consultas", verifyToken, (req, res) => {
  const dataHoje = new Date().toISOString().split("T")[0];

  const sql = `SELECT * FROM consultas WHERE dataHora LIKE ?`;
  db.all(sql, [`${dataHoje}%`], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao recuperar as consultas" });
    }
    res.json({ success: true, consultas: rows });
  });
});

app.get("/consultas/geral", verifyToken, (req, res) => {
  const dataHoraAtual = new Date().toISOString();

  const sql = `SELECT * FROM consultas WHERE dataHora >= ? ORDER BY dataHora ASC`;

  db.all(sql, [dataHoraAtual], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao recuperar as consultas" });
    }
    res.json({ success: true, consultas: rows });
  });
});

app.delete("/consultas/:id", (req, res) => {
  const consultaId = req.params.id;

  const sql = "DELETE FROM consultas WHERE id = ?";

  db.run(sql, [consultaId], function (err) {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .json({ success: false, message: "Erro ao excluir consulta" });
    }

    if (this.changes === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Consulta não encontrada" });
    }

    res.json({ success: true, message: "Consulta excluída com sucesso" });
  });
});

app.post("/pacientes", (req, res) => {
  const { nome, dataNascimento, telefone } = req.body;

  if (!nome || !dataNascimento || !telefone) {
    return res
      .status(400)
      .json({ success: false, message: "Todos os campos são obrigatórios" });
  }

  const sql =
    "INSERT INTO pacientes (nome, dataNascimento, telefone) VALUES (?, ?, ?)";
  db.run(sql, [nome, dataNascimento, telefone], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao cadastrar paciente" });
    }
    res.status(201).json({
      success: true,
      message: "Paciente cadastrado com sucesso!",
      pacienteId: this.lastID,
    });
  });
});

app.get("/pacientes/geral", (req, res) => {
  const sql = "SELECT * FROM pacientes ORDER BY nome ASC";

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao carregar pacientes" });
    }
    res.json({ success: true, pacientes: rows });
  });
});

app.delete("/pacientes/:id", (req, res) => {
  const pacienteId = req.params.id;

  const deleteConsultasSql =
    "DELETE FROM consultas WHERE paciente = (SELECT nome FROM pacientes WHERE id = ?)";
  db.run(deleteConsultasSql, [pacienteId], function (err) {
    if (err) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Erro ao remover consultas do paciente",
        });
    }

    const sql = "DELETE FROM pacientes WHERE id = ?";
    db.run(sql, [pacienteId], function (err) {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Erro ao excluir paciente" });
      }

      if (this.changes === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Paciente não encontrado" });
      }

      res.json({
        success: true,
        message: "Paciente e suas consultas excluídos com sucesso",
      });
    });
  });
});

app.get("/pacientes/buscar", (req, res) => {
  const nome = req.query.nome;

  if (!nome) {
    return res
      .status(400)
      .json({ success: false, message: "Nome é obrigatório" });
  }

  const sql = "SELECT * FROM pacientes WHERE nome LIKE ? ORDER BY nome ASC";
  db.all(sql, [`${nome}%`], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao buscar pacientes" });
    }
    res.json({ success: true, pacientes: rows });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
