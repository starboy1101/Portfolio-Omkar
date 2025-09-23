import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import DecryptedText from './DecryptedText';
import ProfileCard from './ProfileCard';
import PersonImg from "../assets/Person.png";
import iconpattern from"../assets/iconpattern.png";
import grain from"../assets/grain.webp";

const navItems = [ { href: '#contact', label: 'Contact' }, ];

const About: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              About Me
            </span>
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"
          />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="flex justify-center"
          >
            <ProfileCard
              name="Omkar Mahabdi"
              title="Software Engineer"
              handle="Omkar"
              status="Online"
              contactText="Contact Me"
              avatarUrl= {PersonImg}
              iconUrl = {iconpattern}
              grainUrl = {grain}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={true}
              onContactClick={() => {
                const contactItem = navItems.find(item => item.label === 'Contact');
                if (contactItem) {
                  window.location.href = contactItem.href; // redirects to the contact section/page
                }
              }}
            />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-6"
          >
            <motion.h3
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Get to{' '} 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Know Me!
              </span>
            </motion.h3>

            <motion.div
              variants={itemVariants}
              className="text-muted-foreground dark:text-gray-300 max-w-full text-lg"
            >
              <DecryptedText
                text={"I'm a dedicated Python Developer with hands-on experience in creating dynamic and responsive web applications. Over the past year, I've collaborated with talented teams to deliver projects that are not only scalable but also intuitive and user-friendly."}
                animateOn="view"
                revealDirection="start"
                speed={150}
                maxIterations={10}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-muted-foreground dark:text-gray-300 max-w-full text-lg"
            >
              <DecryptedText
                text={"My passion for development began during college, and since then, coding has become both a craft and a curiosity for me. I thrive on learning new frameworks, experimenting with innovative solutions, and staying ahead of industry trends."}
                animateOn="view"
                revealDirection="start"
                speed={150}
                maxIterations={10}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-muted-foreground dark:text-gray-300 max-w-full text-lg"
            >
              <DecryptedText
                text={"Outside of building apps, I enjoy reading books, listening to music, diving into open-source contributions, exploring emerging technologies, and sharing insights with the developer community through tutorials and blog posts. For me, every project is an opportunity to grow, create, and make an impact."}
                animateOn="view"
                revealDirection="start"
                speed={150}
                maxIterations={10}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Projects Completed', value: '15+' },
                { label: 'Years Experience', value: '2+' },
                { label: 'Technologies Worked With', value: '20+' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
