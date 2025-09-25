import RollingGallery from "./RollingGallery";

const Skills: React.FC = () => {
  return (
    <section id="skills" className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            My Skills
          </span>
          {' '}& Expertise
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
          I specialize in building scalable, high-performance web applications. Here's a quick look at my core competencies.
        </p>
        <RollingGallery autoplay pauseOnHover />
      </div>
    </section>
  );
};

export default Skills;
