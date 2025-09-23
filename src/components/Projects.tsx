import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import mockup from '../assets/mockup.png';
import Porfolio from '../assets/Portfolioimg.png';
import Weather from '../assets/Weatherimg.png';
import Bike from '../assets/Bikeimg.png';
import AIchat from '../assets/AIchat.jpg';
import LOS from '../assets/LOS.png';
import SplitText from "./SplitText";

const Projects: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const projects = [
    {
      title: "Portfolio Website",
      description: [
        "A responsive developer portfolio website with dark mode, smooth animations, and integrated contact form.",
        "Built with React, TypeScript, and Tailwind CSS to highlight projects and professional experience in an elegant and modern UI."
      ],
      mockup: mockup,
      screenshot: Porfolio,
      technologies: ["React", "TypeScript", "Framer Motion", "Tailwind CSS"],
      githubUrl: "https://github.com/starboy1101/Portfolio-Omkar",
      liveUrl: "https://omkar-mahabdi-portfolio.netlify.app",
    },
    {
      title: "Weather Dashboard",
      description: [
        "A sleek and responsive weather application built using React and OpenWeather API.",
        "It allows users to search for real-time weather updates by city, displaying temperature, humidity, and conditions with a clean, modern interface."
      ],
      mockup: mockup,
      screenshot: Weather,
      technologies: [
        "React",
        "TypeScript",
        "Framer Motion",
        "OpenWeather API",
        "Tailwind CSS",
      ],
      githubUrl: "https://github.com/starboy1101/Weather-App",
      liveUrl: "https://omkar-weatherapp.netlify.app",
    },
    {
      title: "Loan Onboarding System",
      description: [
        "A full-stack loan onboarding system for managing applications, financial details, and user accounts across banks.",
        "Designed with multi-tenant architecture, dynamic database routing, JWT authentication, and Google Cloud Storage integration for secure file management."
      ],
      mockup: mockup,
      screenshot: LOS,
      technologies: [
        "Django",
        "Django REST Framework",
        "Google Cloud Storage",
        "JWT Auth",
        "PostgreSQL",
      ],
      githubUrl: "https://github.com/yourusername/loan-onboarding",
      liveUrl: "https://ajitbank.markytics.com/login",
    },
    {
      title: "Bike Ride Booking App",
      description: [
        "Developed an online bike ride booking application to enhance urban transportation accessibility.",
        "Implemented booking flows, payment integration, and ride tracking using a modern MERN stack architecture."
      ],
      mockup: mockup,
      screenshot: Bike,
      technologies: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
      githubUrl: "https://github.com/yourusername/bike-ride-app",
      liveUrl: "https://your-bikeride-app.com",
    },
    {
      title: "AI Chat Application",
      description: [
        "Real-time chat application with AI integration, message encryption, file sharing, and multi-language support.",
      ],
      mockup: mockup,
      screenshot: AIchat,
      technologies: ['React', 'WebSocket', 'OpenAI API', 'Firebase', 'Material-UI'],
      githubUrl: 'https://github.com/yourusername/ai-chat',
      liveUrl: 'https://your-ai-chat.com',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-14"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Featured Projects
            </span>
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"
          />
        </motion.div>

        {/* Projects List */}
        {projects.map((project, i) => (
          <motion.div
            key={i}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mb-20 relative"
          >
            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-12 gap-10 items-start"
            >
              {/* Laptop Column */}
              <div className="relative md:col-span-5 flex justify-center md:justify-start mb-6 md:mb-0">
                <div className="    
                absolute 
                top-1 sm:top-1 md:top-[2%] 
                left-1/2 sm:left-4 md:left-[10%] 
                w-[80%] sm:w-[82%] md:w-[81%] 
                h-[74%] sm:h-[70%] md:h-[72%] 
                -translate-x-1/2 sm:translate-x-0 
                overflow-hidden 
                rounded-md"
                  >
                  <img
                    src={project.screenshot}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <img
                  src={project.mockup}
                  alt="Laptop mockup"
                  className="w-[450px] h-auto relative z-10 pointer-events-none select-none "
                />
              </div>

              {/* Right Side Info */}
              <div className="md:col-span-7 flex flex-col justify-start px-3 md:px-0">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              <SplitText
                text={project.title}
                className="inline-block"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
              />
                </h3>
                <ul className="list-disc list-outside pl-8 text-muted-foreground dark:text-gray-300 max-w-full text-lg mb-6 space-y-6">
                  {project.description.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-4 mb-7">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-7 py-3 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {/* View Live Button */}
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link text-base font-medium border-2 px-5 py-2.5 rounded-full transition-all flex justify-center items-center gap-2 hover:opacity-80 bg-black text-white dark:bg-white dark:text-black"
                  >
                    {/* Fire Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="shrink-0">
                      <path d="M12 2C12 2 8 6 8 10a4 4 0 0 0 8 0c0-4-4-8-4-8zM6 14a6 6 0 0 0 12 0c0-3-3-6-3-6s1 3-3 6a6 6 0 0 1-6 0z"/>
                    </svg>
                    View Live
                    {/* Arrow Icon with Hover Animation */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="lucide lucide-arrow-up-right group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all shrink-0">
                      <path d="M7 7h10v10"></path>
                      <path d="M7 17 17 7"></path>
                    </svg>
                  </a>

                  {/* View Code Button */}
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link text-base font-medium px-5 py-2.5 rounded-full transition-all flex justify-center items-center gap-2 hover:opacity-80 border-2 bg-white text-black dark:bg-black dark:text-white"
                  >
                    {/* GitHub Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="shrink-0" viewBox="0 0 24 24">
                      <path d="M12 .5C5.37.5 0 5.87 0 12.5a12 12 0 0 0 8.21 11.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.86 2.84 1.32 3.54 1.01.11-.78.42-1.32.76-1.63-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.16 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.64.24 2.86.12 3.16.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.65-5.47 5.95.43.38.81 1.12.81 2.26v3.35c0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z"/>
                    </svg>
                    View Code
                    {/* Arrow Icon with Hover Animation */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="lucide lucide-arrow-up-right group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all shrink-0">
                      <path d="M7 7h10v10"></path>
                      <path d="M7 17 17 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Separator Line */} 
            {i < projects.length - 1 && ( <div className="border-t border-gray-200 dark:border-gray-700 mt-16"></div> )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
