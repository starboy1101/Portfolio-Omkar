import React from 'react';
import { motion } from 'framer-motion';
import { Download, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import TypingEffect from './TypingEffect';
import ResumePDF from '../assets/Resume.pdf';

const Hero: React.FC = () => {
  const handleDownloadResume = () => {
    const link = document.createElement('a');
    link.href = ResumePDF; // Replace with your actual resume path
    link.download = 'Omkar_Mahabdi_Resume.pdf';
    link.click();
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center 
                 bg-gradient-to-br from-blue-50 via-white to-indigo-50 
                 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
                 overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto py-20 text-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-4">
            Hi, I'm{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Omkar Mahabdi
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 h-8">
            <TypingEffect
              strings={[
                'Software Engineer',
                'Frontend Developer',
                'Node.js Expert',
                'Problem Solver',
                'Tech Enthusiast',
              ]}
              className="text-blue-600 dark:text-blue-400 font-semibold"
            />
          </p>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Passionate about building scalable web applications and creating
            exceptional user experiences with modern technologies and best
            practices.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadResume}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white 
                       px-8 py-3 rounded-full font-medium transition-colors duration-200"
          >
            <Download size={20} />
            Download Resume
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#contact"
            className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 
                       dark:text-blue-400 px-8 py-3 rounded-full font-medium 
                       hover:bg-blue-600 hover:text-white dark:hover:text-white transition-colors duration-200"
          >
            Get In Touch
            <ExternalLink size={20} />
          </motion.a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6"
        >
          {[
            { icon: Github, href: 'https://github.com/starboy1101', label: 'GitHub' },
            { icon: Linkedin, href: 'https://www.linkedin.com/in/omkar-mahabdi', label: 'LinkedIn' },
            { icon: Mail, href: 'mailto:omkarmahabdi007@gmail.com', label: 'Email' },
          ].map((social) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg 
                         hover:shadow-xl text-gray-600 dark:text-gray-300 
                         hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              whileHover={{ scale: 1.1 }}
            >
              <social.icon size={24} />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
