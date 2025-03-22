import React, { useRef, useEffect } from "react";

import "./marquee.css";

const Marquee = ({ text, speed = 50 }) => {
  const marqueeRef = useRef(null);

  useEffect(() => {
    const marqueeElement = marqueeRef.current;

    const startAnimation = () => {
      const textWidth = marqueeElement.offsetWidth / 2;

      const duration = textWidth / speed;

      marqueeElement.style.animation = `marquee ${duration}s linear infinite`;
    };

    requestAnimationFrame(startAnimation);
  }, [text, speed]);

  return (
    <div className="marquee-container">
      <div ref={marqueeRef} className="marquee-text">
        {text}
      </div>
    </div>
  );
};

export default Marquee;
