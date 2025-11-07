/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useState} from 'react';
import {PromptFormat, YouTubeIntroInputs} from '../types';
import {trackEvent} from '../utils/analytics';
import {SparklesIcon} from './icons';

interface YouTubeIntroGeneratorProps {
  onGenerateYouTubeIntroPrompt: (
    channelName: string,
    videoTopic: string,
    visualStyle: string,
    energy: string,
    specificElements: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
  ) => Promise<string>;
  onPromptGenerated: (prompt: string) => void;
  initialData?: YouTubeIntroInputs;
  includeTextOnImage: boolean;
  onIncludeTextOnImageChange: (include: boolean) => void;
}

const VISUAL_STYLES = [
  'Clean & Minimalist',
  'Gaming / Neon',
  'Vlog / Cinematic',
  'Corporate / Professional',
  'Grunge / Energetic',
];

const ENERGY_LEVELS = ['High-Energy & Fast', 'Calm & Relaxing', 'Modern & Upbeat'];

export const YouTubeIntroGenerator: React.FC<YouTubeIntroGeneratorProps> = ({
  onGenerateYouTubeIntroPrompt,
  onPromptGenerated,
  initialData,
  includeTextOnImage,
  onIncludeTextOnImageChange,
}) => {
  const [channelName, setChannelName] = useState(initialData?.channelName ?? '');
  const [videoTopic, setVideoTopic] = useState(initialData?.videoTopic ?? '');
  const [visualStyle, setVisualStyle] = useState(
    initialData?.visualStyle ?? VISUAL_STYLES[0],
  );
  const [energy, setEnergy] = useState(initialData?.energy ?? ENERGY_LEVELS[0]);
  const [specificElements, setSpecificElements] = useState(
    initialData?.specificElements ??
      'My channel logo, my social media handles (@YourHandle), a subscribe button.',
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptFormat, setPromptFormat] =
    useState<PromptFormat>('detailed-cinematic');

  useEffect(() => {
    if (initialData) {
      setChannelName(initialData.channelName);
      setVideoTopic(initialData.videoTopic);
      setVisualStyle(initialData.visualStyle);
      setEnergy(initialData.energy);
      setSpecificElements(initialData.specificElements);
    }
  }, [initialData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    onPromptGenerated('');
    trackEvent('generate_youtube_intro_prompt', {
      style: visualStyle,
      energy: energy,
      prompt_format: promptFormat,
      include_text_on_image: includeTextOnImage,
    });
    try {
      const prompt = await onGenerateYouTubeIntroPrompt(
        channelName,
        videoTopic,
        visualStyle,
        energy,
        specificElements,
        promptFormat,
        includeTextOnImage,
      );
      onPromptGenerated(prompt);
    } catch (error) {
      console.error('Failed to generate YouTube intro prompt', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = channelName.trim() !== '' && videoTopic.trim() !== '';

  return (
    <>
      <div className="mb-6">
        <label
          htmlFor="channelName"
          className="block text-sm font-medium text-gray-300 mb-2">
          1. What's your Channel Name?
        </label>
        <input
          id="channelName"
          type="text"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="e.g., Pixel Pioneers"
          aria-label="Channel Name"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="videoTopic"
          className="block text-sm font-medium text-gray-300 mb-2">
          2. What's the topic or theme of your channel?
        </label>
        <input
          id="videoTopic"
          type="text"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
          value={videoTopic}
          onChange={(e) => setVideoTopic(e.target.value)}
          placeholder="e.g., Retro gaming reviews and history"
          aria-label="Video Topic"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            3. Select Visual Style
          </label>
          <div className="flex flex-wrap gap-2">
            {VISUAL_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setVisualStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors w-full text-left ${
                  visualStyle === style
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}>
                {style}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            4. Select Energy Level
          </label>
          <div className="flex flex-wrap gap-2">
            {ENERGY_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setEnergy(level)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors w-full text-left ${
                  energy === level
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}>
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="specificElements"
          className="block text-sm font-medium text-gray-300 mb-2">
          5. Specific elements to include?
        </label>
        <textarea
          id="specificElements"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
          value={specificElements}
          onChange={(e) => setSpecificElements(e.target.value)}
          placeholder="e.g., My channel logo, my social media handles (@YourHandle), a subscribe button."
          aria-label="Specific Elements"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          6. Visual Details
        </label>
        <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
          <span className="text-gray-200" id="yt-text-on-image-label">
            Include on-screen text
          </span>
          <button
            type="button"
            onClick={() => onIncludeTextOnImageChange(!includeTextOnImage)}
            className={`${
              includeTextOnImage ? 'bg-purple-600' : 'bg-gray-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
            role="switch"
            aria-checked={includeTextOnImage}
            aria-labelledby="yt-text-on-image-label">
            <span
              aria-hidden="true"
              className={`${
                includeTextOnImage ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 px-1">
          If turned off, the AI will try to represent your channel name and other elements visually, without literal text.
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          7. Select Prompt Format
        </label>
        <div className="flex w-full rounded-lg bg-gray-900 p-1 border border-gray-700">
          <button
            onClick={() => setPromptFormat('detailed-cinematic')}
            className={`w-1/2 rounded-md py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 ${
              promptFormat === 'detailed-cinematic'
                ? 'bg-purple-600 text-white'
                : 'bg-transparent text-gray-300 hover:bg-gray-700'
            }`}>
            Detailed Cinematic
          </button>
          <button
            onClick={() => setPromptFormat('hailuo-compact')}
            className={`w-1/2 rounded-md py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 ${
              promptFormat === 'hailuo-compact'
                ? 'bg-purple-600 text-white'
                : 'bg-transparent text-gray-300 hover:bg-gray-700'
            }`}>
            Hailuo AI (Compact)
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 px-1">
          {promptFormat === 'detailed-cinematic'
            ? 'Generates a highly detailed JSON array, one object per scene. Best for maximum control.'
            : 'Generates a compact JSON object (< 2000 chars). Optimized for Hailuo AI.'}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          8. Generate Director's Prompt
        </label>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full flex justify-center items-center gap-2 mb-3 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-base">
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
              <span>Generating Prompt...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Generate Director's Prompt</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};
