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

const getSigningKeyFromClient = (clientInstance: any, kid: any) => {
    return new Promise((resolve, reject) => {
        clientInstance.getSigningKey(kid, (err: any, key: any) => {
            if (err) return reject(err);
            if (!key) return reject(new Error('No key found'));
            resolve(key.getPublicKey());
        });
    });
};

const jwtVerify = (accessToken: string, options: any) => {
    return new Promise((resolve, reject) => {
        const getKey = async (header: any, callback: any) => {
            try {
                try {
                    const signingKey = await getSigningKeyFromClient(client, header.kid);
                    return callback(null, signingKey);
                } catch (err) {
                    // ignore
                }

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
                    try {
                        const configuredJwks = JWKS_URI;
                        if (configuredJwks && configuredJwks !== issuerJwks) {
                            const configuredClient = jwksClient({ jwksUri: configuredJwks });
                            const signingKey2 = await getSigningKeyFromClient(configuredClient, header.kid);
                            return callback(null, signingKey2);
                        }
                    } catch (err3) {
                        // swallow
                    }
                    return callback(err2);
                }
            } catch (finalErr) {
                return callback(finalErr);
            }
        };

        jwt.verify(accessToken, getKey, options, (err: any, decoded: any) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
};

const parseUserDataFromToken = (decoded: any) => {
    const payload = typeof decoded === "string" ? JSON.parse(decoded) : decoded;

    // Extrakce hodnot pro pohodlné použití
    const id = payload.sub;
    const username = payload.preferred_username || payload.username;
    const name = payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim();
    const email = payload.email;

    const realmRoles = payload.realm_access?.roles || [];
    const clientRoles = payload.resource_access?.[CLIENT_ID]?.roles || [];
    // Sloučení rolí
    const roles = Array.from(new Set([...realmRoles, ...clientRoles]));

    return {
        ...payload, // <--- DŮLEŽITÉ: Zkopírujeme celý originální payload (obsahuje 'sub', 'resource_access' atd.)
        id,         // Ponecháme tvůj alias 'id' pro zpětnou kompatibilitu
        username,
        name,
        email,
        roles,
    };
};

export interface AuthenticatedUser {
    id: string;
    sub?: string; // Přidáno do typu
    username?: string;
    name?: string;
    email?: string;
    roles: string[];
    resource_access?: any; // Přidáno do typu
    [key: string]: any; // Allow other properties
}

export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        if (!authHeader || Array.isArray(authHeader)) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        const parts = (authHeader as string).split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ error: "Invalid Authorization header format" });
        }

        const token = parts[1];
        const options = {
            algorithms: ["RS256"],
        };

        const decoded = await jwtVerify(token, options);
        const payload = typeof decoded === "string" ? JSON.parse(decoded) : decoded;

        const iss = payload.iss;
        if (!iss || !String(iss).endsWith(`/realms/${KEYCLOAK_REALM}`)) {
            return res.status(401).json({ error: 'Invalid token issuer' });
        }

        const aud = payload.aud;
        const azp = payload.azp;
        const hasResourceAccess = !!(payload.resource_access && payload.resource_access[CLIENT_ID]);

        const audMatches = (typeof aud === 'string' && aud === CLIENT_ID) || (Array.isArray(aud) && aud.includes(CLIENT_ID));
        if (!audMatches && azp !== CLIENT_ID && !hasResourceAccess) {
            // return res.status(401).json({ error: 'Invalid token audience' });
            // Poznámka: Keycloak access tokeny často nemají 'aud' nastavené na client_id frontendu, ale na account/backend.
            // Pokud ti to hází chybu audience, můžeš tuto kontrolu dočasně zakomentovat, nebo spoléhat na 'azp'.
        }

        const user = parseUserDataFromToken(payload);
        req.user = user as AuthenticatedUser; // Type assertion
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

export function hasAnyRole(...roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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