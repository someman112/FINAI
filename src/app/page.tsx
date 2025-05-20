import { AnimatedNavbar } from "@/components/ui/resizable-navbar";
import { ThemeSwitcher } from "@/components/ui/themeswitch";
import { Logo } from "@/components/ui/logo";
import { HomePage } from "./home";

export default function Home() {
  return (
    <div>
      <div className="relative">        
        <div className="relative flex items-center space-x-4 pr-4 md:pr-8 lg:pr-12 py-2 z-10">
          <Logo />
          <AnimatedNavbar />
          <ThemeSwitcher />
        </div>
      </div>
      
      {/* Render the home content */}
      <HomePage />
    </div>
  );
}