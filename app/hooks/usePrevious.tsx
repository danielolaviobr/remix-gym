import * as React from "react";

export default function usePrevious<T>(state: T): T | null {
  let [tuple, setTuple] = React.useState<[T | null, T]>([null, state]);

  if (tuple[1] !== state) {
    setTuple([tuple[1], state]);
  }

  return tuple[0];
}
