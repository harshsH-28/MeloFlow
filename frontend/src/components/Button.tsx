import React, { use } from "react";

export default function Button({handleClick}: any, children: any, styles: string){
  return (
    <button onClick={handleClick} className={styles}>{children}</button>
  );
}


