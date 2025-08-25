// import ThirdParty from "supertokens-node/recipe/thirdparty";
// import EmailPassword from "supertokens-node/recipe/emailpassword";
// import Session from "supertokens-node/recipe/session";
// import { TypeInput } from "supertokens-node/types";
// import Dashboard from "supertokens-node/recipe/dashboard";
// import UserRoles from "supertokens-node/recipe/userroles";
// import config from "./env";

// export const SuperTokensConfig: TypeInput = {
//   supertokens: {
//     // this is the location of the SuperTokens core.
//     connectionURI: config.SuperTokensUrl,
//     apiKey: config.SuperTokensApiKey,
//   },
//   appInfo: {
//     appName: "w9-io",
//     apiDomain: config.ApiUrl,
//     websiteDomain: config.AppUrl,
//   },
//   // recipeList contains all the modules that you want to
//   // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
//   recipeList: [
//     ThirdPartyEmailPassword.init({
//       providers: [
//         {
//           config: {
//             thirdPartyId: "google",
//             clients: [
//               {
//                 clientId: process.env.GOOGLE_CLIENT_ID,
//                 clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//               },
//             ],
//           },
//         },
//         {
//           config: {
//             thirdPartyId: "apple",
//             clients: [
//               {
//                 clientId: process.env.APPLE_CLIENT_ID,
//                 additionalConfig: {
//                   keyId: process.env.APPLE_KEY_ID,
//                   privateKey: process.env.APPLE_PRIVATE_KEY,
//                   teamId: process.env.APPLE_TEAM_ID,
//                 },
//               },
//             ],
//           },
//         },
//       ],
//       // Override default APIs to handle custom form fields
//       override: {
//         apis: (originalImplementation) => {
//           return {
//             ...originalImplementation,
//             emailPasswordSignUpPOST: async function (input) {
//               // Extract custom fields from the request
//               const formFields = input.formFields;
//               const name = formFields.find((f) => f.id === "name")?.value;
//               const phone = formFields.find((f) => f.id === "phone")?.value;

//               // Call the original implementation
//               let response =
//                 await originalImplementation.emailPasswordSignUpPOST(input);

//               if (response.status === "OK") {
//                 // Save additional user data to your database
//                 await saveUserProfile(response.user.id, {
//                   name,
//                   phone,
//                   email: response.user.email,
//                 });
//               }

//               return response;
//             },
//           };
//         },
//       },
//     }),
//     Session.init(),
//     Dashboard.init(),
//     UserRoles.init(),
//   ],
// };

// const supertokens = require("supertokens-node");
// const EmailPassword = require("supertokens-node/recipe/emailpassword");
// const ThirdPartyEmailPassword = require("supertokens-node/recipe/thirdpartyemailpassword");
// const Session = require("supertokens-node/recipe/session");

// supertokens.init({
//     framework: "express",
//     supertokens: {
//         connectionURI: "https://try.supertokens.com", // Replace with your core URL
//         // apiKey: process.env.SUPERTOKENS_API_KEY, // Only needed for managed service
//     },
//     appInfo: {
//         appName: "W9.io",
//         apiDomain: "http://localhost:3001", // Your API domain
//         websiteDomain: "http://localhost:3000", // Your frontend domain
//         apiBasePath: "/auth",
//         websiteBasePath: "/auth"
//     },
//     recipeList: [
//         ThirdPartyEmailPassword.init({
//             providers: [
//                 {
//                     config: {
//                         thirdPartyId: "google",
//                         clients: [{
//                             clientId: process.env.GOOGLE_CLIENT_ID,
//                             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//                         }]
//                     }
//                 },
//                 {
//                     config: {
//                         thirdPartyId: "apple",
//                         clients: [{
//                             clientId: process.env.APPLE_CLIENT_ID,
//                             additionalConfig: {
//                                 keyId: process.env.APPLE_KEY_ID,
//                                 privateKey: process.env.APPLE_PRIVATE_KEY,
//                                 teamId: process.env.APPLE_TEAM_ID,
//                             }
//                         }]
//                     }
//                 }
//             ],
//             // Override default APIs to handle custom form fields
//             override: {
//                 apis: (originalImplementation) => {
//                     return {
//                         ...originalImplementation,
//                         emailPasswordSignUpPOST: async function (input) {
//                             // Extract custom fields from the request
//                             const formFields = input.formFields;
//                             const name = formFields.find(f => f.id === "name")?.value;
//                             const phone = formFields.find(f => f.id === "phone")?.value;

//                             // Call the original implementation
//                             let response = await originalImplementation.emailPasswordSignUpPOST(input);

//                             if (response.status === "OK") {
//                                 // Save additional user data to your database
//                                 await saveUserProfile(response.user.id, {
//                                     name,
//                                     phone,
//                                     email: response.user.email
//                                 });
//                             }

//                             return response;
//                         }
//                     };
//                 }
//             }
//         }),
//         Session.init()
//     ]
// });

// // Function to save additional user data
// async function saveUserProfile(userId, userData) {
//     // Implement your database logic here
//     // For example, using Prisma, MongoDB, or any other database
//     console.log("Saving user profile:", { userId, userData });

//     // Example with a hypothetical database
//     // await db.users.create({
//     //     id: userId,
//     //     name: userData.name,
//     //     phone: userData.phone,
//     //     email: userData.email
//     // });
// }
