import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const porta = 3000;
const host ='0.0.0.0';
const app = express();

var usuarios = [];
var mensagens = [];

app.use(express.static(path.join(process.cwd(), 'páginas')));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
  secret: "Ch4v3",
  resave: true,
  saveUninitialized: true,
  cookie: {
      maxAge: 1000 * 60 * 30
  }
}))

app.get('/',autenticacao, (requisicao, resposta) => {
  const ultimoacesso = requisicao.cookies.ultimoacesso;
  const data = new Date();
  resposta.cookie("ultimoacesso", data.toLocaleString(),{
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true
});

  resposta.end(`
              <!DOCTYPE html>
              <html lang="pt-br">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Menu de escolha</title>
                  <style>
                      * {
                          font-family: Verdana;
                      }
                      .container {
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          flex-direction: column;
                          width: 350px;
                          height: 350px;
                          border: 1px solid black;
                          position: absolute;
                          top: 50%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                          border-radius: 5px;
                          border-color: royalblue;
                      }
                      .a {
                          text-decoration: none;
                          background-color: royalblue;
                          color: white;
                          border-radius: 5px;
                          padding: 10px;
                      }
                      h1{
                          color: royalblue;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <h1>Menu</h1><br>
                      <a class= "a" href="/cadastro.html">Cadastrar Usuário</a></br>
                      <a class= "a" href="/mensagem">Bate-Papo</a>
                      <p style="color: royalblue">Último acesso: ${ultimoacesso}</p>
                  </div>
              </body>
              </html>       
  `);
})

function autenticacao(requisicao, resposta, next){
  if(requisicao.session.usuarioLogado){
      next();
  }
  else{
      resposta.redirect('/login.html');
  }
}

app.post('/login', (requisicao, resposta) => {
  const usuario = requisicao.body.username;
  const senha = requisicao.body.senha;

  if(usuario &&  senha && (usuario == "admin") && (senha == "admin")){
     requisicao.session.usuarioLogado = true;
     resposta.redirect('/');
  }
  else{
     resposta.end(
         `<!DOCTYPE html>
         <html lang="pt-br">
         <head>
             <meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0">
             <title>Erro</title>
         </head>
         <body>
             <h1 style="color: red; text-align: center; font-family: Verdana">Usuário ou senha inválidos</h1>
             </br>
             <div style="text-align: center">
                 <a style="font-family: Verdana; text-decoration: none; color: royalblue" href="/login.html">Voltar</a>
             </div>
         </body>
         </html>
     `);
  }
})

function listausuarios(requisicao, resposta){

  let contresposta = '';

  if(!(requisicao.body.name && requisicao.body.datanasc && requisicao.body.username)){

      contresposta = `
                  <!DOCTYPE html>
                  <html lang="pt-br">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Cadastro de usuário</title>
                    <style>
                    *{
                      font-family: Verdana, Geneva, Tahoma, sans-serif;
                    }
                    .container{
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                    }
                    .btn{
                      background-color: royalblue;
                      padding: 5px;
                      width: 100px;
                      position: absolute;
                      left: 50%;
                      transform: translateX(-50%);
                      color: white;
                      border-radius: 5px;
                      padding: 10px;
                      border-color: royalblue;
                    }
                    label{
                      color: royalblue;
                    }
                    input{
                      padding: 5px;
                      margin-top:10px;
                    }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <form action="/cadastro" method="POST">
                            <label for="name">Nome:</label><br>
                            <input type="text" name="name" value="${requisicao.body.name}"></br>
                            `;

      if(!requisicao.body.name){
          contresposta+=`
                      <div>
                          <p style="color: red">O campo nome deve ser preenchido</p>
                      </div>`;
      }

      contresposta+=`
                            <label for="datanasc">Data de Nascimento:</label></br>
                            <input type="date" name="datanasc" value="${requisicao.body.datanasc}"></br>
                            `;

      if(!requisicao.body.datanasc){
          contresposta+=`
                      <div>
                        <p style="color: red">O campo data deve ser preenchido</p>
                      </div>`;
      }

      contresposta+=`
                  <label for="username">Username:</label></br>
                  <input type="text" name="username" value="${requisicao.body.username}"></br>
      `;

      if(!requisicao.body.username){
          contresposta+=`
                      <div>
                          <p style="color: red">O campo username deve ser preenchido</p>
                      </div>`;
      }

      contresposta+=`
                        <button class="btn" type="submit">Cadastrar</button>
                      </form>
                      </div>
                      </body>
                      </html>`;

      resposta.end(contresposta);
  }
  else{
      const usuario = {
          name: requisicao.body.name,
          datanasc: requisicao.body.datanasc,
          username: requisicao.body.username
      }
      usuarios.push(usuario);

      contresposta =`
                  <!DOCTYPE html>
                  <html lang="pt-br">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Lista de usuários</title> 
                      <style>
                      *{
                        font-family: Verdana, Geneva, Tahoma, sans-serif;
                      }
                        table{
                          border-collapse: collapse;
                          width: 50%;
                          margin: auto;
                          margin-top: 20px;
                        }
                        th, td{
                          border: 1px solid royalblue;
                          padding: 10px;
                          text-align: left;
                        }
                        th{
                          background-color: royalblue;
                          color: white;
                        }
                      </style>
                  </head>
                  <body>
                  <h1 style="text-align: center; font-family: Verdana; color: royalblue">Lista de usuários</h1>
                  <table class="table">
                      <thead>
                          <tr>
                          <th scope="col">Nome</th>
                          <th scope="col">Data de Nascimento</th>
                          <th scope="col">Username</th>
                          </tr>
                      </thead>
                      <tbody>                      
      `;
      for(const usuario of usuarios)
      {
          contresposta += `
              <tr>    
                  <td>${usuario.name}</td>
                  <td>${usuario.datanasc}</td>
                  <td>${usuario.username}</td>
              </tr>
          `
      }
      contresposta += `
                      </tbody>
                  </table>
                  </br>
                  <a style="position: absolute; left: 50%; transform: translateX(-50%); text-align: center; font-family: Verdana; color: white; text-decoration: none; background-color: royalblue; border-radius: 5px; padding: 10px; border-color: royalblue;" href="/" role="button">Voltar ao menu</a></br></br></br>
                  <a style="position: absolute; left: 50%; transform: translateX(-50%); text-align: center; font-family: Verdana; color: white; text-decoration: none; background-color: royalblue; border-radius: 5px; padding: 10px; border-color: royalblue;"  href="/cadastro.html" role="button">Cadastrar</a>
                  </body>
                  </html>`;

      resposta.send(contresposta);
  }
              
}

app.post('/cadastro',autenticacao, listausuarios);

app.listen(porta, host, () => {
  console.log(`Servidor rodando na url http://${host}:${porta}`);
});