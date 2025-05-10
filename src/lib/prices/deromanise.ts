export default function deromanise(roman: string): number {
  const romanMap: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000
  };

  let result = 0;
  let prev = 0;
  for (const char of roman.split("").reverse()) {
    const value = romanMap[char];
    if (value < prev) {
      result -= value;
    } else {
      result += value;
    }
    prev = value;
  }

  return result;
}
