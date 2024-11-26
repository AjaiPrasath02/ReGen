import React, { useEffect, useRef } from "react";
import img1 from "../public/1.jpg";
import img2 from "../public/7.jpg";
import img3 from "../public/3.webp";
import img4 from "../public/8.jpg";
import img5 from "../public/5.jpg";

function Carousel() {
    const autoClickInterval = useRef(null);

    const startAutoClick = () => {
        clearInterval(autoClickInterval.current);
        autoClickInterval.current = setInterval(() => {
            const nextButton = document.getElementById("next");
            if (nextButton) {
                nextButton.click();
            }
        }, 3500);
    };

    useEffect(() => {
        startAutoClick();
        return () => {
            clearInterval(autoClickInterval.current);
        };
    }, []);

    const showSlider = (type) => {
        const nextButton = document.getElementById("next");
        const prevButton = document.getElementById("prev");
        const caroussel1 = document.querySelector(".caroussel-1");
        const listHTML = document.querySelector(".caroussel-1 .list");
        const items = document.querySelectorAll(".caroussel-1 .list .item");

        if (items.length === 0) return; // Ensure there are items

        nextButton.style.pointerEvents = "none";
        prevButton.style.pointerEvents = "none";

        caroussel1.classList.remove("prev", "next");

        if (type === "next") {
            listHTML.append(items[0]); // Move first item to the end
            caroussel1.classList.add("next");
        } else {
            const lastItem = items[items.length - 1];
            listHTML.prepend(lastItem); // Move last item to the front
            caroussel1.classList.add("prev");
        }

        // Re-enable buttons after transition
        setTimeout(() => {
            nextButton.style.pointerEvents = "auto";
            prevButton.style.pointerEvents = "auto";
        }, 300); // Delay to allow the transition to complete

        // Start a new auto-click interval after manual slide
        startAutoClick();
    };

    return (
        <div className="home main-section" id="Home">
            <div>
                <section className="caroussel-1">
                    {/*<img src={bg.src} alt="" style={{ width: '100%' }} />*/}
                    <div className="list">
                        <div className="item">
                            <img src={img4.src} alt="" style={{ width: '100%' }} />
                        </div>
                        <div className="item">
                            <img src={img1.src} alt="" style={{ width: '100%' }} />
                        </div>
                        <div className="item">
                            <img src={img2.src} alt="" style={{ width: '100%' }} />
                        </div>
                        <div className="item">
                            <img src={img3.src} alt="" style={{ width: '100%' }} />
                        </div>
                        <div className="item">
                            <img src={img5.src} alt="" style={{ width: '100%' }} />
                        </div>
                    </div>
                    <div className="arrows">
                        <button id="prev" onClick={() => showSlider("prev")}>{"<"}</button>
                        <button id="next" onClick={() => showSlider("next")}>{">"}</button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Carousel;
