import request from "supertest";

export async function loginAdmin(app) {
  const resposta = await request(app).post("/api/auth/login").send({
    email: process.env.ADMIN_EMAIL,
    senha: process.env.ADMIN_SENHA,
  });

  return resposta.body.token;
}

export async function loginAluno(app, email, senha) {
  const resposta = await request(app).post("/api/auth/login").send({
    email,
    senha,
  });

  return resposta.body.token;
}
