import { useRef } from "react";

export function useFixedRef<T>(t: T) {
  const current = useRef<T>(t);
  current.current = t;
  return current;
}
