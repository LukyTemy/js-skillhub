import { reactive, ref } from 'vue';
import axios from 'axios';
import * as client from 'openid-client';
import { jwtDecode } from "jwt-decode";
import config from "@/config";

// Typed shape of the decoded Keycloak token (only fields we use)
interface KeycloakTokenPayload {
    preferred_username?: string;
    resource_access?: Record<string, { roles?: string[] }>;
    // ...other claims are ignored
}

// State for auth
const state = reactive<{
    accessToken: string | null;
    user: KeycloakTokenPayload | null;
    authenticated: boolean;
}>(
    {
        accessToken: null,
        user: null,
        authenticated: false,
    }
);

const error = ref<string | null>(null);
let codeChallenge: string | null = null;
let authConfig: client.Configuration;

export function useAuth() {

    const init = async () => {
        if (!config.keycloak.baseUrl || !config.keycloak.realm) {
            console.error('Keycloak configuration is missing baseUrl or realm', config.keycloak);
            throw new Error('Keycloak is not configured correctly (baseUrl/realm missing)');
        }

        const issuerUri = `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}`;
        authConfig = await client.discovery(
            new URL(issuerUri),
            config.keycloak.clientId!,
            undefined,
            undefined,
            { execute: [client.allowInsecureRequests] } // allow running Keycloak on localhost
        );
    };

    const login = async () => {
        if (!authConfig) {
            await init();
        }

        // Generate and persist PKCE code verifier
        const codeVerifier = client.randomPKCECodeVerifier();
        localStorage.setItem('code_verifier', codeVerifier);

        const storedVerifier = localStorage.getItem('code_verifier');
        if (!storedVerifier) {
            throw new Error('Failed to initialize PKCE code verifier');
        }

        codeChallenge = await client.calculatePKCECodeChallenge(storedVerifier);

        const parameters: Record<string, string> = {
            redirect_uri: config.keycloak.redirectUri,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        };

        const randomState = client.randomState();
        localStorage.setItem('state', randomState);
        parameters.state = randomState;

        const redirectTo: URL = client.buildAuthorizationUrl(authConfig!, parameters);
        window.location.href = redirectTo.href; // Redirect to Keycloak login page
    };

    /**
     * Handle the callback after login
     */
    const handleCallback = async (callbackUrl: string) => {
        // Ensure auth config is initialized (discovery)
        if (!authConfig) {
            await init();
        }

        const pkceCodeVerifier = localStorage.getItem('code_verifier') ?? undefined;
        const expectedState = localStorage.getItem('state') ?? undefined;

        const tokens: client.TokenEndpointResponse = await client.authorizationCodeGrant(
            authConfig,
            new URL(callbackUrl),
            {
                pkceCodeVerifier,
                expectedState,
            },
        );

        state.authenticated = true;
        state.accessToken = tokens.access_token ?? null;

        if (tokens.access_token) {
            state.user = jwtDecode<KeycloakTokenPayload>(tokens.access_token);
        } else {
            state.user = null;
        }
    };

    /**
     * Make an authenticated request to the backend
     */
    const authorizedRequest = async (endpoint: string, options = {}) => {
        if (!state.accessToken) {
            error.value = 'Not authenticated';
            throw new Error(error.value);
        }

        const response = await axios({
            url: `${endpoint}`,
            headers: {
                Authorization: `Bearer ${state.accessToken}`,
            },
            ...options,
        });
        return response.data;
    };

    const getUsername = () => {
        return state.user?.preferred_username;
    };

    const getUserRoles = (): string[] => {
        if (!state.user) {
            return [];
        }
        const clientAccess = state.user.resource_access?.[config.keycloak.clientId];
        return clientAccess?.roles ?? [];
    };

    return {
        state,
        error,
        init,
        login,
        handleCallback,
        authorizedRequest,
        getUsername,
        getUserRoles,
    };
}
