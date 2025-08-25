// import {
//   EmailPassword,
//   signUp as emailSignUp,
//   signIn as emailSignIn,
// } from "supertokens-web-js/recipe/emailpassword";
// import { ThirdParty, signInAndUp } from "supertokens-web-js/recipe/thirdparty";
// import { Session } from "supertokens-web-js/recipe/session";

// export const signUp = async (identifier: string, password?: string) => {
//   const formFields = [
//     { id: identifier.includes("@") ? "email" : "phone", value: identifier },
//     password ? { id: "password", value: password } : null,
//   ].filter((f) => f);
//   return await emailSignUp({ formFields });
// };

// export const signIn = async (identifier: string, password?: string) => {
//   const formFields = [
//     { id: identifier.includes("@") ? "email" : "phone", value: identifier },
//     password ? { id: "password", value: password } : null,
//   ].filter((f) => f);
//   return await emailSignIn({ formFields });
// };

// export const verifyOTP = async (identifier: string, otp: string) => {
//   const response = await fetch("http://localhost:3001/api/otp-verify", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ identifier, otp }),
//   });
//   return response.json();
// };

// export const socialSignIn = (provider: string) => {
//   signInAndUp({ provider });
// };

// export const getSession = async () => {
//   return await Session.doesSessionExist();
// };

// export const sendForgotPasswordOTP = async (identifier: string) => {
//   const response = await fetch("http://localhost:3001/api/forgot-password", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ identifier }),
//   });
//   return response.json();
// };
