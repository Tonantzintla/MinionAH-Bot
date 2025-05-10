import { minionTypes, minionTypesRaw } from "$lib/minions/types";

export default function getMinionTypes(raw: boolean = false): readonly string[] {
  if (raw) {
    return minionTypesRaw;
  }
  return minionTypes;
}
