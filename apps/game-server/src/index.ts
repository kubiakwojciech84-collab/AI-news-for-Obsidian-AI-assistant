import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { ROOM_NAMES } from "@nova/shared";
import { ObbyRoom } from "./rooms/ObbyRoom";
import { ShooterRoom } from "./rooms/ShooterRoom";

const port = parseInt(process.env.PORT ?? "2567", 10);

const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true, service: "nova-game-server" }));
app.use("/monitor", monitor());

const server = http.createServer(app);
const gameServer = new Server({ server });

gameServer.define(ROOM_NAMES.OBBY, ObbyRoom);
gameServer.define(ROOM_NAMES.SHOOTER, ShooterRoom);

gameServer.listen(port).then(() => {
  // eslint-disable-next-line no-console
  console.log(`NovaWorlds game-server listening on :${port} (rooms: ${ROOM_NAMES.OBBY}, ${ROOM_NAMES.SHOOTER})`);
});
