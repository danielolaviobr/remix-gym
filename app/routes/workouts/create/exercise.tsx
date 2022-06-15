import { XIcon } from "@heroicons/react/solid";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import * as React from "react";
import ExerciseNameCombobox from "~/components/ExerciseNameCombobox";
import { exerciseCookies } from "~/cookies.server";
import { prisma } from "~/db.server";
import { getUserId } from "~/session.server";
import ExerciseCombobox from "~/components/ExerciseCombobox";
import type { Exercise } from "@prisma/client";
import Spinner from "~/components/Spinner";
import qs from "qs";
import cuid from "cuid";

type LoaderData = {
  exercises: Exercise[];
  exerciseNames: string[];
};

export const action: ActionFunction = async ({ request }) => {
  const formQueryString = await request.text();
  const formData = qs.parse(formQueryString);

  const workout = formData.workout?.toString() || "";
  let exercise;

  const action = formData._action;

  if (action === "create") {
    const name = formData.exerciseName?.toString();
    const unity = formData.unity?.toString();
    const load = formData.load === "" ? null : Number(formData.load);
    const repetitions =
      formData.repetitions === "" ? null : Number(formData.repetitions);
    const userId = await getUserId(request);

    if (!userId || !name) {
      throw new Error("Missing data");
    }

    const serverExercise = await prisma.exercise.create({
      data: {
        name,
        load,
        unity,
        repetitions,
        user: { connect: { id: userId } },
        workouts: {},
      },
    });

    exercise = { ...serverExercise, key: cuid() };
  } else if (action === "add") {
    const formExercise = formData.exercise as qs.ParsedQs;
    const id = formExercise.id as string;

    if (!formExercise || !id) throw new Error("Invalid exercise");

    const serverExercise = await prisma.exercise.findUnique({
      where: {
        id,
      },
    });

    if (!serverExercise) throw new Error("Exercise not found");

    exercise = { ...serverExercise, key: cuid() };
  }

  const searchParams = new URLSearchParams({ workout });

  const cookieHeader = request.headers.get("Cookie");

  const { exercises } = await exerciseCookies.parse(cookieHeader);

  return redirect(`/workouts/create/?${searchParams}`, {
    headers: {
      "Set-Cookie": await exerciseCookies.serialize({
        exercises: [...exercises, exercise],
      }),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  const exercises = await prisma.exercise.findMany({ where: { userId } });
  const exercieseNamesSet = new Set<string>();
  exercises.forEach((exercise) => exercieseNamesSet.add(exercise.name));

  return json<LoaderData>({
    exercises: exercises || [],
    exerciseNames: [...exercieseNamesSet],
  });
};

export default function ExerciseForm() {
  const { exercises, exerciseNames } = useLoaderData<LoaderData>();
  const unityRef = React.useRef<HTMLSelectElement>(null);
  const addSubmitRef = React.useRef<HTMLButtonElement>(null);
  const createSubmitRef = React.useRef<HTMLButtonElement>(null);
  const exerciseRef = React.useRef<HTMLInputElement>(null);
  const [params] = useSearchParams();
  const workoutTitle = params.get("workout") ?? "";
  const searchParams = new URLSearchParams({ workout: workoutTitle });
  const transition = useTransition();

  function clearUnitySelection() {
    if (!unityRef?.current) return;
    unityRef.current.value = "";
  }

  function handleSubmit() {
    if (
      !exerciseRef.current ||
      !createSubmitRef.current ||
      !addSubmitRef.current
    )
      return;
    if (exerciseRef.current.value) {
      addSubmitRef.current.click();
    } else {
      createSubmitRef.current.click();
    }
  }

  return (
    <div className="overflow-hidden sm:rounded-md">
      <div className="bg-white px-4 py-5 sm:p-6">
        <div className="mb-2">
          <h5 className="text-lg font-medium leading-6 text-gray-900">
            Selecione um exercício
          </h5>
        </div>
        <div className="grid grid-cols-6 gap-6">
          <Form method="post" className="col-span-6 sm:col-span-4">
            <input readOnly name="workout" value={workoutTitle} hidden />
            <label
              htmlFor="exercise"
              className="block text-sm font-medium text-gray-700">
              Exercício
            </label>
            <ExerciseCombobox data={exercises} ref={exerciseRef} />
            <button hidden name="_action" value="add" ref={addSubmitRef} />
          </Form>
        </div>
        <div className="relative my-4">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Ou crie um novo</span>
          </div>
        </div>
        <Form method="post" className="grid grid-cols-6 gap-6">
          <div className="col-span-6 sm:col-span-3">
            <label
              htmlFor="exerciseName"
              className="block text-sm font-medium text-gray-700">
              Nome do exercício
            </label>
            <ExerciseNameCombobox data={exerciseNames} required />
          </div>

          <div className="col-span-6 sm:col-span-4">
            <label
              htmlFor="load"
              className="block text-sm font-medium text-gray-700">
              Carga
            </label>
            <input
              type="text"
              pattern="\d*"
              name="load"
              id="load"
              placeholder="30"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="col-span-6 sm:col-span-3">
            <label
              htmlFor="unity"
              className="block text-sm font-medium text-gray-700">
              Unidade
            </label>
            <div className="flex items-center space-x-2">
              <select
                id="unity"
                name="unity"
                ref={unityRef}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
                <option>kg</option>
                <option>lb</option>
              </select>
              <button
                type="button"
                className=" focus:outline-blue-500"
                onClick={clearUnitySelection}>
                <XIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="col-span-6 sm:col-span-3">
            <label
              htmlFor="repetitions"
              className="block text-sm font-medium text-gray-700">
              Repetições
            </label>
            <input
              type="text"
              pattern="\d*"
              name="repetitions"
              id="repetitions"
              placeholder="12"
              autoComplete="repetitions"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <input
            readOnly
            name="workout"
            value={workoutTitle}
            className="hidden"
          />
          <button
            hidden
            type="submit"
            name="_action"
            value="create"
            ref={createSubmitRef}
          />
        </Form>
        <div className="mt-6 grid grid-cols-6 gap-6">
          <div className="col-span-6 flex w-full flex-col space-y-2 self-end py-3 sm:col-span-3 sm:px-6">
            <Link
              to={`../?${searchParams}`}
              className="inline-flex justify-center rounded border border-transparent bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Cancelar
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {transition.state === "submitting" ? (
                <Spinner className="text-white" />
              ) : (
                "Adicionar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
