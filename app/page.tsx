import { Navbar } from '@/components/Navbar';

export default function WelcomePage() {
  return (
    <div className="bg-no-repeat bg-cover bg-center bg-[url('/images/sample-bg.jpg')] min-h-screen w-full">
      <Navbar />
      <div className="flex justify-center items-center h-screen flex-col">
        <h1 className="text-9xl text-white font-extrabold">KOSA</h1>
        <h1 className="text-2xl text-white font-extrabold">
          Korean Student Association at UMass Boston
        </h1>
      </div>
    </div>
  );
}
