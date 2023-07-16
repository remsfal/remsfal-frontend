import axios from 'axios'

export default class AuthenticationService {
  private static instance: AuthenticationService;
  private readonly idToken: string;

  // @ts-ignore
  private refreshTimeout;

  // @ts-ignore
  private readonly tokenPromise: Promise<void | object>;

  private constructor() {
    // let uri = window.location.search.substring(1);
    let uri = window.location.hash.replace("#", "?");
    let params = new URLSearchParams(uri);
    if (params.get("access_token") == null) {
      // redirect to google in order to get a new token
      this.refreshToken();
    } else {
      // remove token from URL
      window.location.hash = "";
    }
    this.accessToken = params.get("access_token") ?? "";
    this.idToken = params.get("id_token") ?? "";
    console.log("JWT ID Token: ", this.idToken);
    this.tokenPromise = this.getTokenInfo()
      .then((tokenInfo) => {
        this.refreshTimeout = setTimeout(
          this.refreshToken,
          tokenInfo.expires_in * 1000
        );
        return tokenInfo;
      })
      .catch(() => this.refreshToken());
  }

  private getUserInfo(): Promise<object> {
    const userInfoUrl = import.meta.env.VITE_GOOGLE_USER_INFO_URL;
    return axios
      .get(userInfoUrl, {
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
  public getIdToken(): string {
    return this.idToken;
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
  private getTokenInfo(): Promise<object> {
    const tokenInfoUrl = import.meta.env.VITE_GOOGLE_TOKEN_INFO_URL;

    return axios
      .get(tokenInfoUrl, {
        params: { access_token: this.accessToken },
      })
      .then((response) => response.data)
      .then((tokenInfo) => {
        console.log("Access Token is valid and has the following info:");
        console.log("%j", tokenInfo);
        return tokenInfo;
      });
  }
  private refreshToken(): void {
    console.log("Authentication is required...");
    let authUrl = AuthenticationService.getGoogleAuthUrl();
    console.log("Redirect to: " + authUrl);
    window.location.href = authUrl;
  }
}