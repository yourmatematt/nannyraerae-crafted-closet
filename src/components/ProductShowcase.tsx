import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";

const ProductShowcase = () => {
  const products = [
    {
      id: 1,
      name: "Garden Bloom Dress",
      price: 89,
      originalPrice: null,
      image: productDress,
      badge: "New Arrival",
      badgeVariant: "default" as const,
      sizes: ["6m", "12m", "18m", "2T"],
      inStock: true,
    },
    {
      id: 2,
      name: "Woodland Explorer Romper",
      price: 65,
      originalPrice: null,
      image: productRomper,
      badge: "Best Seller",
      badgeVariant: "secondary" as const,
      sizes: ["3m", "6m", "12m", "18m"],
      inStock: true,
    },
    {
      id: 3,
      name: "Adventure Pants",
      price: 55,
      originalPrice: 75,
      image: productPants,
      badge: "Only 2 Left",
      badgeVariant: "destructive" as const,
      sizes: ["12m", "18m", "2T"],
      inStock: true,
    },
    {
      id: 4,
      name: "Sunday Best Set",
      price: 125,
      originalPrice: null,
      image: productDress,
      badge: "Limited Edition",
      badgeVariant: "outline" as const,
      sizes: ["18m", "2T", "3T"],
      inStock: false,
    },
  ];

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-foreground mb-4">
          This Week's Special Pieces
        </h2>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          Handpicked favorites from our latest collection
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:transform hover:scale-105"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Badge */}
              <Badge
                variant={product.badgeVariant}
                className="absolute top-3 left-3 font-inter font-medium"
              >
                {product.badge}
              </Badge>

              {/* Quick Add Button - appears on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <Button
                  size="lg"
                  className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-primary hover:bg-white/90 font-inter font-semibold rounded-full shadow-large"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Quick Add
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h3 className="font-playfair text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-inter text-2xl font-bold text-foreground">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="font-inter text-lg text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Sizes */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="px-3 py-1 text-xs font-inter font-medium bg-muted text-muted-foreground rounded-full"
                  >
                    {size}
                  </span>
                ))}
              </div>

              {/* Stock Status */}
              {!product.inStock && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    className="w-full font-inter font-medium"
                    disabled
                  >
                    Sold Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center mt-12">
        <Button
          size="lg"
          variant="outline"
          className="font-inter font-semibold px-8 py-4 text-lg rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
        >
          View All Products
        </Button>
      </div>
    </section>
  );
};

export default ProductShowcase;