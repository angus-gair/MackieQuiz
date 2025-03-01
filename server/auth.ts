import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { log } from "./vite";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${derivedKey.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hash, salt] = stored.split(".");
    if (!hash || !salt) {
      return false;
    }
    const hashedBuf = Buffer.from(hash, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, KEY_LENGTH)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    log(`Password comparison error: ${error}`);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: app.get("env") === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        log(`Attempting login for user: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          log(`Login failed: User not found: ${username}`);
          return done(null, false);
        }
        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          log(`Login failed: Invalid password for user: ${username}`);
          return done(null, false);
        }
        log(`Login successful for user: ${username}`);
        return done(null, user);
      } catch (err) {
        log(`Login error: ${err}`);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    log(`Serializing user: ${user.id}`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      log(`Deserializing user: ${id}`);
      const user = await storage.getUser(id);
      if (!user) {
        log(`Deserialization failed: User not found: ${id}`);
        return done(null, false);
      }
      log(`Deserialization successful for user: ${id}`);
      done(null, user);
    } catch (err) {
      log(`Deserialization error: ${err}`);
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, isAdmin } = req.body;
      log(`Registration attempt for user: ${username}`);

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        log(`Registration failed: Username already exists: ${username}`);
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin: isAdmin || false,
        teamAssigned: false
      });

      log(`Registration successful for user: ${username}`);

      req.login(user, (err) => {
        if (err) {
          log(`Login after registration failed: ${err}`);
          return next(err);
        }
        // Include a redirect flag in the response to indicate the client should redirect to team allocation
        res.status(201).json({
          ...user,
          shouldRedirectToTeamAllocation: true
        });
      });
    } catch (err) {
      log(`Registration error: ${err}`);
      next(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res) => {
    const userId = req.user?.id;
    log(`Logout attempt for user: ${userId}`);
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.sendStatus(200);
      });
    });
  });

  app.post("/api/assign-team", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const userId = req.user.id;
    const { team } = req.body;

    // Validate team name
    const validTeams = ["Pour Decisions", "Sip Happens", "Grape Minds", "Kingsford Corkers"];
    if (!validTeams.includes(team)) {
      return res.status(400).json({ message: "Invalid team name" });
    }

    try {
      const updatedUser = await storage.assignTeam(userId, team);
      res.json(updatedUser);
    } catch (err) {
      log(`Team assignment error: ${err}`);
      res.status(500).json({ message: "Failed to assign team" });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      log('User check: Not authenticated');
      return res.sendStatus(401);
    }
    log(`User check: Authenticated as ${req.user.id}`);
    res.json(req.user);
  });
}