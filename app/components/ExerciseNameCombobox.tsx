import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, PlusIcon, SelectorIcon } from "@heroicons/react/solid";

type Props = {
  data: string[];
  required: boolean;
};

export default function ExerciseNameCombobox({
  data: exerciseNames,
  required,
}: Props) {
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");

  const filteredExerciseNames =
    query === ""
      ? exerciseNames
      : exerciseNames.filter((exerciseName) =>
          exerciseName
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative mt-1">
        <div className="relative w-full cursor-default rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
          <Combobox.Input
            required={required}
            id="exerciseName"
            name="exerciseName"
            placeholder="Selecione"
            className="peer block w-full rounded-md border border-gray-300 p-2 shadow-sm file:mt-1 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            displayValue={(exerciseName: string) => exerciseName}
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
            {filteredExerciseNames.length === 0 && query === "" ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Digite para criar um exercício
              </div>
            ) : filteredExerciseNames.length === 0 && query !== "" ? (
              <Combobox.Option
                value={query}
                className={(active) =>
                  `relative flex cursor-default select-none items-center space-x-2 py-2 px-4  ${
                    active ? "bg-blue-600 text-white" : "text-gray-700"
                  }`
                }>
                <PlusIcon className="h-4 w-4" />
                <span>Criar {query}</span>
              </Combobox.Option>
            ) : (
              filteredExerciseNames.map((exerciseName) => (
                <Combobox.Option
                  key={exerciseName}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={exerciseName}>
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}>
                        {exerciseName}
                      </span>
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
}
