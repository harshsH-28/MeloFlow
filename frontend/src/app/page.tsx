import Image from "next/image";
import Button from "@/components/Button";

export default function Home() {
  const handleClick = () => {
    console.log("Clicked");
  }
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-center text-2xl p-5 text-black">This is the frontend for music streaming app</h1>
      <input type="text" placeholder="What do you want to hear" className="text-black border-2 border-x-pink-600 border-y-violet-600 my-11 px-8 py-6 w-[50vw] rounded-3xl focus:outline-none focus:text-[16.5px] transition-all ease-in-out" />
      <Button handleClick={handleClick} styles="text-black focus:outline-none border-black border-2 px-4 py-2 rounded-lg">Search Music</Button>
    </div>
  );
}
