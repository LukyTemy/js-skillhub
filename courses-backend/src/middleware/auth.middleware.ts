import { Request, Response, NextFunction } from "express";
import { Config } from "../../config";

const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const KEYCLOAK_BASE_URL = Config.keycloak.baseUrl;
const KEYCLOAK_REALM = Config.keycloak.realm;
const CLIENT_ID = Config.keycloak.clientId;

const JWKS_URI = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`;

const client = jwksClient({
    jwksUri: JWKS_URI,
});

const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
};

const jwtVerify = (accessToken, options) => {
    return new Promise((resolve, reject) => {
        jwt.verify(accessToken, getKey, options, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
};

const parseUserDataFromToken = (decoded) => {
    const payload = typeof decoded === "string" ? JSON.parse(decoded) : decoded;
    const id = payload.sub;
    const username = payload.preferred_username || payload.username;
    const name = payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim();
    const email = payload.email;

    const realmRoles = payload.realm_access?.roles || [];
    const clientRoles = payload.resource_access?.[CLIENT_ID]?.roles || [];
    const roles = Array.from(new Set([...realmRoles, ...clientRoles]));

    return {
        id,
        username,
        name,
        email,
        roles,
    };
};

export interface AuthenticatedUser {
    id: string;
    username?: string;
    name?: string;
    email?: string;
    roles: string[];
}

export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        if (!authHeader || Array.isArray(authHeader)) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ error: "Invalid Authorization header format" });
        }

        const token = parts[1];
        const options = {
            algorithms: ["RS256"],
            issuer: `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}`,
            audience: CLIENT_ID,
        };

        const decoded = await jwtVerify(token, options);
        const user = parseUserDataFromToken(decoded);
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

export function hasAnyRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userRoles = req.user.roles || [];
        const hasRole = roles.some((role) => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return next();
    };
}
