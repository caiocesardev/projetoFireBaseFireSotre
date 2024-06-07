const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore')
const serviceAccount = require('./projetofirebase-b4969-firebase-adminsdk-2xrbr-cf514f3de2.json')

initializeApp({
    credential: cert(serviceAccount)
})
  
  const db = getFirestore()
  
  app.engine('handlebars',handlebars({defaultLayout: 'main'}))
  app.set('view engine','handlebars')

  app.use(bodyParser.urlencoded({extended:false}))
  app.use(bodyParser.json())

  app.get('/',function(req,res){
    res.render('primeira_pagina')
   })

   app.get("/consulta", async function (req, res) {
    try {
        var result = await db.collection('pessoas').get();
        if(result.empty) {
            console.error("Não retornou dados");
            res.status(404).send("Não retornou dados");
            return;
        }
 
        var documents = [];
        result.forEach((doc) => {
            documents.push({
                id: doc.id,
                telefone: doc.get("telefone"),
                observacao: doc.get("observacao"),
                origem: doc.get("origem"),
                nome: doc.get("nome"),
                data_contato: doc.get("data_contato")
            });
        });
        console.log(documents);
        res.render("consulta", {documents});
    } catch(error) {
        console.error();
        res.status(500).send("Não retornou dados");
    }
   
})

app.get("/excluir/:id", async function (req, res) {
    var result = await db.collection('pessoas').doc(req.params.id).delete().then(function() {
        console.log('Deleted document');
        res.redirect('/consulta');
    })
})

   app.post('/cadastrar', function (req, res) {
    var pessoas = db.collection('pessoas').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Pessoa cadastrada com sucesso!')
        res.redirect('/')
    })
})

app.get('/editar/:id', async function (req, res) {
    try {
        const docRef = db.collection('pessoas').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.log("Documento não encontrado");
            return res.status(404).send("Documento não encontrado");
        }

        res.render("editar", { id: req.params.id, pessoa: doc.data() });
    } catch (error) {
        console.error("Erro ao buscar documento: ", error);
        res.status(500).send("Erro ao buscar documento");
    }
});

app.post('/atualizar',async(req,res)=>{
    try{
      const docId = req.body.id;
      const docRef = db.collection('pessoas').doc(docId);
      await docRef.update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
      })
      res.redirect('/consulta')
    }catch{
      console.log("erro ao atualizar")
    }});



 app.listen(8083,function(){
    console.log('Servidor ativo!!!')
 })