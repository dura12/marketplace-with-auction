import React from "react";

interface CustomContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<CustomContainerProps> = ({ children }) => {
  return (
    <div className="max-w-[1920px] ml-0 mr-auto xl:px-20 md:px-2 px-4">
      {children}
    </div>
  );
};

export default Container;
