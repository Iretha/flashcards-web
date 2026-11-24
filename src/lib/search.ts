export const quoteSearch = (value: string) => '"' + value.replaceAll('"', '""') + '"';
