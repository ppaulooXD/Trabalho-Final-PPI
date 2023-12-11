import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const porta = 3000;
const host ='0.0.0.0';
const app = express();

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
                      <a class= "a" href="/batepapo.html">Bate-Papo</a>
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


app.listen(porta, host, () => {
  console.log(`Servidor rodando na url http://${host}:${porta}`);
});