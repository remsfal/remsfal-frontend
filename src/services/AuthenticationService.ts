import axios from 'axios'

export default class AuthenticationService {
  private static instance: AuthenticationService;

  private readonly accessToken: string;
  private readonly idToken: string;

  // @ts-ignore
  private refreshTimeout;

  // @ts-ignore
  private readonly tokenPromise: Promise<void | object>;

  private constructor() {
    let uri = window.location.hash.replace("#","?");
    let params = new URLSearchParams(uri);
    if(params.get("access_token") == null) {
        this.refreshToken();
    } else {
        window.location.hash = '';
    }
    this.accessToken = params.get("access_token") ?? '';
    // Add id_token extraction
    this.idToken = params.get("id_token") ?? '';
    console.log("JWT ID Token: ", this.idToken);

  }
  private getUserInfo(): Promise<object> {
    return axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .then((response) => response.data)
      .then((userInfo) => {
        console.log("User Info:");
        console.log("%j", userInfo);
        return userInfo;
      });
  }

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }

    return AuthenticationService.instance;
  }

  public getAccessToken(): string {
    return this.accessToken;
  }

  public getUserId(): Promise<void | object> {
    return this.tokenPromise.then((tokenInfo) => tokenInfo.sub);
  }

  public getUserEmail(): Promise<void | object> {
    return this.tokenPromise.then((tokenInfo) => tokenInfo.email);
  }

  private static getGoogleAuthUrl(): string {
    const rootUrl = import.meta.env.VITE_GOOGLE_OAUTH_AUTH_URL;
    const options = {
      response_type: "token id_token",
      client_id: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URL,
      scope: ["openid", "profile", "email"].join(" "),
      // the state can be used for additional query parameter
      // state: 'any state to have after the redirect'
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  private refreshToken(): void {
    console.log("Authentication is required...");
    let authUrl = AuthenticationService.getGoogleAuthUrl();
    console.log("Redirect to: " + authUrl);
    window.location.href = authUrl;
  }
}