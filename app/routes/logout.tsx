import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { exerciseCookies } from "~/cookies.server";

import { logout } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export const loader: LoaderFunction = async ({ request }) => {
  return logout(request);
};
