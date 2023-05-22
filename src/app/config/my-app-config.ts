export default {
    oidc: {
        clientId: "{okta client id}",
        issuer: "https://{dev domain}/oauth2/default",
        redirectUri: "http://localhost:4200/login/callback",
        scopes: ["openid", "profile", "email"]
    }
}
