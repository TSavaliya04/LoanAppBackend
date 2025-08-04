import Button from "@mui/material/Button";
import { ReactNode } from "react";

interface AuthButtonProps {
  text: string; // Button text
  icon?: ReactNode; // Optional icon name
  onClick?: () => void; // Click handler
  type?: "button" | "submit" | "reset"; // Button type
}

const AuthButton: React.FC<AuthButtonProps> = ({
  text,
  icon,
  onClick,
  type = "button",
}) => {
  return (
    <Button
      variant="contained"
      startIcon={icon ? icon : undefined}
      sx={{
        width: "122px",
        height: "48px",
        borderRadius: "100px",
        backgroundColor: "primary.main",
        "&:hover": {
          backgroundColor: "common.black",
        },
        fontSize: "16px",
        fontWeight: "bold",
        textTransform: "capitalize",
      }}
      onClick={onClick}
      type={type}
    >
      {text}
    </Button>
  );
};

export default AuthButton;
