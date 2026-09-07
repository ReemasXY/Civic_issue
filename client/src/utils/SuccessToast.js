import { toast, Bounce } from 'react-toastify';

const successToast = (msg) => {
    if (Array.isArray(msg)) {
        msg.forEach((m) => successToast(m));
        return;
    }

    toast.success(msg, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    });
}

export default successToast;
