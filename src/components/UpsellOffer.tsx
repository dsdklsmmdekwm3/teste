import { useState } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, Wrench } from "lucide-react";

interface UpsellOfferProps {
  title?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  imageUrl?: string;
  onToggle?: (added: boolean) => void;
  buttonClassName?: string;
}

export const UpsellOffer = ({ 
  title = "⚠️ Manutenção em Andamento",
  description = "Estamos realizando melhorias no sistema. Esta oferta estará disponível em breve. Agradecemos sua compreensão.",
  price = "197,00",
  originalPrice = "297,00",
  imageUrl = "https://via.placeholder.com/80x80",
  onToggle,
  buttonClassName
}: UpsellOfferProps) => {
  const [added, setAdded] = useState(false);
  
  const handleToggle = () => {
    const newAdded = !added;
    setAdded(newAdded);
    onToggle?.(newAdded);
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-5 mb-4 shadow-lg">
      <div className="flex gap-4 mb-3">
        {/* Ícone de manutenção */}
        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-400 dark:bg-yellow-600 rounded-full flex items-center justify-center">
          <Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-900 dark:text-yellow-100" />
        </div>
        {/* Descrição do lado */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-base font-bold text-yellow-900 dark:text-yellow-100">
              {title}
            </h3>
          </div>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
            {description}
          </p>
      </div>
      </div>
      
      {/* Valor e botão embaixo */}
      <div className="flex items-center justify-between pt-3 border-t border-yellow-300 dark:border-yellow-700">
        <div>
          <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">R$ {price}</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 line-through">R$ {originalPrice}</p>
        </div>
        <Button
          onClick={handleToggle}
          variant={added ? "secondary" : "default"}
          size="sm"
          className={buttonClassName || "rounded-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900"}
          disabled
        >
          Indisponível
        </Button>
      </div>
    </div>
  );
};
