import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

function TypeWriter({ content, speed = 5, chunkSize = 5 }) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reset when content changes
    setDisplayedContent('');
    setIndex(0);
  }, [content]);

  useEffect(() => {
    if (!content || index >= content.length) return;

    const timer = setTimeout(() => {
      // Process multiple characters at once for faster typing
      const nextChunk = content.substring(index, index + chunkSize);
      setDisplayedContent(prev => prev + nextChunk);
      setIndex(prev => prev + chunkSize);
    }, speed);

    return () => clearTimeout(timer);
  }, [index, content, speed, chunkSize]);

  return (
    <div className="typewriter">
      <Markdown>{displayedContent}</Markdown>
      {index < content?.length && (
        <span className="cursor"></span>
      )}
    </div>
  );
}

export default TypeWriter; 