import hotel1 from "@/assets/hotels/hotel-1.jpg";
import hotel2 from "@/assets/hotels/hotel-2.jpg";
import hotel3 from "@/assets/hotels/hotel-3.jpg";
import hotel4 from "@/assets/hotels/hotel-4.jpg";
import heroImage from "@/assets/hero-hotel.jpg";
import SearchBar from "./SearchBar";

const collageImages = [hotel1, hotel2, hotel3, hotel4, heroImage];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12">
      {/* Photo Collage Background */}
      <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
        {collageImages.map((image, index) => (
          <div
            key={index}
            className="relative overflow-hidden animate-fade-in group"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <img
              src={image}
              alt={`Collage image ${index + 1}`}
              className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/30 to-transparent group-hover:from-background/40 transition-colors duration-500" />
          </div>
        ))}
      </div>

      {/* Main Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />

      {/* Soft ambient glow only */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float opacity-15" style={{ animationDelay: "1.5s" }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-12">

          {/* Main Heading */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <span className="block hover:tracking-wide transition-all duration-500">Book your stay with</span>
            <span className="text-gradient animate-gradient bg-[length:200%_auto]">StayVista</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            Discover extraordinary hotels and unique stays around the world.
            Your perfect getaway is just a search away.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar />

        {/* Stats */}
        <div
          className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-16 animate-fade-in-up"
          style={{ animationDelay: "600ms" }}
        >
          {[
            { value: "500K+", label: "Active Users" },
            { value: "180+", label: "Countries" },
            { value: "50K+", label: "Hotels" },
            { value: "4.9", label: "App Rating" },
          ].map((stat, index) => (
            <div key={index} className="text-center group cursor-pointer">
              <div className="text-2xl sm:text-3xl font-bold text-gradient group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
              <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
