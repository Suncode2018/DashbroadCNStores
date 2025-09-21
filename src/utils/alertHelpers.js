import Swal from 'sweetalert2';

export const showSuccessAlert = (title, text) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#4caf50',
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showErrorAlert = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#f44336',
  });
};

export const showWarningAlert = (title, text, showRetryButton = false) => {
  const config = {
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#ff9800',
  };

  if (showRetryButton) {
    config.showCancelButton = true;
    config.cancelButtonText = 'ลองใหม่';
    config.cancelButtonColor = '#1976d2';
  }

  return Swal.fire(config);
};

export const showInfoAlert = (title, text) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#1976d2',
  });
};