export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const defaultOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat('id-ID', defaultOptions).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  return formatDate(dateString, { hour: '2-digit', minute: '2-digit' });
};

export const formatAssetCode = (code) => {
  if (!code) return '-';
  return code;
};
