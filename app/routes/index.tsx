import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getUserId } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/workouts");
  return json({});
};

export default function Index() {
  return (
    <div className="flex h-screen flex-col justify-between py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="bg-gradient-to-r from-blue-500  to-purple-500 bg-clip-text text-center text-5xl font-extrabold leading-relaxed text-transparent">
          Gym App
        </h1>
        <h2 className="mt-2 text-center text-xl font-extrabold text-gray-400">
          Evolua junto dos seus amigos
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="space-y-4 bg-white py-8 px-4 sm:rounded-lg sm:px-10">
          <div>
            <Link
              to="/login"
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Acessar minha conta
            </Link>
          </div>
          <div>
            <Link
              to="/join"
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-200 py-2 px-4 text-sm font-medium text-blue-600 shadow-sm hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Me cadastrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
