import getMinionTypes from "$lib/auctions/getMinionTypes.js";

export default function getMinionTypesAutocompleteStyle(): {
  name: string;
  value: string;
}[] {
  const minionTypes = getMinionTypes();
  if (!minionTypes) return [];
  return minionTypes.map((minionType) => ({
    name: minionType,
    value: minionType.toLowerCase()
  }));
}
