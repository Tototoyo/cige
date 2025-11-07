/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Interface defining the structure of a video object, including its ID, URL,
 * title, and description.
 */
export interface Video {
  id: string;
  videoUrl: string;
  imageUrl: string;
  title: string;
  description: string;
}

export type PromptFormat = 'detailed-cinematic' | 'hailuo-compact';

export type VideoType =
  | 'storyboard'
  | 'logo'
  | 'introOutro'
  | 'musicVideo'
  | 'cashCow'
  | 'explainer'
  | 'kinetic';

export interface User {
  email: string;
}

// --- Input types for reloading generators ---

export interface StoryboardInputs {
  scenes: {description: string; shotCount: number}[];
  selectedStyleName: string;
  // Note: imageFile cannot be persisted in localStorage
}

export interface LogoInputs {
  animationStyle: string;
  background: string;
  sfx: string;
  tagline: string;
  // Note: logoFile cannot be persisted in localStorage
}

export interface YouTubeIntroInputs {
  channelName: string;
  videoTopic: string;
  visualStyle: string;
  energy: string;
  specificElements: string;
}

export interface ExplainerInputs {
  topic: string;
  keyPoints: string[];
  visualStyle: string;
  audience: string;
  cta: string;
  duration: string;
}

export interface KineticTypographyInputs {
  script: string;
  visualStyle: string;
  energy: string;
  background: string;
  colorPalette: string;
  music: string;
}

// --- History Item Structure ---

export interface HistoryItem {
  id: string;
  type: VideoType;
  title: string;
  prompt: string; // The generated prompt
  timestamp: number;
  visuals?: (string | null)[]; // base64 images for storyboards
  inputs:
    | StoryboardInputs
    | LogoInputs
    | YouTubeIntroInputs
    | ExplainerInputs
    | KineticTypographyInputs;
}
