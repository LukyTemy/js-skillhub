import { reactive, ref } from 'vue';
import axios from 'axios';
import * as client from 'openid-client';
import { jwtDecode } from "jwt-decode";
import config from "@/config";

// --- Types ---
interface KeycloakTokenPayload {
    preferred_username?: string;
    resource_access?: Record<string, { roles?: string[] }>;
    exp?: number;
}

// --- State ---
const state = reactive<{
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    user: KeycloakTokenPayload | null;
    authenticated: boolean;
    isReady: boolean;
}>({
    accessToken: null,
    refreshToken: null,
    idToken: null,
    user: null,
    authenticated: false,
    isReady: false,
});

const error = ref<string | null>(null);

let authConfig: client.Configuration | null = null;
let initPromise: Promise<void> | null = null;
let isProcessingCallback = false;

export function useAuth() {

    const tokenEndpoint = () => `${config.keycloak.baseUrl.replace(/\/$/, '')}/realms/${config.keycloak.realm}/protocol/openid-connect/token`;

    const decodePayload = (token: string | null): KeycloakTokenPayload | null => {
        if (!token) return null;
        try {
            return jwtDecode<KeycloakTokenPayload>(token);
        } catch (e) {
            return null;
        }
    };

    const isTokenValid = (token: string | null, marginSeconds = 10): boolean => {
        const payload = decodePayload(token);
        if (!payload || !payload.exp) return false;
        return payload.exp * 1000 > (Date.now() + marginSeconds * 1000);
    };

    const setSession = (access: string, refresh?: string, idToken?: string) => {
        state.accessToken = access;
        state.user = decodePayload(access);
        state.authenticated = true;

        if (refresh) {
            state.refreshToken = refresh;
            localStorage.setItem('refresh_token', refresh);
        }

        if (idToken) {
            state.idToken = idToken;
            localStorage.setItem('id_token', idToken);
        }
    };

    const clearSession = () => {
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id_token');
        state.accessToken = null;
        state.refreshToken = null;
        state.idToken = null;
        state.user = null;
        state.authenticated = false;
    };

    const refreshAccessToken = async (): Promise<boolean> => {
        const rt = state.refreshToken ?? localStorage.getItem('refresh_token');
        if (!rt) return false;

        try {
            const body = new URLSearchParams();
            body.set('grant_type', 'refresh_token');
            body.set('refresh_token', rt);
            body.set('client_id', config.keycloak.clientId!);

            const response = await fetch(tokenEndpoint(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
            });

            if (!response.ok) {
                clearSession();
                return false;
            }

            const data = await response.json();
            setSession(data.access_token, data.refresh_token, data.id_token);
            return true;

        } catch (e) {
            console.error("Refresh failed", e);
            clearSession();
            return false;
        }
    };

    const _performInit = async () => {
        const storedRefresh = localStorage.getItem('refresh_token');
        const storedIdToken = localStorage.getItem('id_token');
        if (storedIdToken) state.idToken = storedIdToken;

        if (storedRefresh) {
            await refreshAccessToken();
        } else {
            clearSession();
        }

        if (config.keycloak.baseUrl && config.keycloak.realm) {
            const issuerUri = `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}`;
            try {
                authConfig = await client.discovery(
                    new URL(issuerUri),
                    config.keycloak.clientId!,
                    undefined,
                    undefined,
                    { execute: [client.allowInsecureRequests] }
                );
            } catch (e) {
                console.warn("Keycloak discovery failed.");
            }
        }

        state.isReady = true;
    };

    const init = () => {
        if (!initPromise) {
            initPromise = _performInit();
        }
        return initPromise;
    };

    const login = async () => {
        await init();
        if (!authConfig) throw new Error("Auth config not loaded");

        const codeVerifier = client.randomPKCECodeVerifier();
        localStorage.setItem('code_verifier', codeVerifier);
        const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

        const parameters: Record<string, string> = {
            redirect_uri: config.keycloak.redirectUri,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            scope: 'openid profile email'
        };

        const randomState = client.randomState();
        localStorage.setItem('state', randomState);
        parameters.state = randomState;

        const redirectTo = client.buildAuthorizationUrl(authConfig, parameters);
        window.location.href = redirectTo.href;
    };

    const handleCallback = async (callbackUrl: string) => {
        if (isProcessingCallback) return;
        isProcessingCallback = true;

        const pkceCodeVerifier = localStorage.getItem('code_verifier') ?? undefined;
        const expectedState = localStorage.getItem('state') ?? undefined;

        await init();

        if (!authConfig) {
            isProcessingCallback = false;
            throw new Error("Auth config invalid");
        }

        try {
            const tokens = await client.authorizationCodeGrant(
                authConfig,
                new URL(callbackUrl),
                {
                    pkceCodeVerifier,
                    expectedState,
                },
                {
                    redirect_uri: config.keycloak.redirectUri,
                }
            );

            if (tokens.access_token) {
                setSession(tokens.access_token, tokens.refresh_token, tokens.id_token);

                localStorage.removeItem('code_verifier');
                localStorage.removeItem('state');

                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (e) {
            console.error("Login callback error:", e);
            error.value = "Login failed";
            throw e;
        } finally {
            // isProcessingCallback = false;
        }
    };

    const authorizedRequest = async (endpoint: string, options = {}) => {
        if (!state.accessToken || !isTokenValid(state.accessToken, 10)) {
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
                throw new Error("Session expired");
            }
        }

        return axios({
            url: endpoint,
            headers: { Authorization: `Bearer ${state.accessToken}` },
            ...options,
        }).then(r => r.data);
    };

    const getUsername = () => state.user?.preferred_username;

    const getUserRoles = (): string[] => {
        if (!state.user) return [];
        const clientAccess = state.user.resource_access?.[config.keycloak.clientId!];
        return clientAccess?.roles ?? [];
    };

    const logout = (redirectToKeycloak = true) => {
        const idTokenToHint = state.idToken ?? localStorage.getItem('id_token');

        clearSession();
        localStorage.removeItem('code_verifier');
        localStorage.removeItem('state');

        if (redirectToKeycloak && config.keycloak.baseUrl) {
            const postLogoutRedirect = location.origin + '/';

            const baseUrl = `${config.keycloak.baseUrl.replace(/\/$/, '')}/realms/${config.keycloak.realm}/protocol/openid-connect/logout`;

            const url = new URL(baseUrl);

            url.searchParams.set('post_logout_redirect_uri', postLogoutRedirect);

            if (idTokenToHint) {
                url.searchParams.set('id_token_hint', idTokenToHint);
            } else {
                url.searchParams.set('client_id', config.keycloak.clientId!);
            }

            window.location.href = url.toString();
        }
    };

    return {
        state,
        error,
        init,
        login,
        handleCallback,
        authorizedRequest,
        refreshAccessToken,
        getUsername,
        getUserRoles,
        logout,
    };
}