function EloToProbability(Elo) {
  var proba = 1.0 / (1.0 + Math.pow(10, -Elo/400))
  return proba
}

function PredictGameResult() {
  var sheet = SpreadsheetApp.getActive().getSheetByName("AOE4")
  var data = sheet.getRange("O:P").getValues()
  var EloTeamA = 0.0, EloTeamB = 0.0

  for(var i = 1; i < data.length; i++) {
    var elo = parseFloat(data[i][0])
    var team = data[i][1]
    Logger.log('Team ' + team + ' : ' + elo)
    if(team == 1) {
      EloTeamA+=elo
    }
    else if(team == 2) {
      EloTeamB+=elo
    }
    else {
      break;
    }
  }
  var ProbaTeamAWin = Math.round(100.0 * EloToProbability(EloTeamA - EloTeamB)) + '%'
  Logger.log('ProbaTeamAWin ' + ProbaTeamAWin)
  sheet.getRange('Q2').getCell(1,1).setValue(ProbaTeamAWin)
}

function updateElo() {
  var sheet = SpreadsheetApp.getActive().getSheetByName("AOE4")
  var data = sheet.getRange("B:L").getValues()
  var K = parseFloat(sheet.getRange('Q9').getValue())
  Logger.log('K=' + K)
  var playerNames = data[1]
  var Players = []

  playerNames.pop()
  for(var i = 0; i < playerNames.length; i++) {
    Players[i] = {
      name: playerNames[i],
      elo: data[2][i]
    }
  }
  
  for (var i = 2; i < data.length; i++) {
    var EloTeamA = 0.0
    var EloTeamB = 0.0
    var NbPlayersTeamA = 0, NbPlayersTeamB = 0 
    var Row = data[i]
    var NbCol = data[i].length
    for (var j = 0; j < NbCol - 1; j++) {
      if (Row[j] == 1) {
        EloTeamA += Players[j].elo
        NbPlayersTeamA += 1
      } 
      else if (Row[j] == 2) {
        EloTeamB += Players[j].elo
        NbPlayersTeamB += 1
      }
    }
    var Winner = parseInt(Row[NbCol - 1])
    var Result = 0.5 
    if (Winner == 1) 
      Result = 1
    else if(Winner = 2)
      Result = 0
    else 
      break
      

    var Error = Result - EloToProbability(EloTeamA - EloTeamB)

    for (var j = 0; j < NbCol - 1; j++) {
      if (Row[j] == 1) {
        Players[j].elo += K * (NbPlayersTeamA + NbPlayersTeamB) * Error / NbPlayersTeamA
      } 
      else if (Row[j] == 2) {
        Players[j].elo += -K * (NbPlayersTeamA + NbPlayersTeamB) * Error / NbPlayersTeamB
      }
    }
  }

  Players.sort((playerA, playerB) => {
    return playerB.elo - playerA.elo
  })
  var output = sheet.getRange("N:O")
  for (var i = 0; i < Players.length; i++) {
    output.getCell(i + 2, 1).setValue(Players[i].name)
    output.getCell(i + 2, 2).setValue(Math.round(Players[i].elo))
  }
  Logger.log("finished!")

}














