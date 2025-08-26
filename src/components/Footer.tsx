import React from "react";
import { motion } from "framer-motion";
import { Heart, Github, Linkedin, Twitter } from "lucide-react";

const Footer: React.FC = () => {
  const links = ["Home", "About", "Skills", "Projects", "Experience", "Contact"];

  return (
    <footer className="relative bg-gray-900 text-white py-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[160%] h-[160%] rounded-full bg-gradient-to-r 
                     from-blue-600 via-purple-600 to-pink-600 blur-[200px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-3 gap-12 mb-12"
        >
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Omkar Mahabdi
              </span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Passionate about creating exceptional digital experiences and
              solving complex problems with clean solutions.
            </p>
          <div className="flex gap-6 mt-6">
            <motion.a
              href="https://www.linkedin.com/in/omkar-mahabdi"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.3, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors text-2xl"
            >
              <Linkedin />
            </motion.a>

            <motion.a
              href="https://github.com/starboy1101"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.3, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-2xl"
            >
              <Github />
            </motion.a>

            <motion.a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.3, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-gray-600 dark:text-gray-300 hover:text-sky-500 transition-colors text-2xl"
            >
              <Twitter />
            </motion.a>
          </div>
          </div>
          <motion.div
            className="flex flex-wrap md:flex-nowrap justify-between gap-24"
          >
            {/* Quick Links */}
            <div className="flex-1 min-w-[150px]">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <nav className="space-y-2">
                {links.map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="group flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                    whileHover={{ x: 4, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 250 }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500 mr-2">
                      •
                    </span>
                    {item}
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Services */}
            <div className="flex-1 min-w-[150px]">
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <nav className="space-y-3">
                {["Web Development", "Mobile Development", "UI/UX Design", "Consulting"].map(
                  (service) => (
                    <motion.a
                      key={service}
                      href={`#`}
                      className="group flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                      whileHover={{ x: 6, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 250 }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500 mr-2">
                        •
                      </span>
                      {service}
                    </motion.a>
                  )
                )}
              </nav>
            </div>

            {/* Legal */}
            <div className="flex-1 min-w-[150px]">
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <nav className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((legal) => (
                  <motion.a
                    key={legal}
                    href={`#`}
                    className="group flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                    whileHover={{ x: 6, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 250 }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500 mr-2">
                      •
                    </span>
                    {legal}
                  </motion.a>
                ))}
              </nav>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="border-t border-gray-800 pt-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Animated Text */}
            <motion.p
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-gray-400 flex items-center gap-2"
            >
              Made with{" "}
              <Heart
                className="text-red-500 animate-pulse"
                size={16}
                fill="currentColor"
              />
              Omkar Mahabdi
            </motion.p>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Omkar Mahabdi. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
