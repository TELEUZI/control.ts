const base64Regex =
  /^(data:image\/(png|jpeg|webp|gif|avif);base64,)([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

export const isBase64Url = (value: unknown): value is string => {
  return typeof value === 'string' && base64Regex.test(value);
};
