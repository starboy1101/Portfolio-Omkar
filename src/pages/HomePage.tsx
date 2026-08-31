import About from '../components/About';
import Certification from '../components/Certification';
import Contact from '../components/Contact';
import Experience from '../components/Experience';
import Hero from '../components/Hero';
import Projects from '../components/Projects';
import Resume from '../components/Resume';
import Seo from '../components/Seo';
import Skills from '../components/Skills';

const HomePage = () => (
  <>
    <Seo
      title="Omkar Mahabdi | AI/ML Engineer & Data Analytics Portfolio"
      description="Explore Omkar Mahabdi's AI/ML engineering, RAG, Python, FastAPI, SQL, data analytics, and business-intelligence project evidence."
      path="/"
    />
    <main id="portfolio-content">
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <Certification />
      <Resume />
      <Contact />
    </main>
  </>
);

export default HomePage;
