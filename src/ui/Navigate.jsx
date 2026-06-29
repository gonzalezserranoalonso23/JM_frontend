import { Link, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/auth";

const Navigate = () => {
  const logOut = useAuthStore((state) => state.logOut);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const navigate = useNavigate();
  const handleLogOut = () => {
    logOut();
    toast.success("Cierre de sesión exitoso!");
    navigate("/");
  };

  return (
    <>
      <Navbar expand="lg" bg="dark" data-bs-theme="dark">
        <Container>
          <Link to={"../home"} className="navbar-brand d-flex">
            <div className="mx-1">JM Panel</div>
          </Link>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto">
              <Link className="nav-link" to={"../home"}>
                Inicio
              </Link>
              <Link className="nav-link" to={"../issues"}>
                Salidas
              </Link>
              <Link className="nav-link" to={"../entries"}>
                Entradas
              </Link>
              <Link className="nav-link" to={"../orders"}>
                Ordenes
              </Link>
              <Link className="nav-link" to={"../todolist"}>
                Pendientes
              </Link>
              <Link className="nav-link" to={"../reports"}>
                Reportes
              </Link>
              {isAdmin ? (
                <>
                  <Link className="nav-link" to={"../catalogs"}>
                    Catalogo
                  </Link>
                  <Link className="nav-link" to={"../users"}>
                    Usuarios
                  </Link>
                </>
              ) : null}
            </Nav>
            <Button variant="warning" onClick={() => handleLogOut()}>
              Cerrar Sesión
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};
export default Navigate;
