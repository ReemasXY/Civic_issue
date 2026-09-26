import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

// Maps a user_id to the set of open WebSocket connections for that user
// (a citizen could have multiple tabs/devices open at once).
const userConnections = new Map();

/**
 * Pulls the `token` cookie's raw value out of a raw Cookie header string.
 * This is the same cookie checkToken.js reads via req.cookies.token, but
 * during the WebSocket upgrade handshake cookie-parser hasn't run yet,
 * so it has to be parsed by hand here.
 */
function extractTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === "token") {
      return rest.join("=");
    }
  }

  return null;
}

/**
 * Attaches a WebSocket server to the existing HTTP server so real-time
 * notifications can be pushed to citizens the moment an officer updates
 * a report's status — no polling, no manual refresh needed.
 */
export function initNotificationSocket(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    const token = extractTokenFromCookieHeader(req.headers.cookie);

    if (!token) {
      socket.destroy();
      return;
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.user_id = decoded.user_id;
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws) => {
    const { user_id } = ws;

    if (!userConnections.has(user_id)) {
      userConnections.set(user_id, new Set());
    }
    userConnections.get(user_id).add(ws);

    console.log(`🔌 WebSocket connected for user ${user_id}`);

    ws.on("close", () => {
      const connections = userConnections.get(user_id);
      if (connections) {
        connections.delete(ws);
        if (connections.size === 0) {
          userConnections.delete(user_id);
        }
      }
    });
  });

  return wss;
}

/**
 * Pushes a notification payload to every open connection for a given
 * user. If that user has no open connection, this silently does
 * nothing — the notification still exists in the database, they'll
 * just see it next time they load the page instead of instantly.
 */
export function sendNotificationToUser(user_id, notification) {
  const connections = userConnections.get(user_id);

  if (!connections || connections.size === 0) return;

  const payload = JSON.stringify({
    type: "notification",
    data: notification,
  });

  connections.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload);
    }
  });
}