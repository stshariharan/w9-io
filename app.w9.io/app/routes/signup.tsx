import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  // No data needed, just return an empty response
  return new Response(null, { status: 200 });
}

export default function SignUp() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="max-w-sm w-full bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">Sign In</h1>
        <Form method="post" className="space-y-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Sign In
          </button>
        </Form>
      </div>
    </div>
  );
}
