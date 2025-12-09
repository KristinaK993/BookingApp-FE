import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext"; 
export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();            // rensar token + user
    navigate("/login");  // skickar användaren till login
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      Logga ut
    </Button>
  );
}
