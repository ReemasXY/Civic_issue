import React from 'react'
import { ToastContainer, Bounce } from 'react-toastify';

const Toast = () => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
  )
}

export default Toast