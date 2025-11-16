import { useState } from "react";
import { LgpdModal } from "./LgpdModal";

export const Footer = () => {
  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);

  return (
    <>
      <footer className="py-6 text-center space-y-1">
        <p className="text-sm text-muted-foreground opacity-60">
          Compra segura
        </p>
        <p className="text-xs text-muted-foreground opacity-60">
          <button
            onClick={() => setIsLgpdModalOpen(true)}
            className="underline hover:text-foreground transition-colors cursor-pointer"
          >
            Segue conforme LGPD
          </button>
        </p>
        <p className="text-xs text-muted-foreground opacity-60">
          CNPJ: 30.173.425/0001-63
        </p>
      </footer>

      <LgpdModal 
        isOpen={isLgpdModalOpen} 
        onClose={() => setIsLgpdModalOpen(false)} 
      />
    </>
  );
};
