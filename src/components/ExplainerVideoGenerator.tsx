/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useState} from 'react';
import {ExplainerInputs, PromptFormat} from '../types';
import {trackEvent} from '../utils/analytics';
import {PlusIcon, SparklesIcon, TrashIcon} from './icons';

interface ExplainerVideoGeneratorProps {
  onGenerateExplainerVideoPrompt: (
    topic: string,
    keyPoints: string[],
    style: string,
    audience: string,
    cta: string,
    duration: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
  ) => Promise<string>;
  onPromptGenerated: (prompt: string) => void;
  initialData?: ExplainerInputs;
  includeTextOnImage: boolean;
  onIncludeTextOnImageChange: (include: boolean) => void;
  generateVisuals: boolean;
  onGenerateVisualsChange: (generate: boolean) => void;
}

const VISUAL_STYLES = [
  'Clean Vector Animation',
  'Photorealistic 3D Render',
  'Hand-Drawn Pencil Sketch',
  'Vintage Cartoon Style',
  'Anime-Inspired',
  'Pixel Art',
  'Low-Poly 3D',
  'Claymation-Inspired',
  'Stylized Cel-Shaded 3D',
  'Isometric Graphics',
  'Whiteboard Animation',
];

const VIDEO_DURATIONS = ['15s', '30s', '60s'];

export const ExplainerVideoGenerator: React.FC<
  ExplainerVideoGeneratorProps
> = ({
  onGenerateExplainerVideoPrompt,
  onPromptGenerated,
  initialData,
  includeTextOnImage,
  onIncludeTextOnImageChange,
  generateVisuals,
  onGenerateVisualsChange,
}) => {
  const [topic, setTopic] = useState(initialData?.topic ?? '');
  const [keyPoints, setKeyPoints] = useState<string[]>(
    initialData?.keyPoints ?? [''],
  );
  const [visualStyle, setVisualStyle] = useState(
    initialData?.visualStyle ?? VISUAL_STYLES[0],
  );
  const [duration, setDuration] = useState(
    initialData?.duration ?? VIDEO_DURATIONS[1],
  );
  const [audience, setAudience] = useState(
    initialData?.audience ?? 'A general audience',
  );
  const [cta, setCta] = useState(
    initialData?.cta ?? 'Visit our website to learn more!',
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptFormat, setPromptFormat] =
    useState<PromptFormat>('detailed-cinematic');

  useEffect(() => {
    if (initialData) {
      setTopic(initialData.topic);
      setKeyPoints(
        initialData.keyPoints.length > 0 ? initialData.keyPoints : [''],
      );
      setVisualStyle(initialData.visualStyle);
      setDuration(initialData.duration);
      setAudience(initialData.audience);
      setCta(initialData.cta);
    }
  }, [initialData]);

  const handleKeyPointChange = (index: number, value: string) => {
    const newKeyPoints = [...keyPoints];
    newKeyPoints[index] = value;
    setKeyPoints(newKeyPoints);
  };

  const handleAddKeyPoint = () => {
    setKeyPoints([...keyPoints, '']);
  };

  const handleDeleteKeyPoint = (index: number) => {
    const newKeyPoints = keyPoints.filter((_, i) => i !== index);
    if (newKeyPoints.length === 0) {
      setKeyPoints(['']);
    } else {
      setKeyPoints(newKeyPoints);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    onPromptGenerated('');
    trackEvent('generate_explainer_prompt', {
      style: visualStyle,
      key_points_count: keyPoints.filter((k) => k.trim()).length,
      duration,
      prompt_format: promptFormat,
      include_text_on_image: includeTextOnImage,
      generate_visuals: generateVisuals,
    });
    try {
      const prompt = await onGenerateExplainerVideoPrompt(
        topic,
        keyPoints.filter((k) => k.trim()),
        visualStyle,
        audience,
        cta,
        duration,
        promptFormat,
        includeTextOnImage,
      );
      onPromptGenerated(prompt);
    } catch (error) {
      console.error('Failed to generate explainer video prompt', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = topic.trim() !== '';

  return (
    <>
      <div className="mb-6">
        <label
          htmlFor="topic"
          className="block text-sm font-medium text-gray-300 mb-2">
          1. What is your video about?
        </label>
        <input
          id="topic"
          type="text"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., How photosynthesis works"
          aria-label="Video Topic"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          2. Key Points to Cover (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-2 -mt-2">
          If left blank, our AI expert will create the key points for you.
        </p>
        <div className="space-y-3">
          {keyPoints.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                className="flex-grow bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
                value={point}
                onChange={(e) => handleKeyPointChange(index, e.target.value)}
                placeholder={`Key Point ${index + 1}`}
                aria-label={`Key Point ${index + 1}`}
              />
              <button
                onClick={() => handleDeleteKeyPoint(index)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                aria-label={`Delete key point ${index + 1}`}>
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddKeyPoint}
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-purple-300 font-semibold hover:bg-purple-500/10 rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Add Key Point
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            3. Select Video Duration
          </label>
          <div className="flex flex-col gap-2">
            {VIDEO_DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors w-full text-center ${
                  duration === d
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            4. Select Visual Style
          </label>
          <div className="flex flex-col gap-2">
            {VISUAL_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setVisualStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors w-full text-center ${
                  visualStyle === style
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}>
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          5. Generation Options
        </label>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
            <span className="text-gray-200" id="visuals-label">
              Generate visual storyboard
            </span>
            <button
              type="button"
              onClick={() => onGenerateVisualsChange(!generateVisuals)}
              className={`${
                generateVisuals ? 'bg-purple-600' : 'bg-gray-600'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
              role="switch"
              aria-checked={generateVisuals}
              aria-labelledby="visuals-label">
              <span
                aria-hidden="true"
                className={`${
                  generateVisuals ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-400 -mt-2 px-1">
            Disable this to only generate the script and director's prompts.
          </p>

          <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
            <span className="text-gray-200" id="text-on-image-label">
              Include text overlays on images
            </span>
            <button
              type="button"
              onClick={() => onIncludeTextOnImageChange(!includeTextOnImage)}
              className={`${
                includeTextOnImage ? 'bg-purple-600' : 'bg-gray-600'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
              role="switch"
              aria-checked={includeTextOnImage}
              aria-labelledby="text-on-image-label"
              disabled={!generateVisuals}>
              <span
                aria-hidden="true"
                className={`${
                  includeTextOnImage ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-400 -mt-2 px-1">
            If off, the AI will avoid text on storyboard images.{' '}
            {!generateVisuals && (
              <span className="text-yellow-500">
                (Disabled because visual generation is off)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label
            htmlFor="audience"
            className="block text-sm font-medium text-gray-300 mb-2">
            6. Target Audience
          </label>
          <input
            id="audience"
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., High school students"
          />
        </div>
        <div>
          <label
            htmlFor="cta"
            className="block text-sm font-medium text-gray-300 mb-2">
            7. Call to Action (CTA)
          </label>
          <input
            id="cta"
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder="e.g., Subscribe for more science videos!"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          8. Select Prompt Format
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
            ? 'Generates a visual storyboard and a detailed JSON array. Best for maximum control.'
            : 'Generates a compact JSON object (< 2000 chars) with the full script. Optimized for Hailuo AI.'}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          9. Generate Storyboard & Prompts
        </label>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full flex justify-center items-center gap-2 mb-3 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-base">
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
              <span>Generating Script & Prompts...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Generate with AI</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};
