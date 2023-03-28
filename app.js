const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (req, res) => {
  query = `select * from cricket_team;`;
  const players = await db.all(query);
  res.send(players);
});

app.post("/players/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  query = `insert into cricket_team(player_name,jersey_number,role) values(
           '${playerName}',
           '${jerseyNumber}',
           '${role}'
           );`;
  const update = await db.run(query);
  const playerId = update.lastID;
  res.send("Player Added to Team");
});

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  query = `select * from cricket_team where player_id=${playerId};`;
  const player = await db.get(query);
  res.send(player);
});

app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  query = `delete  from cricket_team where player_id=${playerId};`;
  const player = await db.run(query);
  res.send("Player Removed");
});

module.exports = app;
