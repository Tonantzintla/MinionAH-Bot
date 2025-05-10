import { romanise } from "$lib/prices/romanise.js";

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// strings joined with _ and then "GENERATOR_{level}". example "ACACIA_GENERATOR_1". transform to "Acacia I"
export default function parseMinionType(type: string) {
  try {
    const parts = type.split("_");
    if (parts.length < 3)
      throw new Error("Invalid type on /prices's parseType. Received: " + type);
    const level = parseInt(parts.pop()!);
    const name = parts
      .slice(0, parts.length - 1)
      .map(capitalize)
      .join(" ");
    return name + " " + romanise(level);
  } catch (error) {
    console.error("Error in parseType: ", error);
    return type;
  }
}
