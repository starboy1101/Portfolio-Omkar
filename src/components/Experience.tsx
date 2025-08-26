import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { easeOut } from "framer-motion";
import { Briefcase, GraduationCap, MapPin, Calendar } from 'lucide-react';

const Experience: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Scroll-based parallax
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 1000], [0, 150]); // Moves 150px down while scrolling

  const experiences = [
    {
      type: 'work',
      title: 'Associate Software Engineer',
      company: 'Einfochips',
      location: 'Pune, Maharashtra',
      period: 'Jan 2025 - Present',
      description: [
        'Developed a real-time desktop audio recorder with live input level visualization.',
        'Supported both default and raw capture modes using WASAPI.',
        'Implemented loopback recording via IAudioClient3 and Core Audio APIs.',
        'Integrated real-time audio device change detection for seamless operation.',
        'Improved application performance by 40% through optimization'
      ],
      technologies: ['C++', 'C#', 'WASAPI']
    },
    {
      type: 'work',
      title: 'Full Stack Developer',
      company: 'VidyarthiMitra.org',
      location: 'Pune, Maharashtra',
      period: 'June 2024 - Dec 2024',
      description: [
        'Built responsive web applications using React and Express.js',
        'Collaborated with designers to implement pixel-perfect UI/UX',
        'Integrated third-party APIs and payment processing systems',
        'Participated in agile development processes and code reviews'
      ],
      technologies: ['React', 'Express.js', 'MongoDB', 'Stripe', 'Heroku']
    },
    {
      type: 'education',
      title: 'Bachelor of Science in Computer Science',
      company: 'MIT World Peace University',
      location: 'Pune, Maharashtra',
      period: '2021 - 2025',
      description: [
        'Graduated with 9.2 GPA',
        'Relevant coursework: Data Structures, Algorithms, Database Systems',
        'Completed capstone project on machine learning applications'
      ],
      technologies: ['Java', 'Python', 'C++', 'SQL', 'Machine Learning']
    },
    {
      type: 'education',
      title: '12th',
      company: 'Army Public School',
      location: 'Pune, Maharashtra',
      period: '2019 - 2020',
      description: ['Science Stream'],
      technologies: ['']
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

  return (
    <section id="experience" className="py-20 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      {/* Parallax background glow */}
      <motion.div
        style={{ y: yParallax }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-20 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-blue-500 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Experience & Education
            </span>
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"
          />
        </motion.div>

        <div className="relative">
          {/* Timeline line with glowing animation */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-8 md:left-1/2 transform md:-translate-x-0.5 w-0.5 h-full bg-gradient-to-b from-blue-600 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.7)]"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-12"
          >
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot with glow + pulse */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full shadow-[0_0_25px_rgba(59,130,246,1)] z-10 border-4 border-white dark:border-gray-900"
                />

                {/* Content Card */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${
                  index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                }`}>
                  <motion.div
                    className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-transform duration-300"
                    whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 1 : -1 }}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`p-2 rounded-full mr-3 ${
                        exp.type === 'work' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      }`}>
                        {exp.type === 'work' ? <Briefcase size={20} /> : <GraduationCap size={20} />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {exp.title}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                          {exp.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <MapPin size={16} className="mr-2" />
                      {exp.location}
                      <Calendar size={16} className="ml-4 mr-2" />
                      {exp.period}
                    </div>

                    <ul className="space-y-2 mb-4">
                      {exp.description.map((item, i) => (
                        <li key={i} className="text-gray-600 dark:text-gray-300 flex items-start">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
