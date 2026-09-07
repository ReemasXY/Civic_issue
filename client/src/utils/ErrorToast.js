
import {  toast , Bounce} from 'react-toastify';
const errToast = (msg) => {
    console.log("called")
    toast.error(msg, {
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
export default errToast