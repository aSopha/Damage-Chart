import React from "react";

export default function useWindow(resetInterval = null) {
  const [window, setWindow] = React.useState([0,100])


  return [window, handleWindow];
}