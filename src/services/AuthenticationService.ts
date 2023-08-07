import axios from "axios";

export default class AuthenticationService {
  private static instance: AuthenticationService;
  private idToken: string;

  // @ts-ignore
  private refreshTimeout;

  // @ts-ignore
  private tokenPromise: Promise<void | object>;

  private constructor() {
    this.idToken = "";
    const savedToken = localStorage.getItem("remsfal/id_token");

    // Wrap everything in a Promise
    this.tokenReadyPromise = new Promise((resolve) => {
      if (savedToken !== null && !window.location.href.includes("id_token")) {
        console.log("token from LocalStorage", savedToken);
        this.getTokenInfo(savedToken)
          .then((tokenInfo) => {
            if (this.isTokenExpired(tokenInfo)) {
              console.log(
                "LocalStorage Token expired, retrieving new Token",
                savedToken
              );
              this.retreiveToken();
            } else {
              this.idToken = savedToken;
              this.tokenPromise = this.getTokenInfo(this.idToken);
              resolve();
            }
          })
          .catch((error) => {
            console.error(error);
            this.retreiveToken();
          });
      } else if (window.location.href.includes("id_token")) {
        console.log("Getting token from URL");

        let uri = window.location.hash.replace("#", "?");
        window.location.href = "";

        let params = new URLSearchParams(uri);
        if (params.get("id_token") == null) {
          this.retreiveToken();
        } else {
          // remove token from URL
          window.location.hash = "";
        }
        this.idToken = params.get("id_token") ?? "";
        localStorage.setItem("remsfal/id_token", this.idToken);
        this.tokenPromise = this.getTokenInfo(this.idToken).then(
          (tokenInfo) => {
            resolve();
          }
        );

        console.log("obtained new Token: ", this.idToken);
      } else {
        // Get token from Google
        console.log("Getting token from Google");
        this.retreiveToken();
      }
    });
  }
  public whenTokenReady(): Promise<void> {
    return this.tokenReadyPromise;
  }

  private setTimeToGetNewToken(idToken: string) {
    this.tokenPromise = this.getTokenInfo(idToken).then((tokenInfo) => {
      console.log("Token expires in " + tokenInfo.expires_in + " seconds");
      this.refreshTimeout = setTimeout(
        this.refreshToken,
        tokenInfo.expires_in * 1000
      );
      return tokenInfo;
    });
  }

  private isTokenExpired(tokenInfo: any): boolean {
    console.log("Checking if token is expired...");
    const currentTimestamp = Math.floor(Date.now() / 1000); // Unix timestamp
    return tokenInfo.exp <= currentTimestamp;
  }

  private getTokenInfo(idToken: string): Promise<any> {
    const tokenInfoUrl = import.meta.env.VITE_GOOGLE_TOKEN_INFO_URL;

    const url = `${tokenInfoUrl}?id_token=${idToken.toString()}`;
    console.log("Getting token info...", url, idToken);

    return axios
      .get(url)
      .then((response) => response.data)
      .then((tokenInfo) => {
        console.log("Access Token is valid and has the following info:");
        console.log(tokenInfo);
        this.tokenPromise = Promise.resolve(tokenInfo);
        return tokenInfo;
      });
  }

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }

    return AuthenticationService.instance;
  }

  public getIdToken(): string {
    return this.idToken;
  }

  public async getUserId(): Promise<void | string> {
    return await this.tokenPromise.then((tokenInfo) => {
      if (!tokenInfo) {
        throw new Error("Token info is not initialized");
      }
      return tokenInfo.sub;
    });
  }

  public async getUserEmail(): Promise<void | string> {
    return await this.tokenPromise.then((tokenInfo) => {
      if (!tokenInfo) {
        throw new Error("Token info is not initialized");
      }
      return tokenInfo.email;
    });
  }

  private static getGoogleAuthUrl(): string {
    const rootUrl = import.meta.env.VITE_GOOGLE_OAUTH_AUTH_URL;
    const options = {
      response_type: "id_token",
      client_id: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URL,
      scope: ["openid", "email"].join(" "),
      // the state can be used for additional query parameter
      // state: 'any state to have after the redirect'
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }
  private retreiveToken(): void {
    console.log("Authentication is required...");
    let authUrl = AuthenticationService.getGoogleAuthUrl();
    console.log("Redirect to: " + authUrl);
    window.location.href = authUrl;
  }
}
