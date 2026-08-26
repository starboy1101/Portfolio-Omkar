import About from './components/About';
import Certification from './components/Certification';
import Contact from './components/Contact';
import Experience from './components/Experience';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Resume from './components/Resume';
import Skills from './components/Skills';
import { AssistantLayer } from './components/ai';
import { AssistantProvider } from './contexts/AssistantContext';
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => (
  <ThemeProvider>
    <AssistantProvider>
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
        <Header />
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
        <Footer />
        <AssistantLayer />
      </div>
    </AssistantProvider>
  </ThemeProvider>
);

export default App;
