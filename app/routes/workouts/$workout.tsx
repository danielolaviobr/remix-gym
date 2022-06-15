import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as React from "react";

export const loader: LoaderFunction = async ({ params }) => {
  return json({ workout: params.workout });
};

export default function Workout() {
  const loader = useLoaderData();

  return (
    <div className="flex flex-col">
      number {loader.workout}
      <span className="border border-gray-700 text-green-700">Hello</span>
    </div>
  );
}
