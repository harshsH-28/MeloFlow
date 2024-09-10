import React, { use } from "react";

interface ButtonProps {
  handleClick: () => void;
  styles?: string;
  children: React.ReactNode;
}

export default function Button({handleClick, styles, children}: ButtonProps){
  return (
    <button onClick={handleClick} className={styles}>{children}</button>
  );
}


