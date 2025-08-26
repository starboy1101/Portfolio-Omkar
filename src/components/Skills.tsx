import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Code, Server, Cloud, Database } from 'lucide-react';

const skillsData = [
  {
    category: 'Frontend',
    icon: <Code size={24} />,
    skills: [
      { name: 'HTML', level: 98, color: 'from-blue-500 to-cyan-500' },
      { name: 'CSS', level: 93, color: 'from-blue-700 to-cyan-700' },
      { name: 'Tailwind CSS', level: 92, color: 'from-cyan-800 to-blue-800' },
      { name: 'React', level: 85, color: 'from-blue-500 to-cyan-500' },
      { name: 'TypeScript', level: 80, color: 'from-blue-600 to-blue-800' },
      { name: 'Next.js', level: 75, color: 'from-gray-800 to-gray-600' },
    ],
  },
  {
    category: 'Backend',
    icon: <Server size={24} />,
    skills: [
      { name: 'Node.js', level: 88, color: 'from-green-600 to-green-800' },
      { name: 'Python', level: 85, color: 'from-yellow-500 to-blue-600' },
      { name: 'Express.js', level: 80, color: 'from-gray-600 to-gray-800' },
    ],
  },
  {
    category: 'Database & Cloud',
    icon: <Database size={24} />,
    skills: [
      { name: 'PostgreSQL', level: 90, color: 'from-blue-700 to-blue-900' },
      { name: 'MongoDB', level: 85, color: 'from-green-700 to-green-900' },
      { name: 'AWS', level: 70, color: 'from-orange-500 to-orange-600' },
    ],
  },
];

const Skills: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2 variants={item} className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              My Skills
            </span> 
            {' '}& Expertise
          </motion.h2>
          <motion.div
            variants={item}
            className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"
          />                  
          <motion.p variants={item} className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            I specialize in building scalable, high-performance web applications. Here's a quick look at my core competencies.
          </motion.p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid md:grid-cols-3 gap-8"
        >
          {skillsData.map((category) => (
            <motion.div
              key={category.category}
              variants={item}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group relative overflow-hidden"
            >
              {/* Decorative gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>

              <div className="flex items-center gap-2 mb-6">
                {category.icon}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{category.category}</h3>
              </div>

              <div className="space-y-4">
                {category.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1 text-gray-700 dark:text-gray-300 font-medium">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
