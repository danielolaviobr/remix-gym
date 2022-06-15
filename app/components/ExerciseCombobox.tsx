import { forwardRef, Fragment, useEffect, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  PlusIcon,
  SelectorIcon,
  XIcon,
} from "@heroicons/react/solid";
import type { Exercise } from "@prisma/client";
import { useTransition } from "@remix-run/react";

type Props = {
  data: Exercise[];
};

export default forwardRef(function ExerciseNameCombobox(
  { data: exercises }: Props,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [selected, setSelected] = useState<Exercise>();
  const [query, setQuery] = useState("");

  const filteredExercises =
    query === ""
      ? exercises
      : exercises.filter((exercise) =>
          exercise.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <Combobox value={selected} onChange={setSelected} name="exercise">
      <div className="relative mt-1">
        <div className="relative w-full cursor-default rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
          <Combobox.Input
            ref={ref}
            placeholder="Selecione"
            className="peer block w-full rounded-md border border-gray-300 p-2 shadow-sm file:mt-1 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            displayValue={(exercise: Exercise) => exercise?.name}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <SelectorIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}>
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredExercises.length === 0 && query === "" ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nenhum exercício criado
              </div>
            ) : filteredExercises.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nada encontrado
              </div>
            ) : (
              filteredExercises.map((exercise) => (
                <Combobox.Option
                  key={exercise.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={exercise}>
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}>
                        {exercise.name}
                      </span>
                      <p
                        className={`block truncate text-xs ${
                          selected ? "font-medium" : "font-normal"
                        }`}>
                        {exercise.load &&
                          `${exercise.load}${exercise.unity} - `}
                        {exercise.repetitions}x
                      </p>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-blue-600"
                          }`}>
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
});
