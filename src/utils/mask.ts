export const maskPhoneNumber = (value: string) => {
  if (value.length === 0) return "";
  const filteredNumber = value.replace(/\D/g, "");

  const ddd =
    filteredNumber.length >= 2 ? filteredNumber.slice(0, 2) : filteredNumber;
  let digit = "";
  let firstSection =
    filteredNumber.length >= 6
      ? filteredNumber.substring(2, 6)
      : filteredNumber.substring(2);
  let secondSection = filteredNumber.substring(6);

  if (filteredNumber.length === 11) {
    digit = filteredNumber.substring(2, 3);
    firstSection = filteredNumber.substring(3, 7);
    secondSection = filteredNumber.substring(7);
  }

  return digit
    ? `(${ddd}) ${digit} ${firstSection}-${secondSection}`
    : `(${ddd}) ${firstSection}-${secondSection}`;
};
