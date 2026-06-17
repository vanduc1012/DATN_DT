export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    ...options,
  });
};

export const formatTime = (time: string): string => {
  return time;
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { weekday: 'short' });
};

export const getDayNumber = (dateString: string): string => {
  const date = new Date(dateString);
  return date.getDate().toString();
};

export const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

export const generateDates = (days: number = 7): string[] => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);
  return endHour - startHour;
};

export const calculateTotalPrice = (
  pricePerHour: number,
  startTime: string,
  endTime: string
): number => {
  const hours = calculateHours(startTime, endTime);
  return pricePerHour * hours;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#f59e0b';
    case 'confirmed':
      return '#22c55e';
    case 'cancelled':
      return '#ef4444';
    case 'completed':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'cancelled':
      return 'Đã hủy';
    case 'completed':
      return 'Hoàn thành';
    case 'available':
      return 'Còn trống';
    case 'maintenance':
      return 'Bảo trì';
    default:
      return status;
  }
};

export const getPitchTypeLabel = (type: string): string => {
  switch (type) {
    case '5v5':
      return 'Sân 5 người';
    case '7v7':
      return 'Sân 7 người';
    case '11v11':
      return 'Sân 11 người';
    default:
      return type;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
