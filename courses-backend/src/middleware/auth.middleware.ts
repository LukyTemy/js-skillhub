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

// Keep a default client based on configured JWKS URI, but jwtVerify will try issuer-based JWKS as fallback.
const getSigningKeyFromClient = (clientInstance, kid) => {
    return new Promise((resolve, reject) => {
        clientInstance.getSigningKey(kid, (err, key) => {
            if (err) return reject(err);
            if (!key) return reject(new Error('No key found'));
            resolve(key.getPublicKey());
        });
    });
};

const jwtVerify = (accessToken, options) => {
    return new Promise((resolve, reject) => {
        // getKey function has access to accessToken via closure
        const getKey = async (header, callback) => {
            try {
                // First try configured JWKS
                try {
                    const signingKey = await getSigningKeyFromClient(client, header.kid);
                    return callback(null, signingKey);
                } catch (err) {
                    // ignore and try fallback
                }

                // Fallback: decode token to find issuer and fetch its JWKS
                const decodedComplete = jwt.decode(accessToken, { complete: true }) || {};
                const payload = decodedComplete.payload || {};
                const iss = payload.iss;
                if (!iss) {
                    return callback(new Error('Token missing issuer (iss)'));
                }

                const issuerJwks = `${String(iss).replace(/\/$/, '')}/protocol/openid-connect/certs`;
                const altClient = jwksClient({ jwksUri: issuerJwks });
                try {
                    const signingKey = await getSigningKeyFromClient(altClient, header.kid);
                    return callback(null, signingKey);
                } catch (err2) {
                    // If issuer JWKS isn't reachable from this process (common in Docker where issuer host is 'localhost'),
                    // try the configured KEYCLOAK_BASE_URL (internal access) as a last resort.
                    try {
                        const configuredJwks = JWKS_URI; // based on Config.keycloak.baseUrl
                        if (configuredJwks && configuredJwks !== issuerJwks) {
                            const configuredClient = jwksClient({ jwksUri: configuredJwks });
                            const signingKey2 = await getSigningKeyFromClient(configuredClient, header.kid);
                            return callback(null, signingKey2);
                        }
                    } catch (err3) {
                        // swallow and return original error below
                    }
                    return callback(err2);
                }
            } catch (finalErr) {
                return callback(finalErr);
            }
        };

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
            // don't enforce issuer here because token may be issued using a different host
            // (e.g. browser uses http://localhost:8091 while backend in docker reaches Keycloak at http://keycloak:8080)
        };

        // Verify signature first
        const decoded = await jwtVerify(token, options);
        const payload = typeof decoded === "string" ? JSON.parse(decoded) : decoded;

        // Validate issuer loosely: accept any issuer that ends with /realms/{REALM}
        const iss = payload.iss;
        if (!iss || !String(iss).endsWith(`/realms/${KEYCLOAK_REALM}`)) {
            return res.status(401).json({ error: 'Invalid token issuer' });
        }

        // Custom audience/client validation: accept token if any of these is true:
        // - aud equals CLIENT_ID (or contains it if array)
        // - azp equals CLIENT_ID
        // - resource_access contains CLIENT_ID (client roles)
        const aud = payload.aud;
        const azp = payload.azp;
        const hasResourceAccess = !!(payload.resource_access && payload.resource_access[CLIENT_ID]);

        const audMatches = (typeof aud === 'string' && aud === CLIENT_ID) || (Array.isArray(aud) && aud.includes(CLIENT_ID));
        if (!audMatches && azp !== CLIENT_ID && !hasResourceAccess) {
            return res.status(401).json({ error: 'Invalid token audience' });
        }

        const user = parseUserDataFromToken(payload);
        req.user = user;
        next();
    } catch (err) {
        // Token verification failed
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
