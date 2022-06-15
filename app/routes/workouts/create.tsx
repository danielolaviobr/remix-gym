import { XIcon } from "@heroicons/react/outline";
import type { Exercise } from "@prisma/client";
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import * as React from "react";
import useMeasure from "react-use-measure";
import { exerciseCookies } from "~/cookies.server";
import { prisma } from "~/db.server";
import { getUserId } from "~/session.server";
import { useCurrentRoutePath } from "~/utils";
import type { PanInfo } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useAnimation } from "framer-motion";
import { motion } from "framer-motion";
import usePrevious from "~/hooks/usePrevious";

interface ExerciseWithKey extends Exercise {
  key: string;
}

type LoaderData = {
  exercises: ExerciseWithKey[];
};

type Actions = {
  [key: string]: (request: Request, formData: FormData) => Promise<Response>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");

  let { exercises } = (await exerciseCookies.parse(cookieHeader)) || {};

  exercises = exercises || [];

  const cookies = await exerciseCookies.serialize({
    exercises: exercises || [],
  });

  return json<LoaderData>(
    { exercises },
    {
      headers: {
        "Set-Cookie": cookies,
      },
    }
  );
};

const actions: Actions = {
  remove: async (request, formData) => {
    const cookieHeader = request.headers.get("Cookie");

    const { exercises } = (await exerciseCookies.parse(cookieHeader)) || {};

    const key = formData.get("key");
    const filteredExercises = exercises.filter(
      (exercise: ExerciseWithKey) => key !== exercise.key
    );

    const cookies = await exerciseCookies.serialize({
      exercises: filteredExercises || [],
    });

    return json<LoaderData>(
      { exercises: filteredExercises },
      {
        headers: {
          "Set-Cookie": cookies,
        },
      }
    );
  },
  create: async (request, formData) => {
    const userId = await getUserId(request);

    if (!userId) throw new Error("No user found");

    const cookieHeader = request.headers.get("Cookie");
    const title = formData.get("title") as string;

    const requestExercises = formData.get("exercises") as string;
    const { exercises } =
      (await exerciseCookies.parse(cookieHeader)) ||
      JSON.parse(requestExercises) ||
      ([] as Exercise[]);

    if (!exercises.length) throw new Error("No exercises found");

    const workout = await prisma.workout.create({
      data: {
        title,
        userId: userId,
        exercises: {
          connect: exercises.map((exercise: Exercise) => ({ id: exercise.id })),
        },
      },
    });

    return redirect(`/workouts/${workout.id}`, {
      headers: {
        "Set-Cookie": await exerciseCookies.serialize({
          exercises: [],
        }),
      },
    });
  },
};

export const action: ActionFunction = async ({ request, context, params }) => {
  const formData = await request.formData();
  const _action = formData.get("_action") as string;
  const action = actions[_action];
  if (!action) throw new Error("No action found");

  const result = await action(request, formData);

  return result;
};

export default function Create() {
  const loader = useLoaderData<LoaderData>();
  const action = useActionData();
  const currentRoutePath = useCurrentRoutePath();
  const isExerciseCreatePage = currentRoutePath?.includes("exercise");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultTitle = params.get("workout") || "";
  const [queryParams, setQueryParams] = React.useState("");
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const [headingRef, { height: headingHeight }] = useMeasure();

  function updateQuery(event: React.FocusEvent<HTMLInputElement>) {
    const title = event.target.value;
    if (!title) return;
    const searchParams = new URLSearchParams({ workout: title });
    setQueryParams(searchParams.toString());
    navigate(`?${searchParams}`);
  }

  return (
    <div className="h-header-offset pt-6 sm:mt-0 standalone:h-standalone-header-offset">
      <div className="h-full md:grid md:grid-cols-3 md:gap-6">
        <div ref={headingRef} className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Crie a sua série
            </h3>
            <p className="pt-1 text-sm text-gray-600">
              Adicione exercícios já existentes ou crie novos
            </p>
          </div>
        </div>
        <div
          className="h-full md:col-span-2 md:mt-0"
          style={{ height: `calc(100% - ${headingHeight || 48}px)` }}>
          {isExerciseCreatePage ? (
            <Outlet />
          ) : (
            <div className="h-full overflow-hidden sm:rounded-md">
              <div className="flex h-full flex-col justify-between bg-white px-4 py-5 sm:p-6">
                <div className="grid grid-cols-6 gap-6 ">
                  <Form method="post" className="col-span-6 sm:col-span-3">
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700">
                        Nome da série
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        defaultValue={defaultTitle}
                        onBlur={updateQuery}
                        autoComplete="workout-title"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-1 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <input
                      name="exercises"
                      readOnly
                      value={JSON.stringify(loader.exercises)}
                      className="hidden"
                      type="hidden"
                    />
                    <button
                      className="hidden"
                      ref={submitButtonRef}
                      type="submit"
                      value="create"
                      name="_action"
                    />
                  </Form>
                  <div className="col-span-6 text-left sm:col-span-3">
                    <h4 className="text-lg font-semibold leading-6 text-gray-900">
                      Exercícios
                    </h4>
                    {loader.exercises.length > 0 ? (
                      <ol className="space-y-2 pt-4">
                        {loader.exercises.map((exercise) => (
                          <ExerciseItem
                            key={exercise.key}
                            exercise={exercise}
                          />
                        ))}
                      </ol>
                    ) : (
                      <span className="pt-1 text-sm text-gray-400">
                        Clique em{" "}
                        <Link
                          to={`exercise/?${queryParams}`}
                          className="text-blue-500 underline">
                          Adicionar exercício
                        </Link>{" "}
                        para montar sua série
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col space-y-2 self-end py-3 text-right sm:px-6">
                  <Link
                    to={`exercise/?${queryParams}`}
                    className="inline-flex items-center justify-center rounded border border-transparent bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Adicionar exerício
                  </Link>
                  <button
                    type="button"
                    onClick={() => submitButtonRef.current?.click()}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  exercise: ExerciseWithKey;
}

function ExerciseItem({ exercise }: Props) {
  const fetcher = useFetcher();
  const deleteRef = React.useRef<HTMLButtonElement>(null);
  const isDeleting =
    fetcher.submission?.formData.get("exerciseId") === exercise.id ||
    fetcher.state === "loading";
  const [buttonRef, { width }] = useMeasure();
  const [visible, setVisible] = React.useState(false);
  const controls = useAnimation();
  const previous = usePrevious(visible);

  function handleDragEnd(
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) {
    const shouldShow = info.offset.x <= -120;
    if (shouldShow) {
      console.log("show");
      controls.start("visible");
      deleteRef.current?.focus();
    } else {
      controls.start("hidden");
    }
  }

  function handleDeleteBlur() {
    setVisible(false);
    controls.start("hidden");
  }

  React.useEffect(() => {
    if (previous && !visible) {
      controls.start("hidden");
    } else if (!previous && visible) {
      controls.start("visible");
    }
  }, [controls, previous, visible]);

  return (
    <AnimatePresence>
      {!isDeleting && (
        <fetcher.Form
          method="post"
          className={`relative -mx-4 flex items-center  justify-between  ${
            isDeleting && "hidden"
          }`}>
          <motion.li
            className="z-10 flex w-full justify-between bg-white pl-4"
            drag="x"
            onDragEnd={handleDragEnd}
            dragConstraints={{ left: 0, right: 0 }}
            dragSnapToOrigin
            initial="hidden"
            exit="exit"
            animate={controls}
            transition={{
              type: "spring",
              damping: 40,
              stiffness: 400,
            }}
            variants={{
              visible: { x: -width },
              hidden: { x: 0 },
              exit: {
                x: "80%",
                opacity: 0,
                transition: { duration: 0.3, ease: [0.17, 0.67, 0.83, 0.67] },
              },
            }}>
            <section>
              <span className="font-medium text-gray-600">{exercise.name}</span>
              <p className="text-xs font-medium text-gray-400">
                {exercise.load}
                {exercise.unity} - {exercise.repetitions}x
              </p>
            </section>
            <input type="hidden" name="key" value={exercise.key} />
          </motion.li>
          <motion.button
            exit={{
              x: "100%",
              opacity: 0,
              transition: { duration: 0.05 },
            }}
            type="submit"
            name="_action"
            value="remove"
            ref={buttonRef}
            aria-label="remove"
            className="absolute right-0 border-none bg-red-500 px-2 py-2 text-white outline-none">
            Remover
          </motion.button>
          <button
            ref={deleteRef}
            onFocus={() => {
              console.log("on focus");
            }}
            onBlur={handleDeleteBlur}
            className="border-none text-white outline-none"
          />
        </fetcher.Form>
      )}
    </AnimatePresence>
  );
}
