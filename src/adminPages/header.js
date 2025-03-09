import { Link } from "react-router-dom";

const adminHeader = () => {
  return (
    <div className="">
      <div className="bg-[#181818] h-[40px] flex items-center px-[20px] relative">
        <div className="w-full text-[#98E23C] font-bold leading-[40px] text-center">
          Welcome to VEGAS
        </div>
        <Link
          className="text-white text-[12px] absolute right-[20px] top-[12px]"
          to="/"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
};

export default adminHeader;
