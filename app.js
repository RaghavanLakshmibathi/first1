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

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (req, res) => {
  query = `select * from cricket_team;`;
  const players = await db.all(query);
  res.send(
    players.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
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
  res.send(convertDbObjectToResponseObject(player));
});

app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  query = `delete  from cricket_team where player_id=${playerId};`;
  const player = await db.run(query);
  res.send("Player Removed");
});

app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const { playerName, jerseyNumber, role } = req.body;
  query = `update cricket_team set player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}' where player_id=${playerId};`;
  await db.run(query);
  res.send("Player Details Updated");
});

module.exports = app;
