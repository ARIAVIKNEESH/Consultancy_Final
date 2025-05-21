import React, { useState, useEffect } from 'react';
import './Home.css';
import img1 from '../assets/images.png';
import img2 from '../assets/img.jpg';
import img3 from '../assets/insta (2).jpg';
import infra1 from '../assets/prod.jfif';
import infra2 from '../assets/youtube.webp';


const Home = () => {
    const images = [img1, img2, img3];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Image changes every 3 seconds
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="home">

            {/* ✅ Header */}
            <header className="header">
                <div className="container">
                    <h1>The Palani Andavar Mills Private Limited</h1>
                    <nav>
                        <a href="#about">About</a>
                        <a href="#infrastructure">Infrastructure</a>
                        <a href="#news">News & Events</a>
                        <a href="#contact">Contact</a>
                    </nav>
                </div>
            </header>

            {/* ✅ Carousel */}
            <section className="carousel">
                <img src={images[currentIndex]} alt="Carousel" />
                <div className="carousel-text">
                    <h2>Committed to Customer Satisfaction</h2>
                </div>
            </section>

            {/* ✅ About Us */}
            <section id="about" className="about">
                <h2>About PAM</h2>
                <p>
                    The Palani Andavar Mills Private Limited, established in 1933, is one of the leading manufacturers of Yarn 
                    with a capacity of <strong>34,736 spindles</strong>. The company is managed by <b>SMT. Girija Parthasarathy</b>, 
                    under the supervision of the Board of Directors with vast experience in the textile industry.
                </p>
            </section>

            {/* ✅ Infrastructure */}
            <section id="infrastructure" className="infrastructure">
                <h2>Infrastructure</h2>
                <div className="grid">
                    <div className="card">
                        <img src={infra1} alt="Pre-Spinning Stage" />
                        <h3>Pre-Spinning Stage</h3>
                        <p>Equipped with the latest Trumac machine, in collaboration with Trutzler of Germany and Lakshmi Rieter.</p>
                    </div>
                    <div className="card">
                        <img src={infra2} alt="Post-Spinning Stage" />
                        <h3>Post-Spinning Stage</h3>
                        <p>Invested in sophisticated yarn clearers from USTER and splicers from MESDAN.</p>
                    </div>
                </div>
            </section>

            {/* ✅ News & Events */}
            <section id="news" className="news">
                <h2>News & Events</h2>
                <div className="news-item">
                    <h3>Annual General Meeting</h3>
                    <p>Monday on 30th September 2024 at 3.00 P.M. at the Registered Office, 236, Dhally Road, Udamalpet 642 126.</p>
                </div>
                <div className="news-item">
                    <h3>Annual General Meeting</h3>
                    <p>Wednesday on 20th September 2023 at 3.00 P.M. at the Registered Office.</p>
                </div>
            </section>

            {/* ✅ Footer */}
            <footer className="footer">
                <p>&copy; 2025 Palani Andavar Mills Private Limited. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
