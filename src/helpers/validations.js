import { toast } from "react-hot-toast";
export const verifyLogin = (values) => {
  if (!values.username) return toast.error("El usuario es requerido");
  if (values.username.length < 4)
    return toast.error("El usuario debe contener al menos 5 caracteres");
  if (values.username.includes(" "))
    return toast.error("El usuario no debe incluir espacios");
  if (!values.password) return toast.error("El password es requerido");
  if (values.password.length < 8)
    return toast.error("El password debe contener al menos 8 caracteres");
  if (values.username.includes(" "))
    return toast.error("El password no debe incluir espacios");
};
