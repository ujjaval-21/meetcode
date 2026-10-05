import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import { googleLogin } from "../services/auth";
import { useAuth } from "./useAuth";

export function useGoogleAuth() {
    const navigate = useNavigate();
    const auth = useAuth();

    return useGoogleLogin({
        flow: "auth-code",

        onSuccess: async ({ code }) => {
            try {
                await googleLogin(code);

                // Update AuthContext
                await auth.login();

                navigate("/dashboard");
            } catch (err) {
                console.error(err);
            }
        },

        onError: () => {
            console.error("Google Login Failed");
        },
    });
}