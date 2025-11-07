/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState} from 'react';
import {VisualExplainerScene} from './AnimateImagePage';
import {
  ClipboardDocumentListIcon,
  MusicalNoteIcon,
  PhotoIcon,
} from './icons';

interface ExplainerStoryboardOutputProps {
  data: VisualExplainerScene[] | null;
  isLoading: boolean;
  fullPrompt: string;
  onEditPrompt: (newPrompt: string) => void;
}

const SceneCard: React.FC<{
  sceneData: VisualExplainerScene;
  index: number;
}> = ({sceneData, index}) => {
  const {sceneData: scene, image} = sceneData;
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompt');

  const handleCopy = () => {
    if (scene.description) {
      navigator.clipboard.writeText(scene.description);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Prompt'), 2000);
    }
  };

  const voiceover = scene?.audio?.voice;

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden flex flex-col md:flex-row gap-4">
      <div className="md:w-1/3 flex-shrink-0">
        <div className="aspect-w-16 aspect-h-9 bg-gray-700">
          {image ? (
            <img
              src={`data:image/jpeg;base64,${image}`}
              alt={`Generated visual for Scene ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 text-gray-500">
              <PhotoIcon className="w-10 h-10 mb-2" />
              <p className="text-xs">Image Failed to Generate</p>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 flex-1">
        <h4 className="font-bold text-white mb-2">Shot {index + 1}</h4>
        {voiceover && (
          <div className="flex items-start gap-2 mb-3">
            <MusicalNoteIcon className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-300 italic">"{voiceover}"</p>
          </div>
        )}
        <p className="text-xs text-gray-400 font-mono bg-black/30 p-2 rounded mb-3 max-h-24 overflow-y-auto">
          {scene.description}
        </p>
        <button
          onClick={handleCopy}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors text-xs disabled:bg-gray-500/50 disabled:cursor-not-allowed">
          <ClipboardDocumentListIcon className="w-4 h-4" />
          {copyButtonText}
        </button>
      </div>
    </div>
  );
};

export const ExplainerStoryboardOutput: React.FC<
  ExplainerStoryboardOutputProps
> = ({data, isLoading, fullPrompt, onEditPrompt}) => {
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  if (isLoading) {
    return (
      <div className="mb-6 mt-6 border-t border-gray-700 pt-6 text-center">
        <div className="flex justify-center items-center gap-3">
          <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-purple-400"></div>
          <p className="text-gray-300">Generating visual storyboard...</p>
        </div>
      </div>
    );
  }

  if (!data && !fullPrompt) {
    // Nothing has been generated yet
    return null;
  }

  if (!data || data.length === 0) {
    // Generation finished, but no valid scenes were created. Show the raw prompt for debugging.
    return (
      <div className="mb-6 mt-6 border-t border-gray-700 pt-6">
        <label
          htmlFor="master-prompt"
          className="block text-sm font-medium text-gray-300 mb-2">
          Generated Output (JSON)
        </label>
        <p className="text-xs text-yellow-400 mb-2">
          Could not generate visual storyboard. You can edit the raw JSON below.
        </p>
        <textarea
          id="master-prompt"
          rows={12}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 font-mono text-sm"
          value={fullPrompt}
          onChange={(e) => onEditPrompt(e.target.value)}
          placeholder="The AI-generated director's prompt(s) will appear here."
          aria-label="Master animation prompt"
        />
      </div>
    );
  }

  return (
    <div className="mb-6 mt-6 border-t border-gray-700 pt-6">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-300">
          Visual Storyboard & Prompts
        </label>
        <button
          onClick={() => setShowFullPrompt(!showFullPrompt)}
          className="text-xs text-purple-400 hover:text-purple-300">
          {showFullPrompt ? 'Hide Full JSON' : 'Show Full JSON'}
        </button>
      </div>
      <div className="space-y-4">
        {data.map((sceneData, index) => (
          <SceneCard key={index} sceneData={sceneData} index={index} />
        ))}
      </div>
      {showFullPrompt && (
        <div className="mt-6">
          <label
            htmlFor="master-prompt-json"
            className="block text-sm font-medium text-gray-300 mb-2">
            Full JSON Output
          </label>
          <textarea
            id="master-prompt-json"
            rows={15}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 font-mono text-sm"
            value={fullPrompt}
            onChange={(e) => onEditPrompt(e.target.value)}
            aria-label="Full JSON prompt"
          />
        </div>
      )}
    </div>
  );
};
