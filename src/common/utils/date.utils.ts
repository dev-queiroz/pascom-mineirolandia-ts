export const combineDateWithCurrentTime = (dateStr: string): Date => {
  const date = new Date(dateStr);
  const now = new Date();

  date.setUTCHours(
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds(),
  );

  return date;
};

export const getCurrentTimeString = (): string => {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
