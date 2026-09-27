import { Link, useLocation } from "react-router-dom";
import { Carrot, ShoppingCart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface StockNavTabsProps {
  stockCount?: number;
  shoppingCount?: number;
}

export const StockNavTabs = ({ stockCount, shoppingCount }: StockNavTabsProps) => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const isStock = location.pathname.startsWith("/stock");
  const isShopping = location.pathname.startsWith("/shopping-list");

  return (
    <div className="flex p-1 bg-black/15 backdrop-blur-xs rounded-xl max-w-md w-full">
      <Link
        to="/stock"
        onMouseEnter={() => queryClient.prefetchQuery({ queryKey: ["stock"] })}
        onPointerDown={() => queryClient.prefetchQuery({ queryKey: ["stock"] })}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
          isStock
            ? "bg-white text-primary shadow-xs"
            : "text-white/80 hover:text-white hover:bg-white/10"
        }`}
      >
        <Carrot className="w-3.5 h-3.5" />
        <span>Ingrédients{typeof stockCount === "number" && stockCount > 0 ? ` (${stockCount})` : ""}</span>
      </Link>

      <Link
        to="/shopping-list"
        onMouseEnter={() => queryClient.prefetchQuery({ queryKey: ["shopping-list"] })}
        onPointerDown={() => queryClient.prefetchQuery({ queryKey: ["shopping-list"] })}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
          isShopping
            ? "bg-white text-primary shadow-xs"
            : "text-white/80 hover:text-white hover:bg-white/10"
        }`}
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        <span>Courses{typeof shoppingCount === "number" && shoppingCount > 0 ? ` (${shoppingCount})` : ""}</span>
      </Link>
    </div>
  );
};
