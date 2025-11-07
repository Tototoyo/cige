/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useState} from 'react';
import {KineticTypographyInputs, PromptFormat} from '../types';
import {trackEvent} from '../utils/analytics';
import {SparklesIcon} from './icons';

interface KineticTypographyGeneratorProps {
  onGenerateKineticTypographyPrompt: (
    script: string,
    visualStyle: string,
    energy: string,
    background: string,
    colorPalette: string,
    music: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
  ) => Promise<string>;
  onPromptGenerated: (prompt: string) => void;
  initialData?: KineticTypographyInputs;
  includeTextOnImage: boolean;
  onIncludeTextOnImageChange: (include: boolean) => void;
}

const VISUAL_STYLES = [
  'Minimal & Clean',
  'Bold & Energetic',
  'Vintage & Grungy',
  'Corporate & Professional',
  'Playful & Whimsical',
  'Futuristic & Techy',
];

const ENERGY_LEVELS = [
  'Fast-Paced & Punchy',
  'Smooth & Rhythmic',
  'Elegant & Calm',
];

export const KineticTypographyGenerator: React.FC<
  KineticTypographyGeneratorProps
> = ({
  onGenerateKineticTypographyPrompt,
  onPromptGenerated,
  initialData,
  includeTextOnImage,
  onIncludeTextOnImageChange,
}) => {
  const [script, setScript] = useState(initialData?.script ?? '');
  const [visualStyle, setVisualStyle] = useState(
    initialData?.visualStyle ?? VISUAL_STYLES[0],
  );
  const [energy, setEnergy] = useState(initialData?.energy ?? ENERGY_LEVELS[0]);
  const [background, setBackground] = useState(
    initialData?.background ?? 'A clean, solid dark gray background.',
  );
  const [colorPalette, setColorPalette] = useState(
    initialData?.colorPalette ??
      'A simple black and white palette with a single bright yellow accent color for emphasis.',
  );
  const [music, setMusic] = useState(
    initialData?.music ??
      'An upbeat, funky electronic track with a prominent bassline.',
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptFormat, setPromptFormat] =
    useState<PromptFormat>('detailed-cinematic');

  useEffect(() => {
    if (initialData) {
      setScript(initialData.script);
      setVisualStyle(initialData.visualStyle);
      setEnergy(initialData.energy);
      setBackground(initialData.background);
      setColorPalette(initialData.colorPalette);
      setMusic(initialData.music);
    }
  }, [initialData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    onPromptGenerated('');
    trackEvent('generate_kinetic_typography_prompt', {
      style: visualStyle,
      energy: energy,
      prompt_format: promptFormat,
      include_text_on_image: includeTextOnImage,
    });
    try {
      const prompt = await onGenerateKineticTypographyPrompt(
        script,
        visualStyle,
        energy,
        background,
        colorPalette,
        music,
        promptFormat,
        includeTextOnImage,
      );
      onPromptGenerated(prompt);
    } catch (error) {
      console.error('Failed to generate kinetic typography prompt', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = script.trim() !== '';

  return (
    <>
      <div className="mb-6">
        <label
          htmlFor="script"
          className="block text-sm font-medium text-gray-300 mb-2">
          1. Your Script
        </label>
        <textarea
          id="script"
          rows={6}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter your full script here. The AI will break it down into animated scenes."
          aria-label="Script for kinetic typography"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            2. Select Visual Style
          </label>
          <div className="flex flex-col gap-2">
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
            3. Select Pacing & Energy
          </label>
          <div className="flex flex-col gap-2">
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
          htmlFor="background-color-desc"
          className="block text-sm font-medium text-gray-300 mb-2">
          4. Describe Background & Colors
        </label>
        <textarea
          id="background-color-desc"
          rows={2}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 mb-3"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          placeholder="e.g., A dark, textured background with subtle light leaks."
          aria-label="Background description"
        />
        <textarea
          id="color-palette-desc"
          rows={2}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
          value={colorPalette}
          onChange={(e) => setColorPalette(e.target.value)}
          placeholder="e.g., A monochrome palette of black and white with a single accent of hot pink."
          aria-label="Color palette description"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="music-desc"
          className="block text-sm font-medium text-gray-300 mb-2">
          5. Describe Music/SFX Cues (Optional)
        </label>
        <textarea
          id="music-desc"
          rows={2}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
          value={music}
          onChange={(e) => setMusic(e.target.value)}
          placeholder="e.g., An upbeat, funky electronic track with a prominent bassline."
          aria-label="Music and SFX description"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          6. Visual Details
        </label>
        <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
          <span className="text-gray-200" id="kinetic-text-on-image-label">
            Generate Text on Images
          </span>
          <button
            type="button"
            onClick={() => onIncludeTextOnImageChange(!includeTextOnImage)}
            className={`${
              includeTextOnImage ? 'bg-purple-600' : 'bg-gray-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
            role="switch"
            aria-checked={includeTextOnImage}
            aria-labelledby="kinetic-text-on-image-label">
            <span
              aria-hidden="true"
              className={`${
                includeTextOnImage ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 px-1">
          For kinetic typography, this should almost always be on. Turning it
          off may result in abstract background animations instead of text.
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
            ? 'Generates a highly detailed JSON array, one object per animated phrase. Best for maximum control.'
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
