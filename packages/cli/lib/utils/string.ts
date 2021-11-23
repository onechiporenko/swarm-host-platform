export const STRING_CAMELIZE_REGEXP_1 = /(-|_|\.|\s)+(.)?/g;
export const STRING_CAMELIZE_REGEXP_2 = /(^|\/)([A-Z])/g;

export const camelize = (str: string): string =>
  str
    .replace(STRING_CAMELIZE_REGEXP_1, (_match, _separator, chr) =>
      chr ? chr.toUpperCase() : ''
    )
    .replace(STRING_CAMELIZE_REGEXP_2, (match /*, separator, chr */) =>
      match.toLowerCase()
    );

const STRING_CLASSIFY_REGEXP_1 = /^(-|_)+(.)?/;
const STRING_CLASSIFY_REGEXP_2 = /(.)(-|_|\.|\s)+(.)?/g;
const STRING_CLASSIFY_REGEXP_3 = /(^|\/|\.)([a-z])/g;

export const classify = (str: string): string => {
  const replace1 = (_match: string, _separator: string, chr: string) =>
    chr ? `_${chr.toUpperCase()}` : '';
  const replace2 = (
    _match: string,
    initialChar: string,
    _separator: string,
    chr: string
  ) => initialChar + (chr ? chr.toUpperCase() : '');
  const parts = str.split('/');
  for (let i = 0; i < parts.length; i++) {
    parts[i] = parts[i]
      .replace(STRING_CLASSIFY_REGEXP_1, replace1)
      .replace(STRING_CLASSIFY_REGEXP_2, replace2);
  }
  return parts
    .join('/')
    .replace(STRING_CLASSIFY_REGEXP_3, (match /*, separator, chr */) =>
      match.toUpperCase()
    );
};
