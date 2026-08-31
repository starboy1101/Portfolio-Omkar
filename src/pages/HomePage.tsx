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
      title="Omkar Mahabdi | AI/ML Engineer & Python Developer"
      description="Explore Omkar Mahabdi's production-oriented AI, RAG, semantic search, Python, FastAPI, and full-stack engineering work."
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
