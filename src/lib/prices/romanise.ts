export function romanise(num: number): string {
    if (num < 1 || num > 3999) {
        throw new Error('Input number must be between 1 and 3999');
    }

    const romanNumerals: { [key: number]: string } = {
        1000: 'M',
        900: 'CM',
        500: 'D',
        400: 'CD',
        100: 'C',
        90: 'XC',
        50: 'L',
        40: 'XL',
        10: 'X',
        9: 'IX',
        5: 'V',
        4: 'IV',
        1: 'I'
    };

    let result = '';
    for (const value of Object.keys(romanNumerals).map(Number).sort((a, b) => b - a)) {
        while (num >= value) {
            result += romanNumerals[value];
            num -= value;
        }
    }

    return result;
}