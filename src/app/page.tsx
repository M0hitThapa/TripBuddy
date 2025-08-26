import { Container } from "@/components/container";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Image from "next/image";

export default function Home() {
  return (
  <div className=" min-h-screen bg-[url(https://images.pexels.com/photos/158827/field-corn-air-frisch-158827.jpeg)]">
  {/*[--background-width:308.4%] lg:[--background-width:198.96%] [background:radial-gradient(var(--background-width)_100%_at_50%_0%,_#FFF_6.32%,_#E0F0FF_29.28%,_#E7EFFD_68.68%,_#FFF_100%)] */}
   <div className="flex flex-col items-center bg-white/60 ">
     <div className="max-w-7xl mx-auto absolute inset-0 h-full w-full">
      <div className="absolute inset-y-0 left-0 h-full w-px bg-gradient-to-b from-neutral-300/50 via-neutral-200 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-y-0 right-0 h-full w-px bg-gradient-to-b from-neutral-300/50 via-neutral-200 to-transparent pointer-events-none z-0" />
    </div>
      <Container>
      <Navbar />
      <Hero />
    </Container>
    <div className="relative w-full">
      <div className="h-px w-full absolute inset-x-0 bg-gradient-to-r from-neutral-300/50 via-neutral-200 to-transparent pointer-events-none z-0" />
      <div className="max-w-5xl mx-auto p-4">
        <Image src="/herodash.png" alt="hero-ui" width={1000} height={1000} className="rounded-xl w-full object-cover object-left-top border border-neutral-200 shadow-md  mask-b-from-10% to-50%" />
      </div>
    </div>
   </div>
   
     
  </div>
  );
}
