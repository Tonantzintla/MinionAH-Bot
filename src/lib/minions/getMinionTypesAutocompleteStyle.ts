import getMinionTypes from "$lib/auctions/getMinionTypes.js";

export default async function getMinionTypesAutocompleteStyle(): Promise<{ name: string, value: string }[]> {
    const minionTypes = await getMinionTypes();
    if (!minionTypes) return [];
    return minionTypes.map(minionType => ({
        name: minionType,
        value: minionType.toLowerCase()
    }))
}