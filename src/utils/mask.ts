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

export const maskCpf = (value: string) => {
  if (value.length === 0) return "";
  const filteredNumber = value.replace(/\D/g, "");

  const firstSection =
    filteredNumber.length >= 3 ? filteredNumber.slice(0, 3) : filteredNumber;
  const secondSection =
    filteredNumber.length >= 6
      ? filteredNumber.substring(3, 6)
      : filteredNumber.substring(3);
  const thirdSection =
    filteredNumber.length >= 9
      ? filteredNumber.substring(6, 9)
      : filteredNumber.substring(6);
  const fourthSection = filteredNumber.substring(9);

  return `${firstSection}.${secondSection}.${thirdSection}-${fourthSection}`;
};

export const formatCEP = (value: string) => {
  if (value.length === 0) return "";
  const filteredNumber = value.replace(/\D/g, "");

  const firstSection =
    filteredNumber.length >= 5 ? filteredNumber.slice(0, 5) : filteredNumber;
  const secondSection = filteredNumber.substring(5);

  return `${firstSection}-${secondSection}`;
};
