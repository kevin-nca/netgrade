export const validateSubjectName = (value: string): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return 'Fachname ist erforderlich';
  }
  if (trimmed.length < 2) {
    return 'Fachname muss mindestens 2 Zeichen lang sein';
  }
  if (trimmed.length > 100) {
    return 'Fachname darf maximal 100 Zeichen lang sein';
  }
  return undefined;
};

export const validateSchoolName = (value: string): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return 'Schulname ist erforderlich';
  }
  if (trimmed.length < 2) {
    return 'Schulname muss mindestens 2 Zeichen lang sein';
  }
  if (trimmed.length > 200) {
    return 'Schulname darf maximal 200 Zeichen lang sein';
  }
  return undefined;
};

export const validateUserName = (value: string): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return 'Name ist erforderlich';
  }
  if (trimmed.length < 1) {
    return 'Name muss mindestens 1 Zeichen lang sein';
  }
  if (trimmed.length > 50) {
    return 'Name darf maximal 50 Zeichen lang sein';
  }
  return undefined;
};

export const validateSearchText = (value: string): string | undefined => {
  if (value && value.length > 100) {
    return 'Suchtext zu lang';
  }
  return undefined;
};
