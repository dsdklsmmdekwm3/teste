import { ShoppingCart } from "lucide-react";

export const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border">
      <div className="px-4 py-2 border-2 border-primary rounded-full text-sm font-semibold text-foreground">
        Nutricionista Marina
      </div>
      <button className="p-2 hover:bg-muted rounded-full transition-colors">
        <ShoppingCart className="w-6 h-6 text-foreground" />
      </button>
    </header>
  );
};
