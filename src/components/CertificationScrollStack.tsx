import { useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";
import GENAI from "../assets/Genai.png";
import DATASCIENCE from "../assets/Datascience.png";
import VECTOR from "../assets/vector.png";
import HACKERRANK from "../assets/Hackerrank.png";
import './scrollStack.css';

const CertificationScrollStack = () => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStackComplete = () => {
  setIsCompleted(true);

  // Scroll the main page down by some offset smoothly
  window.scrollTo({
    top: window.scrollY + 400, // adjust 500 to how much you want to scroll
    behavior: 'smooth'
  });
};

  return (
    <Box position="relative" h={600} overflow="hidden">
      {/* Center text */}
      <Text
        textAlign="center"
        color="#e201c0ff"
        fontSize="clamp(2rem, 3vw, 3rem)"
        fontWeight={700}
        position="absolute"
        top="25%"
        left="50%"
        transform="translate(-50%, -50%)"
        pointerEvents="none"
        transition="all 0.3s ease"
      >
        {isCompleted ? "Certifications Unlocked!" : "Scroll to View Certifications!"}
      </Text>

      {/* Scroll Stack */}
      <ScrollStack
        itemDistance={200}
        itemStackDistance={20}
        stackPosition="30%"
        baseScale={0.85}
        rotationAmount={0}
        blurAmount={2}
        onStackComplete={handleStackComplete}
      >
        <ScrollStackItem itemClassName="scroll-stack-card-demo ssc-demo-1">
          <div className="stack-img-container">
            <img src={GENAI}/>
          </div>
          <div className="card-content">
            <h3>OCI Generative AI Professional</h3>
            <p>The Oracle Cloud Infrastructure 2025 Generative AI Professional certification is for developers and ML/AI engineers. It requires basic ML, Deep Learning, and Python knowledge. Certified individuals learn LLMs and OCI Generative AI Service. They also gain skills in Retrieval-Augmented Generation, Semantic Search, and LangChain for building AI applications.</p>
          </div>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="scroll-stack-card-demo ssc-demo-2">
          <div className="stack-img-container">
            <img src={DATASCIENCE}/>
          </div>
          <div className="card-content">
            <h3>OCI Data Science Professional</h3>
            <p>The Oracle Cloud Infrastructure Data Science Professional certification is for data scientists and ML professionals. It focuses on building and managing end-to-end machine learning solutions. Certified individuals can identify the right OCI services for business use cases. It also validates expertise in applying machine learning best practices effectively.</p>
          </div>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="scroll-stack-card-demo ssc-demo-3">
          <div className="stack-img-container">
            <img src={VECTOR}/>
          </div>
          <div className="card-content">
            <h3>Oracle AI Vector Search Professional</h3>
            <p>The Oracle AI Vector Search Professional certification is for DBAs, AI engineers, and cloud developers. It focuses on using Oracle Database 23ai to manage vector data and enable semantic search. Candidates learn vector storage, indexing, embeddings, and RAG app development using PL/SQL and Python. The certification also covers Exadata AI Storage, GoldenGate, and Select AI for enterprise AI integration.</p>
          </div>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="scroll-stack-card-demo ssc-demo-4">
          <div className="stack-img-container">
            <img src={GENAI}/>
          </div>
          <div className="card-content">
            <h3>OCI AI Foundations Associate</h3>
            <p>The OCI AI Foundations learning path introduces the core concepts of AI, Machine Learning, Deep Learning, and Generative AI. It emphasizes practical applications using Oracle Cloud Infrastructure. This course helps learners build a strong foundation in modern AI technologies. It’s ideal for beginners with no prior experience in AI or ML.</p>
          </div>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="scroll-stack-card-demo ssc-demo-3">
          <div className="stack-img-container">
            <img src={HACKERRANK}/>
          </div>
          <div className="card-content">
            <h3>Software Engineer Certificate</h3>
            <p>The Software Engineer certification focuses on core development and system design skills. It includes hands-on practice in problem-solving and algorithmic thinking. Candidates gain expertise in working with SQL databases and RESTful APIs. This certification builds a solid base for backend and full-stack engineering roles.</p>
          </div>
        </ScrollStackItem>
      </ScrollStack>
    </Box>
  );
};

export default CertificationScrollStack;
