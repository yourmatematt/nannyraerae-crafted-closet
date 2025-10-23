import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Main Hero Section */}
      <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="order-2 lg:order-1">
              {/* Small green tagline */}
              <div className="mb-6">
                <Badge className="bg-primary text-primary-foreground font-inter font-medium px-4 py-2 rounded-full">
                  HANDCRAFTED WITH LOVE
                </Badge>
              </div>

              {/* Large heading */}
              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span style={{ color: '#8E5A3B' }}>Unique</span>
                <br />
                <span className="text-primary">Children&apos;s Clothing</span>
              </h1>

              {/* Description */}
              <p className="font-inter text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Every piece is lovingly handcrafted by Nanny Rae Rae in regional Australia. Premium quality fabric and the warmth of a grandmother&apos;s touch in every stitch.
              </p>

              {/* Two CTAs side by side */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-inter font-semibold px-8 py-4 text-lg rounded-full"
                  onClick={() => navigate('/new-arrivals')}
                >
                  Shop Collection
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-inter font-semibold px-8 py-4 text-lg rounded-full"
                  onClick={() => navigate('/about')}
                >
                  Our Story
                </Button>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                {/* Main product image */}
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-large">
                  <img
                    src={heroImage}
                    alt="Handcrafted children's clothing by Nanny Rae Rae"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* "New Arrival" badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground font-inter font-medium px-3 py-1 rounded-full shadow-medium">
                    New Arrival
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Strip (replaces stats section) */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#FFFDF5]">
        <div className="max-w-5xl mx-auto">
          <div className="relative mx-auto w-full sm:w-11/12 md:w-5/6 lg:w-2/3">
            {/* Fabric label card */}
            <blockquote
              className="
                relative mx-auto rounded-xl
                p-5 sm:p-6 md:p-8
                bg-[rgba(255,255,245,0.96)]
                border border-primary/50 md:border-2 md:border-primary/60 border-dashed
                shadow-md md:shadow-[0_10px_25px_rgba(0,0,0,0.12)]
              "
            >
              {/* Grain texture (hidden on mobile) */}
              <span
                aria-hidden
                className="
                  hidden md:block pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply
                  bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%2240%22 height=%2240%22 filter=%22url(%23n)%22 opacity=%220.15%22/></svg>')]
                  rounded-xl
                "
              />

              <p className="relative font-inter text-base sm:text-lg leading-relaxed text-foreground/90 italic mb-3">
                &quot;Clothes stitched with care, made to be lived in, played in, and treasured for years.&quot;
              </p>
              <cite className="relative font-playfair text-primary font-semibold not-italic text-sm sm:text-base">
                — Nanny Rae Rae
              </cite>

              {/* Corner stitch marks (hidden on mobile) */}
              <span aria-hidden className="hidden md:block absolute top-3 left-4 w-7 h-[2px] bg-primary/70 rounded-full -rotate-12"></span>
              <span aria-hidden className="hidden md:block absolute top-3 right-4 w-7 h-[2px] bg-primary/70 rounded-full rotate-12"></span>
              <span aria-hidden className="hidden md:block absolute bottom-3 left-4 w-7 h-[2px] bg-primary/70 rounded-full rotate-12"></span>
              <span aria-hidden className="hidden md:block absolute bottom-3 right-4 w-7 h-[2px] bg-primary/70 rounded-full -rotate-12"></span>

              {/* Safety pin accent (desktop only) */}
              <svg
                aria-hidden
                className="hidden lg:block absolute -top-5 right-10 w-8 h-8 rotate-12 drop-shadow"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M46 12c6 0 10 6 10 12 0 11-10 19-18 24" stroke="#0F172A" strokeWidth="3" strokeLinecap="round"/>
                <path d="M24 50c-6 0-10-5-10-10 0-7 6-12 12-12h14" stroke="#0F172A" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="46" cy="24" r="3" fill="#0F172A"/>
                <path d="M22 50c6-3 16-9 16-18" stroke="#0F172A" strokeWidth="3" strokeLinecap="round"/>
                <rect x="19" y="47" width="10" height="6" rx="3" fill="#0F172A"/>
              </svg>
            </blockquote>

            {/* Optional slight organic tilt on desktop only */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block -z-10 -rotate-1" />
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
