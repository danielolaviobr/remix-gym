import { PlusIcon } from "@heroicons/react/solid";
import type { Workout } from "@prisma/client";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useMatches,
} from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { match } from "assert";
import * as React from "react";
import { exerciseCookies } from "~/cookies.server";
import { prisma } from "~/db.server";
import { getUserId } from "~/session.server";
import { useCurrentRoutePath, useMatchesData } from "~/utils";

type LoaderData = {
  workouts: Workout[];
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  if (!userId)
    redirect("/", {
      headers: {
        "Set-Cookie": await exerciseCookies.serialize({}),
      },
    });

  const workouts = (await prisma.workout.findMany({ where: { userId } })) || [];

  return json<LoaderData>({ workouts });
};

const WORKOUT_ID = "routes/workouts/$workout";
const WORKOUT_PATH = "/workouts";

export default function Workouts() {
  const data = useMatchesData(WORKOUT_ID);
  const currentRoutePath = useCurrentRoutePath();
  const loader = useLoaderData<LoaderData>();

  const isCreateRoute = !data?.workout && currentRoutePath?.includes("/create");

  return (
    <>
      <header className="flex h-16 items-center justify-between bg-neutral-900 p-4">
        <h1
          className={`${
            currentRoutePath !== WORKOUT_PATH
              ? "mb-[4px]"
              : "border-b-4 border-blue-500"
          } text-3xl font-extrabold text-white`}>
          <Link to="/workouts" className="p-1 outline-blue-600">
            Gym App
          </Link>
        </h1>
        <Form action="/logout">
          <button
            type="submit"
            className="px-1 text-lg font-semibold text-neutral-500 outline-blue-600 active:hover:text-white">
            Sign out
          </button>
        </Form>
      </header>
      <nav className="h-12 overflow-y-hidden bg-neutral-900 text-neutral-400">
        <ul className="flex h-12 snap-x items-center space-x-5 overflow-y-hidden overflow-x-scroll px-4 text-lg font-semibold">
          {loader.workouts.map((workout) => (
            <li
              key={workout.id}
              className={`flex h-full min-w-fit snap-center items-center ${
                data?.workout === workout.id
                  ? "border-b-4 border-blue-500 text-white"
                  : "mb-[4px]"
              }`}>
              <Link to={`${workout.id}`} className="p-2 outline-blue-600">
                {workout.title}
              </Link>
            </li>
          ))}
          <li
            className={`flex h-full min-w-fit snap-center items-center ${
              isCreateRoute
                ? "border-b-4 border-blue-500 text-white"
                : "mb-[4px]"
            }`}>
            <Link to="create" className="flex items-center outline-blue-600">
              <PlusIcon className="mr-2 h-4 w-4" />
              Adicionar
            </Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}
