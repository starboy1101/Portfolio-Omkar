import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useAnimation, useTransform, PanInfo, ResolvedValues } from 'motion/react';

const SKILLS: string[] = [
  'HTML',
  'CSS',
  'Django',
  'Tailwind CSS',
  'JavaScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'C++',
  'Java',
  'SQL',
  'Git',
  'MongoDB',
  'PostgreSQL'
];

interface RollingGalleryProps {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  skills?: string[];
}

const RollingGallery: React.FC<RollingGalleryProps> = ({ autoplay = false, pauseOnHover = false, skills = [] }) => {
  const gallerySkills = skills.length > 0 ? skills : SKILLS;

  const [isScreenSizeSm, setIsScreenSizeSm] = useState<boolean>(window.innerWidth <= 640);
  useEffect(() => {
    const handleResize = () => setIsScreenSizeSm(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  const cylinderWidth: number = isScreenSizeSm ? 1100 : 1800;
  const faceCount: number = 12;
  const faceWidth: number = (cylinderWidth / faceCount) * 1; // fill edge-to-edge
  const radius: number = cylinderWidth / (2 * Math.PI);

  const dragFactor: number = 0.05;
  const rotation = useMotionValue(0);
  const controls = useAnimation();

  const transform = useTransform(rotation, (val: number) => `rotate3d(0,1,0,${val}deg)`);

  const startInfiniteSpin = (startAngle: number) => {
    controls.start({
      rotateY: [startAngle, startAngle - 360],
      transition: {
        duration: 20,
        ease: 'linear',
        repeat: Infinity
      }
    });
  };

  useEffect(() => {
    if (autoplay) {
      const currentAngle = rotation.get();
      startInfiniteSpin(currentAngle);
    } else {
      controls.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const handleUpdate = (latest: ResolvedValues) => {
    if (typeof latest.rotateY === 'number') {
      rotation.set(latest.rotateY);
    }
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    controls.stop();
    rotation.set(rotation.get() + info.offset.x * dragFactor);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const finalAngle = rotation.get() + info.velocity.x * dragFactor;
    rotation.set(finalAngle);
    if (autoplay) {
      startInfiniteSpin(finalAngle);
    }
  };

  const handleMouseEnter = (): void => {
    if (autoplay && pauseOnHover) {
      controls.stop();
    }
  };

  const handleMouseLeave = (): void => {
    if (autoplay && pauseOnHover) {
      const currentAngle = rotation.get();
      startInfiniteSpin(currentAngle);
    }
  };

  return (
    <div className="relative h-[250px] w-full overflow-hidden">
      <div
        className="absolute top-0 left-0 h-full w-[100px] z-10 pointer-events-none 
                  bg-gradient-to-l from-transparent to-white dark:to-gray-900"
      />
      <div
        className="absolute top-0 right-0 h-full w-[100px] z-10 pointer-events-none 
                  bg-gradient-to-r from-transparent to-white dark:to-gray-900"
      />
      <div className="flex h-full items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
        <motion.div
          drag="x"
          dragElastic={0}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          animate={controls}
          onUpdate={handleUpdate}
          style={{
            transform: transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: 'preserve-3d'
          }}
          className="flex min-h-[200px] cursor-grab items-center justify-center [transform-style:preserve-3d]"
        >
          {gallerySkills.map((skill, i) => (
            <div
              key={i}
              className="group absolute flex items-center justify-center [backface-visibility:hidden]"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${(360 / faceCount) * i}deg) translateZ(${radius}px)`
              }}
            >
              <div className="pointer-events-none flex h-[100px] w-full items-center justify-center rounded-[20px] border border-gray-400 bg-black text-xl font-bold text-white shadow-md transition-transform duration-300 ease-out group-hover:scale-105 dark:bg-white dark:text-black sm:h-[100px]">
                {skill}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RollingGallery;
