import React, { useEffect, useState } from "react";
import { AuthButton } from "components/AuthButton";
import { GlassmorphicCard } from "components/GlassmorphicCard";
import {
  Code,
  Brush,
  Camera,
  BarChart,
  Briefcase,
  Mic,
  User,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@stackframe/react";

const icons = [
  { icon: <Code />, name: "Developers" },
  { icon: <Brush />, name: "Designers" },
  { icon: <Camera />, name: "Photographers" },
  { icon: <BarChart />, name: "Marketers" },
  { icon: <Briefcase />, name: "Consultants" },
  { icon: <Mic />, name: "Podcasters" },
  { icon: <User />, name: "Public Figures" },
];

const iconPositions = [
  { top: "15%", left: "10%" },
  { top: "20%", left: "75%" },
  { top: "65%", left: "5%" },
  { top: "70%", left: "80%" },
  { top: "80%", left: "60%" },
  { top: "85%", left: "25%" },
];

const mobileIconPositions = [
  { top: "10%", left: "5%" },
  { top: "15%", left: "70%" },
  { top: "60%", left: "2%" },
  { top: "65%", left: "75%" },
  { top: "85%", left: "55%" },
  { top: "90%", left: "15%" },
];

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{width?: number, height?: number}>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []); 
  return windowSize;
}


export default function App() {
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  const user = useUser();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setGlowPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-black text-white overflow-hidden bg-background min-h-screen">
      <div
        className="glow-effect"
        style={{
          left: glowPosition.x,
          top: glowPosition.y,
          width: "800px",
          height: "800px",
          transform: "translate(-50%, -50%)",
        }}
      />
      <main className="container mx-auto px-4 py-24 text-center">
        <div className="text-center py-8 md:py-16">
          <div className="flex justify-center">
            <Link
              to="/discover"
              className="mb-4 inline-block rounded-full bg-purple-500/10 p-3 text-purple-400 transition-all hover:bg-purple-500/20 hover:scale-110"
            >
              <Users className="h-8 w-8" />
            </Link>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-4">
            Showcase Your Work.
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mt-4">
            The ultimate platform for creators, innovators, and professionals to
            build a stunning portfolio that truly represents their talent.
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A beautifully designed platform where creators, developers, and
            professionals can build a stunning portfolio that truly represents
            their talent.
          </p>
          <div className="mt-12 flex justify-center items-center gap-4">
            <AuthButton />
          </div>
        </div>
      </main>

      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {icons.map((item, index) => {
          const currentPositions = isMobile ? mobileIconPositions : iconPositions;
          const position = currentPositions[index % currentPositions.length];
          return (
            <GlassmorphicCard
              key={index}
              className="absolute p-4 flex items-center justify-center"
              delay={index * 0.1}
              style={{
                width: isMobile ? "80px" : "120px",
                height: isMobile ? "80px" : "120px",
                top: position.top,
                left: position.left,
                animationDelay: `${index * 0.5}s`,
              }}
            >
              <div className="text-white">{React.cloneElement(item.icon, { size: isMobile ? 32 : 48 })}</div>
            </GlassmorphicCard>
          )
        })}
      </div>
    </div>
  );
}
