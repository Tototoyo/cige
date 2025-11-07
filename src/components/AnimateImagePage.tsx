/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useState} from 'react';
import {GALLERY_ITEMS} from '../constants';
import {useAuth} from '../contexts/AuthContext';
import {
  ExplainerInputs,
  HistoryItem,
  KineticTypographyInputs,
  LogoInputs,
  PromptFormat,
  StoryboardInputs,
  Video,
  VideoType,
  YouTubeIntroInputs,
} from '../types';
import {trackEvent} from '../utils/analytics';
import {AdPlaceholder} from './AdPlaceholder';
import {CostEstimator} from './CostEstimator';
import {ExplainerVideoGenerator} from './ExplainerVideoGenerator';
import {ExplainerStoryboardOutput} from './ExplainerStoryboardOutput';
import {HistoryPage} from './HistoryPage';
import {
  Bars3BottomLeftIcon,
  BookOpenIcon,
  ChainIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentListIcon,
  CubeTransparentIcon,
  CurrencyDollarIcon,
  FilmIcon,
  InformationCircleIcon,
  MusicalNoteIcon,
  PhotoIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  VideoCameraIcon,
} from './icons';
import {KineticTypographyGenerator} from './KineticTypographyGenerator';
import {LogoAnimator} from './LogoAnimator';
import {VideoGrid} from './VideoGrid';
import {YouTubeIntroGenerator} from './YouTubeIntroGenerator';

// This is the combined data structure for an explainer video scene, including the prompt-generated data and the client-side generated image
export interface VisualExplainerScene {
  sceneData: any; // The JSON object for the scene from the master prompt
  image: string | null; // base64 encoded image string
}

interface Scene {
  description: string;
  shotCount: number;
}
interface AnimateImagePageProps {
  onAnimate: (
    prompt: string,
    imageFile: File | null,
    includeTextOnImage: boolean,
  ) => void;
  onPlayVideo: (video: Video) => void;
  onGenerateStoryboard: (
    scenes: Scene[],
    imageFile: File | null,
    selectedStyle: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
    generateVisuals: boolean,
  ) => Promise<{prompts: string; sceneImages: (string | null)[]}>;
  onGenerateLogoPrompt: (
    logoFile: File,
    animationStyle: string,
    background: string,
    sfx: string,
    tagline: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
  ) => Promise<string>;
  onGenerateYouTubeIntroPrompt: (
    channelName: string,
    videoTopic: string,
    visualStyle: string,
    energy: string,
    specificElements: string,
    promptFormat: PromptFormat,
    includeTextOnImage: boolean,
  ) => Promise<string>;
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
  onGenerateImageForCard: (
    prompt: string,
    includeTextOnImage: boolean,
  ) => Promise<string>;
  onGenerateSceneDescriptions: (
    generalIdea: string,
    sceneCount: number,
  ) => Promise<string[]>;
  onGenerateNextScene: (
    existingMasterPrompt: string,
    existingVisuals: (string | null)[],
    existingScenes: string[],
    styleImageFile: File | null,
    selectedStyleName: string,
    includeTextOnImage: boolean,
  ) => Promise<{
    newSceneDescription: string;
    newScenePrompt: object;
    newVisual: string | null;
  }>;
}

const CINEMATIC_STYLES = [
  {
    name: 'No Style',
    description: 'Relies on the reference image or scene descriptions.',
    imageUrl:
      'https://storage.googleapis.com/aistudio-hosting/story-workshop/style-cinematic.jpg',
  },
  {
    name: 'Cinematic',
    description: 'Photorealistic, dramatic lighting, high contrast.',
    imageUrl:
      'https://storage.googleapis.com/aistudio-hosting/story-workshop/style-cinematic.jpg',
  },
  {
    name: 'Noir Thriller',
    description: 'Black and white, high contrast, shadows, mysterious mood.',
    imageUrl:
      'https://storage.googleapis.com/aistudio-hosting/story-workshop/style-noir.jpg',
  },
  {
    name: 'Epic Fantasy',
    description:
      'Grandiose landscapes, magical elements, rich, vibrant colors.',
    imageUrl:
      'https://storage.googleapis.com/aistudio-hosting/story-workshop/style-fantasy.jpg',
  },
  {
    name: 'Sci-Fi Dystopian',
    description:
      'Futuristic, gritty, neon lights against dark backgrounds, cool color palette.',
    imageUrl:
      'https://storage.googleapis.com/aistudio-hosting/story-workshop/style-scifi.jpg',
  },
  {
    name: 'Pixar Animation',
    description:
      'Warm, colorful, soft lighting, friendly character design, 3D rendered look.',
    imageUrl:
      'https://storage.googleapis.com/aistudio-hosting/story-workshop/style-pixar.jpg',
  },
  {
    name: 'Studio Ghibli',
    description:
      'Hand-drawn anime style, lush natural backgrounds, watercolor aesthetic, whimsical feel.',
    imageUrl:
      'https://storage.googleapis.com/aistudio-hosting/story-workshop/style-ghibli.jpg',
  },
];

const StoryboardGenerator: React.FC<{
  onGenerateStoryboard: AnimateImagePageProps['onGenerateStoryboard'];
  onGenerateSceneDescriptions: AnimateImagePageProps['onGenerateSceneDescriptions'];
  onPromptGenerated: (prompt: string) => void;
  onVisualsGenerated: (visuals: (string | null)[]) => void;
  // All state is now controlled by the parent component
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  selectedStyle: typeof CINEMATIC_STYLES[0];
  setSelectedStyle: (style: typeof CINEMATIC_STYLES[0]) => void;
  promptFormat: PromptFormat;
  setPromptFormat: (format: PromptFormat) => void;
  generalIdea: string;
  setGeneralIdea: (idea: string) => void;
  sceneCount: number;
  setSceneCount: (count: number) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  includeTextOnImage: boolean;
  onIncludeTextOnImageChange: (include: boolean) => void;
  generateVisuals: boolean;
  onGenerateVisualsChange: (generate: boolean) => void;
}> = ({
  onGenerateStoryboard,
  onGenerateSceneDescriptions,
  onPromptGenerated,
  onVisualsGenerated,
  scenes,
  setScenes,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  selectedStyle,
  setSelectedStyle,
  promptFormat,
  setPromptFormat,
  generalIdea,
  setGeneralIdea,
  sceneCount,
  setSceneCount,
  isGenerating,
  setIsGenerating,
  includeTextOnImage,
  onIncludeTextOnImageChange,
  generateVisuals,
  onGenerateVisualsChange,
}) => {
  const [showPromptingTips, setShowPromptingTips] = useState(false);
  const [isGeneratingScenes, setIsGeneratingScenes] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      handleFileChange(event.dataTransfer.files);
    },
    [handleFileChange],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleSceneChange = (index: number, value: string) => {
    const newScenes = [...scenes];
    newScenes[index].description = value;
    setScenes(newScenes);
  };

  const handleShotCountChange = (index: number, value: number) => {
    const count = Math.max(1, Math.min(10, value || 1)); // Clamp between 1 and 10, default to 1 if empty
    const newScenes = [...scenes];
    newScenes[index].shotCount = count;
    setScenes(newScenes);
  };

  const handleAddScene = () => {
    setScenes([...scenes, {description: '', shotCount: 1}]);
  };

  const handleDeleteScene = (index: number) => {
    const newScenes = scenes.filter((_, i) => i !== index);
    if (newScenes.length === 0) {
      setScenes([{description: '', shotCount: 1}]);
    } else {
      setScenes(newScenes);
    }
  };

  const handleGenerateSceneDescriptions = async () => {
    if (!generalIdea) return;
    setIsGeneratingScenes(true);
    trackEvent('generate_scene_descriptions', {
      scene_count: sceneCount,
    });
    try {
      const generatedScenes = await onGenerateSceneDescriptions(
        generalIdea,
        sceneCount,
      );
      setScenes(
        generatedScenes.map((desc) => ({description: desc, shotCount: 1})),
      );
    } catch (error) {
      console.error('Error generating scene descriptions:', error);
    } finally {
      setIsGeneratingScenes(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    setIsGenerating(true);
    onPromptGenerated('');
    onVisualsGenerated([]);
    trackEvent('generate_storyboard', {
      scene_count: scenes.filter((s) => s.description.trim()).length,
      has_reference_image: !!imageFile,
      style: selectedStyle.name,
      prompt_format: promptFormat,
      include_text_on_image: includeTextOnImage,
      generate_visuals: generateVisuals,
    });
    try {
      const {prompts, sceneImages} = await onGenerateStoryboard(
        scenes,
        imageFile,
        selectedStyle.name,
        promptFormat,
        includeTextOnImage,
        generateVisuals,
      );
      onPromptGenerated(prompts);
      onVisualsGenerated(sceneImages);
    } catch (error) {
      console.error('Error generating storyboard:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const allScenesEmpty = scenes.every((scene) => scene.description.trim() === '');

  return (
    <>
      {/* Step 1: Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          1. Set Visual Style (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-2 -mt-2">
          Upload a reference image to guide the artistic style of your
          storyboard.
        </p>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-purple-500 transition-colors"
          onClick={() => document.getElementById('file-upload')?.click()}>
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="mx-auto h-48 w-auto rounded-lg object-contain"
              />
            ) : (
              <>
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-400">
                  <p className="pl-1">Drag and drop or click to upload</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </>
            )}
          </div>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </div>
      </div>

      {/* Step 2: Outline Your Story */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          2. Outline Your Story
        </label>
        <p className="text-xs text-gray-500 mb-2 -mt-2">
          Give the AI a general idea, and it will write the scene descriptions
          for you.
        </p>
        <textarea
          id="general-idea"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
          value={generalIdea}
          onChange={(e) => setGeneralIdea(e.target.value)}
          placeholder="e.g., A lone astronaut discovers a mysterious alien artifact on a desolate red planet."
          aria-label="General idea for the story"
        />
        <div className="mt-3">
          <label
            htmlFor="scene-count"
            className="block text-xs font-medium text-gray-400 mb-1">
            Number of Scenes: <span className="font-bold">{sceneCount}</span>
          </label>
          <input
            id="scene-count"
            type="range"
            min="1"
            max="10"
            value={sceneCount}
            onChange={(e) => setSceneCount(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <button
          onClick={handleGenerateSceneDescriptions}
          disabled={!generalIdea.trim() || isGeneratingScenes}
          className="w-full flex justify-center items-center gap-2 mt-4 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-base">
          {isGeneratingScenes ? (
            <>
              <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
              <span>Writing your scenes...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Generate Scene Descriptions</span>
            </>
          )}
        </button>
      </div>

      {/* Step 3: Review & Refine Narrative */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          3. Review & Refine Your Narrative
        </label>
        <div className="mb-3">
          <button
            onClick={() => setShowPromptingTips(!showPromptingTips)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
            <InformationCircleIcon className="w-5 h-5" />
            <span>
              {showPromptingTips ? 'Hide' : 'Show'} Pro-level Prompting Tips
            </span>
          </button>
          {showPromptingTips && (
            <div className="mt-2 p-3 bg-gray-900/70 rounded-lg border border-gray-700 text-xs text-gray-400 animate-fade-in">
              <h4 className="font-semibold text-gray-300 mb-2">
                To create higher quality videos, consider these elements for
                each scene:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Subject:</strong> The "who" or "what" of your video.
                </li>
                <li>
                  <strong>Action:</strong> Describe movements, interactions,
                  etc.
                </li>
                <li>
                  <strong>Scene:</strong> The "where" and "when" of your video.
                </li>
                <li>
                  <strong>Camera Angles/Movements:</strong> For a more cinematic
                  feel.
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {scenes.map((scene, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-grow">
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
                  value={scene.description}
                  onChange={(e) => handleSceneChange(index, e.target.value)}
                  placeholder={`Scene ${index + 1} description`}
                  aria-label={`Storyboard scene ${index + 1}`}
                />
              </div>
              <div className="flex flex-col items-center">
                <label
                  htmlFor={`shots-${index}`}
                  className="block text-xs font-medium text-gray-400 mb-1">
                  Shots
                </label>
                <input
                  id={`shots-${index}`}
                  type="number"
                  min="1"
                  max="10"
                  value={scene.shotCount}
                  onChange={(e) =>
                    handleShotCountChange(index, parseInt(e.target.value, 10))
                  }
                  className="w-16 bg-gray-900 border border-gray-700 rounded-lg p-2 text-center text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 disabled:bg-gray-800 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label={`Number of shots for scene ${index + 1}`}
                  disabled={promptFormat === 'hailuo-compact'}
                />
              </div>
              <button
                onClick={() => handleDeleteScene(index)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors self-center mt-5"
                aria-label={`Delete scene ${index + 1}`}>
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddScene}
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-purple-300 font-semibold hover:bg-purple-500/10 rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Add Scene
        </button>
      </div>

      {/* Step 4: Select Style */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          4. Select a Base Style
        </label>
        <div className="relative">
          <div className="aspect-w-16 aspect-h-9 w-full bg-gray-700 rounded-lg overflow-hidden mb-2">
            <img
              src={selectedStyle.imageUrl}
              alt={`${selectedStyle.name} style preview`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CINEMATIC_STYLES.map((style) => (
              <button
                key={style.name}
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  selectedStyle.name === style.name
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                title={style.description}>
                {style.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 5: Generation Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          5. Generation Options
        </label>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
            <span className="text-gray-200" id="sb-visuals-label">
              Generate visual storyboard images
            </span>
            <button
              type="button"
              onClick={() => onGenerateVisualsChange(!generateVisuals)}
              className={`${
                generateVisuals ? 'bg-purple-600' : 'bg-gray-600'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
              role="switch"
              aria-checked={generateVisuals}
              aria-labelledby="sb-visuals-label">
              <span
                aria-hidden="true"
                className={`${
                  generateVisuals ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-400 -mt-2 px-1">
            Disable this to only generate the director's prompts, which is faster
            and cheaper.
          </p>

          <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
            <span className="text-gray-200" id="sb-text-on-image-label">
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
              aria-labelledby="sb-text-on-image-label"
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
            If off, the AI will avoid generating text on storyboard images.
            {!generateVisuals && (
              <span className="text-yellow-500">
                (Disabled because visual generation is off)
              </span>
            )}
          </p>
        </div>
      </div>


      {/* Step 6: Prompt Format */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          6. Select Prompt Format
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
            ? 'Generates a highly detailed JSON array, one object per shot. Best for maximum control.'
            : 'Generates a compact JSON object (< 2000 chars) for the whole video. Number of shots is disabled.'}
        </p>
      </div>

      {/* Step 7: Generate Visual Storyboard & Prompt */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          7. Generate Storyboard & Director's Prompts
        </label>
        <button
          onClick={handleGenerateStoryboard}
          disabled={allScenesEmpty || isGenerating}
          className="w-full flex justify-center items-center gap-2 mb-3 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-base">
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Generate with AI</span>
            </>
          )}
        </button>
        <CostEstimator
          imageFile={imageFile}
          scenes={scenes}
          generateVisuals={generateVisuals}
        />
      </div>
    </>
  );
};

const VideoTypeSelector: React.FC<{
  selected: VideoType;
  onSelect: (type: VideoType) => void;
}> = ({selected, onSelect}) => {
  const types = [
    {
      id: 'storyboard' as VideoType,
      name: 'Cinematic Storyboard',
      description: 'Create a narrative from scenes.',
      icon: VideoCameraIcon,
      enabled: true,
    },
    {
      id: 'explainer' as VideoType,
      name: 'Explainer Video',
      description: 'Generate a script and visuals for a topic.',
      icon: BookOpenIcon,
      enabled: true,
    },
    {
      id: 'logo' as VideoType,
      name: 'Logo Animation',
      description: 'Animate your brand identity.',
      icon: CubeTransparentIcon,
      enabled: true,
    },
    {
      id: 'kinetic' as VideoType,
      name: 'Kinetic Typography',
      description: 'Animate text with dynamic motion.',
      icon: Bars3BottomLeftIcon,
      enabled: true,
    },
    {
      id: 'introOutro' as VideoType,
      name: 'YouTube Intro/Outro',
      description: 'Brand your channel videos.',
      icon: FilmIcon,
      enabled: true,
    },
    {
      id: 'musicVideo' as VideoType,
      name: 'Music Video',
      description: 'Create visuals for your audio.',
      icon: MusicalNoteIcon,
      enabled: false,
    },
    {
      id: 'cashCow' as VideoType,
      name: 'Cash Cow Content',
      description: 'Automated faceless videos.',
      icon: CurrencyDollarIcon,
      enabled: false,
    },
  ];

  return (
    <div className="w-full max-w-5xl py-10 px-4">
      <h2 className="text-2xl font-bold text-center mb-2">
        Welcome to the AI Film Studio
      </h2>
      <p className="text-center text-gray-400 mb-8">
        What kind of video are you creating today?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              if (type.enabled) {
                onSelect(type.id);
                trackEvent('select_video_type', {video_type: type.id});
              }
            }}
            disabled={!type.enabled}
            className={`p-4 rounded-lg text-left transition-all transform hover:-translate-y-1 disabled:transform-none ${
              selected === type.id
                ? 'bg-gray-700 ring-2 ring-purple-500 shadow-lg'
                : 'bg-gray-800 hover:bg-gray-700'
            } ${
              !type.enabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}>
            <div className="flex items-center gap-3 mb-2">
              <type.icon
                className={`w-7 h-7 flex-shrink-0 ${
                  selected === type.id ? 'text-purple-400' : 'text-gray-400'
                }`}
              />
              <h3 className="font-semibold text-white">{type.name}</h3>
            </div>
            <p className="text-xs text-gray-400">{type.description}</p>
            {!type.enabled && (
              <span className="text-xs text-yellow-400 block mt-2">
                Coming Soon
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const AnimateImagePage: React.FC<AnimateImagePageProps> = ({
  onAnimate,
  onPlayVideo,
  onGenerateStoryboard,
  onGenerateLogoPrompt,
  onGenerateYouTubeIntroPrompt,
  onGenerateExplainerVideoPrompt,
  onGenerateKineticTypographyPrompt,
  onGenerateImageForCard,
  onGenerateSceneDescriptions,
  onGenerateNextScene,
}) => {
  const {user, login, logout, isLoading} = useAuth();
  const [masterPrompt, setMasterPrompt] = useState('');
  const [visualStoryboard, setVisualStoryboard] = useState<(string | null)[]>(
    [],
  );
  const [explainerScenes, setExplainerScenes] =
    useState<VisualExplainerScene[] | null>(null);
  const [isGeneratingExplainerImages, setIsGeneratingExplainerImages] =
    useState(false);
  const [explainerIncludeTextOnImage, setExplainerIncludeTextOnImage] =
    useState(true);
  const [explainerGenerateVisuals, setExplainerGenerateVisuals] =
    useState(true);

  const [logoIncludeTextOnImage, setLogoIncludeTextOnImage] = useState(true);
  const [ytIncludeTextOnImage, setYtIncludeTextOnImage] = useState(true);
  const [kineticIncludeTextOnImage, setKineticIncludeTextOnImage] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingNextScene, setIsGeneratingNextScene] = useState(false);
  const [videoType, setVideoType] = useState<VideoType>('storyboard');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompts');

  const [activeView, setActiveView] = useState<'creator' | 'history'>(
    'creator',
  );
  const [itemToLoad, setItemToLoad] = useState<HistoryItem | null>(null);

  // --- State for StoryboardGenerator ---
  const [sbScenes, setSbScenes] = useState<Scene[]>([
    {description: '', shotCount: 1},
  ]);
  const [sbImageFile, setSbImageFile] = useState<File | null>(null);
  const [sbImagePreview, setSbImagePreview] = useState<string | null>(null);
  const [sbSelectedStyle, setSbSelectedStyle] = useState(CINEMATIC_STYLES[0]);
  const [sbPromptFormat, setSbPromptFormat] =
    useState<PromptFormat>('detailed-cinematic');
  const [sbGeneralIdea, setSbGeneralIdea] = useState('');
  const [sbSceneCount, setSbSceneCount] = useState(3);
  const [sbIncludeTextOnImage, setSbIncludeTextOnImage] = useState(true);
  const [sbGenerateVisuals, setSbGenerateVisuals] = useState(true);


  const resetStoryboardState = () => {
    setSbScenes([{description: '', shotCount: 1}]);
    setSbImageFile(null);
    setSbImagePreview(null);
    setSbSelectedStyle(CINEMATIC_STYLES[0]);
    setSbPromptFormat('detailed-cinematic');
    setSbGeneralIdea('');
    setSbSceneCount(3);
    setSbIncludeTextOnImage(true);
    setSbGenerateVisuals(true);
  };

  useEffect(() => {
    // Clear outputs when switching video types, but not if we are loading an item
    if (itemToLoad && itemToLoad.type === videoType) {
      return;
    }
    setMasterPrompt('');
    setVisualStoryboard([]);
    setExplainerScenes(null);
    setItemToLoad(null);
    resetStoryboardState();
  }, [videoType]);

  useEffect(() => {
    if (itemToLoad) {
      setVideoType(itemToLoad.type);
      setMasterPrompt(itemToLoad.prompt);
      if (itemToLoad.visuals) {
        setVisualStoryboard(itemToLoad.visuals);
      }
      if (itemToLoad.type === 'explainer') {
        setExplainerScenes(null);
        // Reset toggle to default when loading
        setExplainerIncludeTextOnImage(true);
        setExplainerGenerateVisuals(true);
      }
      if (itemToLoad.type === 'logo') {
        setLogoIncludeTextOnImage(true);
      }
      if (itemToLoad.type === 'introOutro') {
        setYtIncludeTextOnImage(true);
      }
      if (itemToLoad.type === 'kinetic') {
        setKineticIncludeTextOnImage(true);
      }
      if (itemToLoad.type === 'storyboard') {
        const inputs = itemToLoad.inputs as any; // Use any to check for old format
        if (inputs.scenes.length > 0 && typeof inputs.scenes[0] === 'string') {
          // This is the old format (string[])
          const migratedScenes = inputs.scenes.map((desc: string) => ({
            description: desc,
            shotCount: 1,
          }));
          setSbScenes(migratedScenes);
        } else {
          // This is the new format ({ description, shotCount }[])
          setSbScenes(inputs.scenes);
        }

        setSbSelectedStyle(
          CINEMATIC_STYLES.find(
            (s) => s.name === (inputs as StoryboardInputs).selectedStyleName,
          ) ?? CINEMATIC_STYLES[0],
        );
        // Reset file-based inputs as they cannot be loaded from history
        setSbImageFile(null);
        setSbImagePreview(null);
        setSbIncludeTextOnImage(true); // Reset to default
        setSbGenerateVisuals(true); // Reset to default
      }
    }
  }, [itemToLoad]);

  // Generate images for explainer video scenes when the prompt is ready
  useEffect(() => {
    if (videoType === 'explainer' && masterPrompt) {
      let scenes;
      try {
        scenes = JSON.parse(masterPrompt);
        // We only generate a visual storyboard for the detailed format (array)
        if (!Array.isArray(scenes)) {
          setExplainerScenes([]); // Set to empty array to indicate we are done but have no visuals
          return;
        }
      } catch (e) {
        setExplainerScenes(null); // Invalid JSON
        return;
      }

      if (!explainerGenerateVisuals) {
        const scenesWithoutImages: VisualExplainerScene[] = scenes.map(
          (sceneData) => ({
            sceneData,
            image: null,
          }),
        );
        setExplainerScenes(scenesWithoutImages);
        return;
      }

      setIsGeneratingExplainerImages(true);
      const generateImages = async () => {
        const imagePromises = scenes.map((scene) => {
          const prompt =
            scene.description ||
            'No description provided for this explainer scene.';
          return onGenerateImageForCard(prompt, explainerIncludeTextOnImage);
        });
        const imageResults = await Promise.allSettled(imagePromises);

        const combinedScenes: VisualExplainerScene[] = scenes.map(
          (sceneData, index) => {
            const imageResult = imageResults[index];
            return {
              sceneData,
              image:
                imageResult.status === 'fulfilled' ? imageResult.value : null,
            };
          },
        );
        setExplainerScenes(combinedScenes);
        setIsGeneratingExplainerImages(false);
      };

      generateImages();
    }
  }, [
    videoType,
    masterPrompt,
    onGenerateImageForCard,
    explainerIncludeTextOnImage,
    explainerGenerateVisuals,
  ]);

  // If user logs out, switch back to the creator view
  useEffect(() => {
    if (!user && activeView === 'history') {
      setActiveView('creator');
    }
  }, [user, activeView]);

  const handleLoadItem = (item: HistoryItem) => {
    setItemToLoad(item);
    setActiveView('creator');
    trackEvent('load_history_item', {video_type: item.type});
  };

  const handlePromptGenerated = (prompt: string) => {
    setMasterPrompt(prompt);
    if (videoType !== 'explainer') {
      setExplainerScenes(null);
    }
    // A new prompt was generated, so we are no longer in a "loaded" state
    setItemToLoad(null);
  };

  const handleGenerateScene = () => {
    if (masterPrompt) {
      let finalPrompt = masterPrompt; // Default to whole prompt

      // Try to extract the first prompt from the JSON structure
      try {
        const parsed = JSON.parse(masterPrompt);
        let firstScenePrompt = '';
        if (Array.isArray(parsed) && parsed.length > 0) {
          firstScenePrompt = parsed[0].description;
        } else if (typeof parsed === 'object' && parsed !== null) {
          firstScenePrompt = parsed.description;
        }

        if (firstScenePrompt) {
          finalPrompt = firstScenePrompt;
        }
      } catch (e) {
        // Not valid JSON, this is an error state but we can try to generate with the raw text
        console.error('Master prompt is not valid JSON.', e);
      }

      finalPrompt = finalPrompt.trim() === '' ? masterPrompt : finalPrompt;

      let includeText = true;
      if (videoType === 'storyboard') {
        includeText = sbIncludeTextOnImage;
      } else if (videoType === 'explainer') {
        includeText = explainerIncludeTextOnImage;
      } else if (videoType === 'logo') {
        includeText = logoIncludeTextOnImage;
      } else if (videoType === 'introOutro') {
        includeText = ytIncludeTextOnImage;
      } else if (videoType === 'kinetic') {
        includeText = kineticIncludeTextOnImage;
      }

      trackEvent('generate_final_scene', {
        video_type: videoType,
        prompt_length: finalPrompt.length,
        include_text_on_image: includeText,
      });

      if (videoType === 'logo' && logoFile) {
        onAnimate(finalPrompt, logoFile, includeText);
      } else {
        onAnimate(finalPrompt, null, includeText);
      }
    }
  };

  const handleGenerateNextSceneClick = async () => {
    setIsGeneratingNextScene(true);
    trackEvent('generate_next_scene', {
      current_scene_count: sbScenes.length,
      include_text_on_image: sbIncludeTextOnImage,
    });
    try {
      const {newSceneDescription, newScenePrompt, newVisual} =
        await onGenerateNextScene(
          masterPrompt,
          visualStoryboard,
          sbScenes.map(s => s.description),
          sbImageFile,
          sbSelectedStyle.name,
          sbIncludeTextOnImage,
        );

      // Update states
      setSbScenes((prev) => [...prev, {description: newSceneDescription, shotCount: 1}]);
      setVisualStoryboard((prev) => [...prev, newVisual]);

      const updatedPromptArray = [...JSON.parse(masterPrompt), newScenePrompt];
      setMasterPrompt(JSON.stringify(updatedPromptArray, null, 2));
    } catch (error) {
      console.error('Failed to generate next scene:', error);
      // You may want to show an error to the user here
    } finally {
      setIsGeneratingNextScene(false);
    }
  };

  const handleCopyPrompts = () => {
    if (masterPrompt) {
      navigator.clipboard.writeText(masterPrompt);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Prompts'), 2000);
      trackEvent('copy_prompts', {
        prompt_length: masterPrompt.length,
        video_type: videoType,
      });
    }
  };

  const handlePlayGalleryVideo = (video: Video) => {
    trackEvent('play_gallery_video', {
      video_id: video.id,
      video_title: video.title,
    });
    onPlayVideo(video);
  };

  const scrollToGenerator = () => {
    document
      .getElementById('generator-section')
      ?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const handleHistoryClick = () => {
    if (user) {
      setActiveView('history');
    } else {
      login();
    }
  };

  const renderOutputSection = () => {
    if (videoType === 'explainer') {
      return (
        <ExplainerStoryboardOutput
          data={explainerScenes}
          isLoading={isGeneratingExplainerImages}
          fullPrompt={masterPrompt}
          onEditPrompt={setMasterPrompt}
        />
      );
    }

    if (
      videoType === 'storyboard' ||
      videoType === 'logo' ||
      videoType === 'introOutro' ||
      videoType === 'kinetic'
    ) {
      return (
        <div className="mb-6 mt-6 border-t border-gray-700 pt-6">
          <label
            htmlFor="master-prompt"
            className="block text-sm font-medium text-gray-300 mb-2">
            Refine the Director's Prompt(s) (JSON)
          </label>
          <textarea
            id="master-prompt"
            rows={12}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 font-mono text-sm"
            value={masterPrompt}
            onChange={(e) => setMasterPrompt(e.target.value)}
            placeholder="The AI-generated director's prompt(s) will appear here. You can edit the result before final generation."
            aria-label="Master animation prompt"
          />
        </div>
      );
    }
    return null;
  };

  const renderCreatorStudio = () => (
    <>
      <section
        id="generator-section"
        className="w-full py-16 flex flex-col items-center px-4 bg-black/20">
        <VideoTypeSelector
          selected={videoType}
          onSelect={(type) => {
            if (activeView === 'history') setActiveView('creator');
            setVideoType(type);
          }}
        />

        <div className="w-full max-w-2xl bg-gray-800 p-6 md:p-8 rounded-lg shadow-2xl mt-8">
          <main>
            {videoType === 'storyboard' && (
              <StoryboardGenerator
                onGenerateStoryboard={onGenerateStoryboard}
                onGenerateSceneDescriptions={onGenerateSceneDescriptions}
                onPromptGenerated={handlePromptGenerated}
                onVisualsGenerated={setVisualStoryboard}
                // Pass state and setters
                scenes={sbScenes}
                setScenes={setSbScenes}
                imageFile={sbImageFile}
                setImageFile={setSbImageFile}
                imagePreview={sbImagePreview}
                setImagePreview={setSbImagePreview}
                selectedStyle={sbSelectedStyle}
                setSelectedStyle={setSbSelectedStyle}
                promptFormat={sbPromptFormat}
                setPromptFormat={setSbPromptFormat}
                generalIdea={sbGeneralIdea}
                setGeneralIdea={setSbGeneralIdea}
                sceneCount={sbSceneCount}
                setSceneCount={setSbSceneCount}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                includeTextOnImage={sbIncludeTextOnImage}
                onIncludeTextOnImageChange={setSbIncludeTextOnImage}
                generateVisuals={sbGenerateVisuals}
                onGenerateVisualsChange={setSbGenerateVisuals}
              />
            )}
            {videoType === 'explainer' && (
              <ExplainerVideoGenerator
                onGenerateExplainerVideoPrompt={onGenerateExplainerVideoPrompt}
                onPromptGenerated={handlePromptGenerated}
                initialData={
                  itemToLoad?.type === 'explainer'
                    ? (itemToLoad.inputs as ExplainerInputs)
                    : undefined
                }
                includeTextOnImage={explainerIncludeTextOnImage}
                onIncludeTextOnImageChange={setExplainerIncludeTextOnImage}
                generateVisuals={explainerGenerateVisuals}
                onGenerateVisualsChange={setExplainerGenerateVisuals}
              />
            )}
            {videoType === 'logo' && (
              <LogoAnimator
                onGenerateLogoPrompt={onGenerateLogoPrompt}
                onPromptGenerated={handlePromptGenerated}
                onLogoSelected={setLogoFile}
                initialData={
                  itemToLoad?.type === 'logo'
                    ? (itemToLoad.inputs as LogoInputs)
                    : undefined
                }
                includeTextOnImage={logoIncludeTextOnImage}
                onIncludeTextOnImageChange={setLogoIncludeTextOnImage}
              />
            )}
            {videoType === 'introOutro' && (
              <YouTubeIntroGenerator
                onGenerateYouTubeIntroPrompt={onGenerateYouTubeIntroPrompt}
                onPromptGenerated={handlePromptGenerated}
                initialData={
                  itemToLoad?.type === 'introOutro'
                    ? (itemToLoad.inputs as YouTubeIntroInputs)
                    : undefined
                }
                includeTextOnImage={ytIncludeTextOnImage}
                onIncludeTextOnImageChange={setYtIncludeTextOnImage}
              />
            )}
            {videoType === 'kinetic' && (
               <KineticTypographyGenerator
                onGenerateKineticTypographyPrompt={onGenerateKineticTypographyPrompt}
                onPromptGenerated={handlePromptGenerated}
                initialData={
                  itemToLoad?.type === 'kinetic'
                    ? (itemToLoad.inputs as KineticTypographyInputs)
                    : undefined
                }
                includeTextOnImage={kineticIncludeTextOnImage}
                onIncludeTextOnImageChange={setKineticIncludeTextOnImage}
              />
            )}
            {(videoType === 'musicVideo' || videoType === 'cashCow') && (
              <div className="text-center py-10">
                <h3 className="text-xl font-bold text-white">Coming Soon!</h3>
                <p className="text-gray-400 mt-2">
                  This feature is currently under development. Stay tuned!
                </p>
              </div>
            )}
          </main>

          {videoType === 'storyboard' && visualStoryboard.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Visual Storyboard
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {visualStoryboard.map((imageSrc, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-w-4 aspect-h-3 bg-gray-700 rounded-lg overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={`data:image/jpeg;base64,${imageSrc}`}
                          alt={`Generated visual for Scene ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                          <PhotoIcon className="w-8 h-8 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500">
                            No image generated
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-tr-lg rounded-bl-lg">
                      Scene {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renderOutputSection()}

          {masterPrompt && (
            <footer className="flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-gray-700 pt-6 mt-6">
              <button
                onClick={handleCopyPrompts}
                disabled={!masterPrompt}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2">
                <ClipboardDocumentListIcon className="w-5 h-5" />
                {copyButtonText}
              </button>
              {videoType === 'storyboard' &&
                sbPromptFormat === 'detailed-cinematic' && (
                  <button
                    onClick={handleGenerateNextSceneClick}
                    disabled={isGenerating || isGeneratingNextScene}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-base flex justify-center items-center gap-2">
                    {isGeneratingNextScene ? (
                      <>
                        <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        Generate Next Scene
                      </>
                    )}
                  </button>
                )}
              <button
                onClick={handleGenerateScene}
                disabled={!masterPrompt || isGenerating || isGeneratingNextScene}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-base">
                Generate Example Scene
              </button>
            </footer>
          )}
        </div>
      </section>
    </>
  );

  return (
    <div className="bg-gray-900 text-gray-100 font-sans flex flex-col items-center animate-fade-in w-full">
      {/* Hero Section */}
      <header className="w-full text-center py-20 sm:py-32 px-4 relative">
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-24 bg-white/10 animate-pulse rounded-lg"></div>
          ) : user ? (
            <>
              <p
                className="text-sm text-gray-300 hidden sm:block"
                aria-label={`Logged in as ${user.email}`}>
                <span className="font-semibold text-white truncate max-w-[150px] inline-block align-middle">
                  {user.email}
                </span>
              </p>
              <button
                onClick={() => setActiveView('history')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg bg-white/10 text-gray-200 border border-white/20 hover:bg-white/20 transition-colors"
                aria-label="View your generation history">
                <BookOpenIcon className="w-5 h-5" />
                <span className="hidden sm:inline">My History</span>
              </button>
              <button
                onClick={logout}
                className="px-3 py-2 text-xs sm:text-sm rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/40 transition-colors"
                aria-label="Logout">
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleHistoryClick}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-white/10 text-gray-200 border border-white/20 hover:bg-white/20 transition-colors"
              aria-label="Login to view history">
              <BookOpenIcon className="w-5 h-5" />
              Login / My History
            </button>
          )}
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
          AI Video Generator.
          <br />
          <span className="text-purple-400">
            Professional Results, Zero Guesswork.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Our AI film studio guides you from concept to final cut. Create
          stunning logo animations, storyboards, and more with unparalleled
          style consistency.
        </p>
        <button
          onClick={scrollToGenerator}
          className="px-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-transform transform hover:scale-105 text-lg shadow-lg hover:shadow-purple-500/50">
          Start Creating for Free
        </button>
      </header>

      {/* Main Content Area */}
      {activeView === 'creator' && (
        <>
          {/* How it works Section */}
          <section className="w-full max-w-6xl py-16 px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              The Fine-Tuned Filming Process
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center p-4">
                <div className="bg-gray-800 p-5 rounded-full mb-4 ring-2 ring-gray-700">
                  <PhotoIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Set the Style</h3>
                <p className="text-gray-400 max-w-xs">
                  Upload a reference image or choose a cinematic style to ensure
                  visual consistency.
                </p>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="bg-gray-800 p-5 rounded-full mb-4 ring-2 ring-gray-700">
                  <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  2. Build Your Narrative
                </h3>
                <p className="text-gray-400 max-w-xs">
                  Use our specialized tools to describe your scenes, animations,
                  or concepts.
                </p>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="bg-gray-800 p-5 rounded-full mb-4 ring-2 ring-gray-700">
                  <SparklesIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  3. Generate & Refine
                </h3>
                <p className="text-gray-400 max-w-xs">
                  Our AI crafts professional, individual prompts for each scene
                  that you can fine-tune.
                </p>
              </div>
            </div>
          </section>

          {renderCreatorStudio()}
        </>
      )}

      {activeView === 'history' && (
        <HistoryPage
          onLoadItem={handleLoadItem}
          onSwitchToCreator={() => setActiveView('creator')}
        />
      )}

      <AdPlaceholder className="max-w-4xl px-4" />

      {/* Features & Gallery Sections (conditionally rendered or always visible) */}
      <section className="w-full max-w-6xl py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Your Vision, Amplified
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <h3 className="text-xl font-semibold">
                Credit-Saving Efficiency
              </h3>
            </div>
            <p className="text-gray-400">
              Our fine-tuned process minimizes wasted attempts, ensuring you get
              your desired shot faster and for less cost.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <ChainIcon className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <h3 className="text-xl font-semibold">Guaranteed Consistency</h3>
            </div>
            <p className="text-gray-400">
              Maintain character, style, and narrative cohesion across every
              scene. Our AI remembers your story.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <FilmIcon className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <h3 className="text-xl font-semibold">Professional Toolset</h3>
            </div>
            <p className="text-gray-400">
              Go beyond simple generation. Control camera movement, shot
              sequences, and cinematic language like a real director.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="w-full max-w-7xl py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          Showcase: From Concept to Cinema
        </h2>
        <p className="text-center text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
          Explore a diverse range of styles our AI can produce. Hover to see
          still concepts brought to life.
        </p>
        <VideoGrid videos={GALLERY_ITEMS} onPlayVideo={handlePlayGalleryVideo} />
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center space-x-6 mb-4">
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              About Us
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              Contact Us
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              Terms of Service
            </a>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CineGen AI. All rights reserved.
            An AI Studio Project.
          </p>
        </div>
      </footer>
    </div>
  );
};
