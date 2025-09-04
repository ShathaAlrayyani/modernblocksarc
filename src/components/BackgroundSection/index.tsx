import { useLayoutEffect, useRef, useState } from "react";
import "./BackgroundSection.scss";
import { imgsList } from "../../constants";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

export const BackgroundSection = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<HTMLElement[]>([]);
  const activeRef = useRef(0); // <- always-current index
  const [active, setActive] = useState(0); // for aria only
  const animating = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      slidesRef.current = gsap.utils.toArray<HTMLElement>(".sectionWrapper");

      // Stack slides
      gsap.set(slidesRef.current, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        // autoAlpha: 0,
        yPercent: 0,
        zIndex: 1,
      });

      // Show the first
      const first = slidesRef.current[activeRef.current];
      if (first) {
        gsap.set(first, { autoAlpha: 1, zIndex: 2 });
        gsap.set(first.querySelector(".bgImg"), {
          scale: 1,
          transformOrigin: "50% 50%",
        });
        // gsap.set(first.querySelector(".textContainer"), { autoAlpha: 1, y: 0 });
      }

      // Wheel/touch observer
      Observer.create({
        target: containerRef.current,
        type: "wheel,touch,pointer",
        preventDefault: true,
        tolerance: 12,
        wheelSpeed: 1,
        onDown: () => go(1),
        onUp: () => go(-1),
      });

      // Keyboard
      const onKey = (e: KeyboardEvent) => {
        if (animating.current) return;
        if (e.key === "ArrowDown" || e.key === "PageDown") go(1);
        if (e.key === "ArrowUp" || e.key === "PageUp") go(-1);
      };
      window.addEventListener("keydown", onKey);

      return () => {
        window.removeEventListener("keydown", onKey);
        Observer.getAll().forEach((o) => o.kill());
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const go = (dir: 1 | -1) => {
    if (animating.current) return;
    const slides = slidesRef.current;
    if (!slides.length) return;

    const currentIndex = activeRef.current; // <- from ref, not state
    const wrap = gsap.utils.wrap(0, slides.length);
    const nextIndex = wrap(currentIndex + dir);

    const current = slides[currentIndex];
    const next = slides[nextIndex];
    if (!current || !next) return;

    animating.current = true;

    // Prepare incoming
    gsap.set(next, {
      // autoAlpha: 1,
      yPercent: dir > 0 ? 100 : -100,
      zIndex: 3,
    });
    gsap.set(next.querySelector(".bgImg"), {
      scale: 0.5,
      transformOrigin: "50% 50%",
    });
    gsap.set(next.querySelector(".textContainer"), {
      autoAlpha: 0,
      y: dir > 0 ? 50 : -50,
    });

    // Make sure the outgoing is above the pile until it exits
    gsap.set(current, { zIndex: 4 });

    const goingDown = dir > 0;

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        // Clean up both slides
        gsap.set(current, { autoAlpha: 0, yPercent: 0, zIndex: 1 });
        gsap.set(current.querySelector(".bgImg"), { scale: 1 });
        gsap.set(current.querySelector(".textContainer"), {
          autoAlpha: 1,
          y: 0,
        });

        gsap.set(next, { autoAlpha: 1, yPercent: 0, zIndex: 2 });
        gsap.set(next.querySelector(".bgImg"), { scale: 1 });
        gsap.set(next.querySelector(".textContainer"), { autoAlpha: 1, y: 0 });

        activeRef.current = nextIndex; // <- update ref first
        setActive(nextIndex); // aria update (safe to re-render)
        animating.current = false;
      },
    });

    // 1) Fade/move text & shrink bg on current
    tl.to(
      current.querySelector(".textContainer"),
      {
        // autoAlpha: 0,
        y: goingDown ? -30 : 30,
        duration: 0.3,
      },
      0
    );

    tl.to(
      current.querySelector(".bgImg"),
      {
        scale: 0.5,
        duration: 0.35,
      },
      0
    );

    // 2) Cross-move slides; scale next up
    tl.to(
      current,
      {
        yPercent: goingDown ? -100 : 100,
        duration: 0.6,
      },
      ">-0.02"
    );

    tl.to(
      next,
      {
        yPercent: 0,
        duration: 0.6,
      },
      "<"
    );

    // tl.fromTo(
    //   next,
    //   {
    //     yPercent: 0,
    //     duration: 0.6,
    //   },
    //   {},
    //   "<"
    // );

    tl.to(
      next.querySelector(".bgImg"),
      {
        scale: 1,
        duration: 0.6,
      },
      "<"
    );

    // 3) Bring in next text
    tl.to(
      next.querySelector(".textContainer"),
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.35,
      },
      "-=0.25"
    );
  };

  return (
    <section
      className="mainSection"
      ref={containerRef}
      aria-roledescription="carousel"
    >
      {imgsList.map((item, i) => (
        <div
          className="sectionWrapper"
          key={i}
          data-active={i === active ? "true" : "false"}
          aria-hidden={i === active ? "false" : "true"}
        >
          <img className="bgImg" src={item.imgSrc} alt={item.title} />
          <div className="textContainer">
            <div className="headerWrapper">
              <h1 className="header">{item.title}</h1>
            </div>
            <p className="text">{item.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
};
