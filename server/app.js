var express = require('express'),
    fs = require('fs'),
    _ = require('underscore'),
    app = express();

var db = {
  jogadores: JSON.parse(fs.readFileSync(__dirname + '/data/jogadores.json')),
  jogosPorJogador: JSON.parse(fs.readFileSync(__dirname + '/data/jogosPorJogador.json'))
};

app.set('port', process.env.PORT || 3000);
app.set('views', 'server/views');
app.set('view engine', 'hbs');

app.get('/', function(req, res) {
  res.render('index', db.jogadores);
});

app.get('/jogador/:id/', function(req, res) {
  var perfil = _.find(db.jogadores.players, function(el) { return el.steamid === req.params.id; });
  var jogos = db.jogosPorJogador[req.params.id];

  // calcula o número jogos que nunca foram abertos
  jogos.not_played_count = _.where(jogos.games, { playtime_forever: 0 }).length;

  // ordena por ordem decrescente de tempo de jogo (playtime_forever)
  jogos.games = _.sortBy(jogos.games, function(el) {
    return -el.playtime_forever;
  });

  // mantém apenas os 5 primeiros
  jogos.games = _.head(jogos.games, 5);

  // calcula tempo de jogo em horas, em vez de minutos
  jogos.games = _.map(jogos.games, function(el) {
    el.playtime_forever_h = Math.round(el.playtime_forever/60);
    return el;
  });

  res.render('jogador', {
    profile: perfil,
    gameInfo: jogos,
    favorite: jogos.games[0]
  });
});

app.use(express.static('client'));

var server = app.listen(app.get('port'), function () {
  console.log('Servidor aberto em http://localhost:' + server.address().port);
});
