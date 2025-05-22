import { AnimatedNavbar } from "@/components/ui/resizable-navbar";
import { ThemeSwitcher } from "@/components/ui/themeswitch";
import { Logo } from "@/components/ui/logo";
import { HomePage } from "./home";

export default function Home() {
  return (
    <div className="relative">
      {/* Render HomePage first, so it's behind the nav */}
      <div className="absolute inset-0">
        <HomePage />
      </div>
      
      <header className="relative flex items-center space-x-4 pr-4 md:pr-8 lg:pr-12 py-3 z-50">
        {/* Improved blur effect */}
        <div className="absolute w-full h-20 inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20"></div>
        
        {/* Navbar content above the blur */}
        <div className="relative z-10 flex w-full items-center">
          {/* Left section */}
          <div className="flex-shrink-0">
            <Logo />
          </div>
          
          {/* Center section - animated navbar */}
          <div className="flex-grow flex justify-center">
            <AnimatedNavbar />
          </div>
          
          {/* Right section */}
          <div className="flex-shrink-0">
            <ThemeSwitcher />
          </div>
        </div>
      </header>
    </div>
  );
}