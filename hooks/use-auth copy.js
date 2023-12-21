import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleAutoLogin as _toggleAutoLogin,
  toggleRememberLoginDetails as _toggleRememberLoginDetails,
  clearFormFields as _clearFormFields,
  setFormField,
} from "store/actions/auth.actions";

import useCache from "hooks/use-cache";
import useCNonce from "hooks/use-cnonce";
import useI18N from "hooks/use-i18n";
import useSecureStore from "hooks/use-secure-store";

import axios from "services/axios";

import jwt_decode from "jwt-decode";

import { AppConstants, AuthConstants } from "constants";

import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
  exchangeCodeAsync,
} from "expo-auth-session";
import { Alert } from "react-native";

const TENANT_ID = "1917185a-187d-415b-87e6-295e95df8a01";
const CLIENT_ID = "9a83c1ef-d132-47b2-bf77-d42c465c949a";

WebBrowser.maybeCompleteAuthSession();

let uri = "tools.disciple.app://login";

const AuthContext = createContext(null);

const AuthProvider = React.memo(({ children }) => {
  const auth = useCustomAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
});

const useAuth = () => useContext(AuthContext);

const useCustomAuth = () => {
  const { setLocale } = useI18N();

  const [authenticated, setAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [baseUrl, setBaseUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [o365domain, setO365domain] = useState(false);

  const dispatch = useDispatch();

  const isAutoLogin = useSelector((state) => state?.authReducer?.isAutoLogin);
  const rememberLoginDetails = useSelector(
    (state) => state?.authReducer?.rememberLoginDetails
  );

  const clearFormFields = useCallback(() => {
    dispatch(_clearFormFields());
    return;
  }, []);

  useEffect(() => {
    // console.log("--user--", user);
    if (!rememberLoginDetails) {
      clearFormFields();
    } else if (rememberLoginDetails && user) {
      dispatch(setFormField({ key: "domain", value: user?.domain }));
      dispatch(setFormField({ key: "username", value: user?.username }));
    }
  }, [rememberLoginDetails, user]);

  const { getSecureItem, setSecureItem, deleteSecureItem } = useSecureStore();

  const { clearCache } = useCache();

  const { setCNonce, validateCNonce } = useCNonce({
    persistedKey: AuthConstants.CNONCE_PERSISTED,
    cnonceKey: AuthConstants.CNONCE,
    cnonceDTKey: AuthConstants.CNONCE_DATETIME,
    threshold: AuthConstants.CNONCE_THRESHOLD,
  });

  const validateToken = useCallback((token, baseUrl) => {
    const payload = jwt_decode(token);
    //if (domain !== payload.iss) return false;
    if (!baseUrl?.includes(payload.iss)) {
      return false;
    }
    let exp = payload.exp;
    if (exp < 10000000000) exp *= 1000;
    const now = Date.now();
    if (now <= exp) return true;
    return false;
  }, []);

  const decodeToken = useCallback((token) => {
    try {
      return jwt_decode(token);
    } catch (error) {
      return null;
    }
  }, []);

  // rehydrate state from secure storage
  useEffect(() => {
    if (!accessToken || !baseUrl || !user) {
      (async () => {
        // rehydrate user
        if (!user) {
          try {
            const rehydratedUser = JSON.parse(
              await getSecureItem(AuthConstants.USER)
            );
            setUser(rehydratedUser);
          } catch (error) {
            console.error(error);
          }
        }
        // rehydrate baseUrl
        if (!baseUrl) {
          const rehydratedBaseUrl = await getSecureItem(AuthConstants.BASE_URL);
          setBaseUrl(rehydratedBaseUrl);
        }
        // rehydrate access token
        if (!accessToken) {
          const rehydratedAccessToken = await getSecureItem(
            AuthConstants.ACCESS_TOKEN
          );
          setAccessToken(rehydratedAccessToken);
        }
      })();
      return;
    }
    (async () => {
      // if auto-login enabled, then proceeed, otherwise validate login cnonce
      if (isAutoLogin) {
        setAuthenticated(true);
      } else {
        const validatedLogin = await validateCNonce();
        setAuthenticated(validatedLogin);
      }
    })();
    return;
  }, [accessToken, baseUrl, user?.id]);

  // auto-logout on any 401 - Unauthorized
  useEffect(() => {
    // add a response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error(error);
        if (error?.response?.status === 401) {
          setAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      if (responseInterceptor) {
        axios.interceptors.request.eject(responseInterceptor);
      }
    };
  }, []);

  // when baseUrl changes, set axios default baseURL (if applicable)
  // clear cache and storage when switching D.T instances
  useEffect(() => {
    if (baseUrl && baseUrl !== axios.defaults.baseURL) {
      axios.defaults.baseURL = baseUrl;
      // console.log("--baseUrl--", baseUrl);
      //clearStorage();
      clearCache();
    }
    // clearCache();
    // console.log("--baseUrl OUT--", baseUrl);

    return;
  }, [baseUrl]);

  // clear cache and storage when switching user accounts within same instance
  useEffect(() => {
    //clearStorage();
    clearCache();
    return;
  }, [user?.id]);

  /*
   * When "accessToken" changes, validate it.
   * If valid, configure axios request interceptor and validate login cnonce
   */
  useEffect(() => {
    let requestInterceptor = null;
    (async () => {
      if (accessToken && validateToken(accessToken, baseUrl)) {
        // eject any previous request interceptors
        for (
          let ii = 0;
          ii < axios.interceptors.request.handlers?.length;
          ii++
        ) {
          axios.interceptors.request.eject(ii);
        }
        // add a request interceptor
        requestInterceptor = axios.interceptors.request.use(
          (config) => {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
            return config;
          },
          (error) => error
        );
      }
    })();
    return () => {
      if (requestInterceptor) {
        axios.interceptors.request.eject(requestInterceptor);
      }
    };
  }, [accessToken]);

  const toggleAutoLogin = useCallback(async () => {
    dispatch(_toggleAutoLogin());
    return;
  }, []);

  const toggleRememberLoginDetails = useCallback(() => {
    dispatch(_toggleRememberLoginDetails());
    return;
  }, []);

  const modifyUser = useCallback(async ({ key, value }) => {
    setUser((prev) => ({ ...prev, [key]: value }));
  }, []);

  // set persisted secure storage values (if applicable per user options)
  const setPersistedAuth = useCallback(
    async (accessToken, baseUrl, user) => {
      try {
        await setSecureItem(AuthConstants.ACCESS_TOKEN, accessToken);
        await setSecureItem(AuthConstants.BASE_URL, baseUrl);
        //if (rememberLoginDetails) await setSecureItem(AuthConstants.USER, JSON.stringify(user));
        await setSecureItem(AuthConstants.USER, JSON.stringify(user));
      } catch (error) {
        // TODO:
        console.error(error);
      }
    },
    [accessToken, baseUrl, user?.id]
  );

  // FOR o365 LOG IN
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${TENANT_ID}/v2.0`
  );

  // Request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["openid", "profile", "email", "offline_access"],
      redirectUri: uri,
    },
    discovery
  );

  useEffect(() => {
    if (response !== null && response.type === "success") {
      exchangeCodeAsync(
        {
          clientId: CLIENT_ID,
          scopes: ["openid", "profile", "email", "offline_access"],
          code: response.params.code,
          redirectUri: uri,
          extraParams: { code_verifier: request.codeVerifier },
        },
        discovery
      )
        .then((token) => {
          // let decodedToken = jwt_decode(token.idToken);
          // console.log("--token--", token);
          // console.log("--decodedToken--", decodedToken);
          //VALIDATE THE ACCESS TOKEN AT THE BACKEND.
          validateAccessToken(token);
        })
        .catch((exchangeError) => {
          throw new Error(exchangeError);
        });
    }
  }, [response]);

  const validateAccessToken = async (token) => {
    try {
      const domain = o365domain;
      // console.log("--validateAccessToken--");
      const baseUrl = `${AppConstants.PROTOCOL}://${domain}/wp-json`;
      const url = `${baseUrl}/jwt-auth/v1/token/o365validate`;

      const res = await axios({
        url,
        method: "POST",
        data: {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiresIn: token.expiresIn,
        },
      });

      if (res?.status === 200 && res?.data?.token) {
        // console.log("--res?.data--", res?.data);
        const accessToken = res.data.token;
        const id = decodeToken(accessToken)?.data?.user?.id;
        const user = {
          id,
          username: res.data?.user_email,
          domain,
          display_name: res.data?.user_display_name,
          email: res.data?.user_email,
          nicename: res.data?.user_nicename,
          o365Login: true,
        };
        // set login cnonce
        await setCNonce();
        // set persisted storage values
        await setPersistedAuth(accessToken, baseUrl, user);
        // sync local locale with server
        if (res.data?.locale) setLocale(res.data.locale);
        // set in-memory provider value
        // NOTE: order matters here (per hook ordering)!
        setUser(user);
        setBaseUrl(baseUrl);
        setAccessToken(accessToken);
        setAuthenticated(true);
        return;
      } else {
        Alert.alert("An error occurred!", "Logging out from O365", [
          {
            text: "Ok",
            onPress: async () =>
              await WebBrowser.openAuthSessionAsync(
                `https://login.windows.net/${TENANT_ID}/oauth2/logout`,
                uri
              ),
          },
        ]);
        // alert("An error occurred!");
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  const signInO365 = async (domain) => {
    setO365domain(domain);
    try {
      await promptAsync();
    } catch (error) {
      throw new Error(error);
    }
  };

  // TODO: implement timeout
  const signIn = useCallback(async (domain, username, password) => {
    // TODO: handle offline
    try {
      const baseUrl = `${AppConstants.PROTOCOL}://${domain}/wp-json`;
      const url = `${baseUrl}/jwt-auth/v1/token`;
      const res = await axios({
        url,
        method: "POST",
        data: {
          username,
          password,
        },
      });
      if (res?.status === 200 && res?.data?.token) {
        // console.log("--res?.data--", res?.data);
        const accessToken = res.data.token;
        const id = decodeToken(accessToken)?.data?.user?.id;
        const user = {
          id,
          username,
          domain,
          display_name: res.data?.user_display_name,
          email: res.data?.user_email,
          nicename: res.data?.user_nicename,
        };
        // set login cnonce
        await setCNonce();
        // set persisted storage values
        await setPersistedAuth(accessToken, baseUrl, user);
        // sync local locale with server
        if (res.data?.locale) {
          setLocale(res.data.locale);
        }
        // set in-memory provider value
        // NOTE: order matters here (per hook ordering)!
        clearFormFields();
        setUser(user);
        setBaseUrl(baseUrl);
        setAccessToken(accessToken);
        setAuthenticated(true);
        return;
      }
    } catch (error) {
      throw new Error(error);
    }
  }, []);

  const check2FaEnabled = async (domain, username, password) => {
    try {
      const baseUrl = `${AppConstants.PROTOCOL}://${domain}/wp-json`;
      const url = `${baseUrl}/jwt-auth/v1/login/validate`;
      const res = await axios({
        url,
        method: "POST",
        data: {
          username,
          password,
        },
      });

      if (res?.status === 200 && res?.data) {
        return { ...res.data, baseUrl };
      } else {
        throw new Error(res.data.status);
      }
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const validateOtp = async (domain, username, password, otp) => {
    try {
      const baseUrl = `${AppConstants.PROTOCOL}://${domain}/wp-json`;
      const url = `${baseUrl}/jwt-auth/v1/login/validate-otp`;
      const res = await axios({
        url,
        method: "POST",
        data: {
          username,
          password,
          authcode: otp,
        },
      });

      if (res?.status === 200 && res?.data?.token) {
        return { ...res.data, baseUrl };
      } else {
        console.log("--res.data--", res?.data);
        throw new Error(res?.data?.message);
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  // TODO: remove when switch to web-based OAuth2 login
  // used by ValidateOtpScreen
  const persistUser = useCallback(async (domain, username, data) => {
    const accessToken = data.token;
    const id = decodeToken(accessToken)?.data?.user?.id;
    const user = {
      id,
      username,
      domain,
      display_name: data?.user_display_name,
      email: data?.user_email,
      nicename: data?.user_nicename,
    };
    // set persisted storage values
    await setPersistedAuth(accessToken, data.baseUrl, user);
    // sync local locale with server
    if (data?.locale) setLocale(data.locale);
    // set in-memory provider value
    // NOTE: order matters here (per hook ordering)!
    setUser(user);
    setBaseUrl(data.baseUrl);
    setAccessToken(accessToken);
    return;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await deleteSecureItem(AuthConstants.ACCESS_TOKEN);
      await deleteSecureItem(AuthConstants.BASE_URL);
      //await deleteSecureItem(AuthConstants.USER);
      if (!rememberLoginDetails) await deleteSecureItem(AuthConstants.USER);
    } catch (error) {
      console.warn(error);
    } finally {
      // disable "auto login" and "remember login details" on signOut
      // if (isAutoLogin) toggleAutoLogin();
      // nullify in-memory auth provider values
      if (user?.o365Login) {
        await WebBrowser.openAuthSessionAsync(
          `https://login.windows.net/${TENANT_ID}/oauth2/logout`,
          uri
        );
      }
      if (!rememberLoginDetails) setUser(null);
      setBaseUrl(null);
      setAccessToken(null);
      setAuthenticated(false);
    }
  }, [[user?.id, user?.o365Login]]);

  return {
    authenticated,
    accessToken,
    baseUrl,
    user,
    persistUser,
    isAutoLogin,
    toggleAutoLogin,
    rememberLoginDetails,
    toggleRememberLoginDetails,
    modifyUser,
    signIn,
    check2FaEnabled,
    validateOtp,
    signOut,
    signInO365,
  };

  /*
  return useMemo(
    () => ({
      authenticated,
      accessToken,
      user,
      persistUser,
      isAutoLogin,
      toggleAutoLogin,
      rememberLoginDetails,
      toggleRememberLoginDetails,
      modifyUser,
      signIn,
      signOut,
    }),
    [
      authenticated,
      user?.id,
      user?.domain,
      user?.username,
      isAutoLogin,
      rememberLoginDetails,
    ]
  );
  */
};
export { useAuth, AuthProvider };
