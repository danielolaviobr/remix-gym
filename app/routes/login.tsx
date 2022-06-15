import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import * as React from "react";
import Spinner from "~/components/Spinner";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/workouts");
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const remember = formData.get("remember");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/workouts");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json<ActionData>(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json<ActionData>(
      { errors: { email: "Invalid email or password" } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData() as ActionData;
  const redirectTo = searchParams.get("redirectTo") || "workouts";
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const transition = useTransition();

  const loading = React.useMemo(
    () => transition.state === "loading",
    [transition.state]
  );

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/">
            <h1 className="bg-gradient-to-r from-blue-500  to-purple-500 bg-clip-text text-center text-5xl font-extrabold leading-relaxed text-transparent">
              Gym App
            </h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesse a sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ou{" "}
            <Link
              to={{
                pathname: "/join",
                search: searchParams.toString(),
              }}
              className="font-medium text-blue-600 hover:active:text-blue-500"
            >
              clique aqui para criar a sua conta
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 sm:rounded-lg sm:px-10">
            <Form className="space-y-6" method="post">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    ref={emailRef}
                    name="email"
                    type="email"
                    autoFocus={true}
                    autoComplete="email"
                    required
                    aria-invalid={actionData?.errors?.email ? true : undefined}
                    aria-describedby="email-error"
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  {actionData?.errors?.email && (
                    <span
                      className="pt-1 text-sm text-red-500"
                      id="email-error"
                    >
                      {actionData.errors.email}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    ref={passwordRef}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={
                      actionData?.errors?.password ? true : undefined
                    }
                    aria-describedby="password-error"
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  {actionData?.errors?.password && (
                    <div
                      className="pt-1 text-sm text-red-500"
                      id="password-error"
                    >
                      {actionData.errors.password}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Lembre de mim
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to={{
                      pathname: "/forgot-password",
                      search: searchParams.toString(),
                    }}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </div>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? <Spinner className="text-blue-100" /> : "Entrar"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
